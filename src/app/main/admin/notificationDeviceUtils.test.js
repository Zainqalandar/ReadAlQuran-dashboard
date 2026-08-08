import {
  dedupeNotificationDevices,
  getDeliveryEventAt,
  getDeliverySourceLabel,
  getGuestDeviceLabel,
  getNotificationFunnel,
  normalizeRecentDeliveries,
  optionalCount,
} from './notificationDeviceUtils';

describe('notification device helpers', () => {
  it('uses the stable browser device id for guest labels', () => {
    expect(
      getGuestDeviceLabel({
        id: '9bd8afdb-7c01-41f5-8a00-89dcef784905',
        deviceId: '82cdb466-2d43-4949-80ff-ab764ff36906',
      })
    ).toBe('Guest 82CDB466');
  });

  it('falls back to the subscription id when a legacy row has no device id', () => {
    expect(getGuestDeviceLabel({ id: '9bd8afdb-7c01-41f5-8a00-89dcef784905' })).toBe(
      'Guest 9BD8AFDB'
    );
  });

  it('keeps missing displayed telemetry distinct from a reported zero', () => {
    expect(optionalCount(undefined)).toBeNull();
    expect(optionalCount(null)).toBeNull();
    expect(optionalCount(0)).toBe(0);
  });

  it('does not treat a normalized legacy zero as display telemetry', () => {
    expect(
      getNotificationFunnel({
        notificationSentCount: 5,
        notificationDisplayedCount: 0,
        notificationVisitCount: 1,
      })
    ).toMatchObject({
      trackedAccepted: null,
      displayed: null,
      trackedOpened: null,
      acceptedToDisplayedRate: null,
      displayedToOpenedRate: null,
    });
  });

  it('treats a delivery audit as evidence that a reported zero is tracked', () => {
    expect(
      getNotificationFunnel({
        notificationSentCount: 5,
        notificationTrackedSentCount: 5,
        notificationDisplayedCount: 0,
        notificationVisitCount: 0,
        notificationTrackedVisitCount: 0,
        recentDeliveries: [{ deliveryId: 'tracked-accept' }],
      })
    ).toMatchObject({
      displayed: 0,
      trackedAccepted: 5,
      trackedOpened: 0,
      acceptedToDisplayedRate: 0,
      displayedToOpenedRate: null,
    });
  });

  it('calculates provider accepted to displayed to opened rates', () => {
    expect(
      getNotificationFunnel({
        notificationSentCount: 20,
        notificationTrackedSentCount: 20,
        notificationDisplayedCount: 15,
        notificationVisitCount: 3,
        notificationTrackedVisitCount: 3,
      })
    ).toEqual({
      accepted: 20,
      trackedAccepted: 20,
      displayed: 15,
      opened: 3,
      trackedOpened: 3,
      acceptedToDisplayedRate: 75,
      displayedToOpenedRate: 20,
      acceptedToOpenedRate: 15,
    });
  });

  it('does not hide inconsistent telemetry by capping a rate at 100 percent', () => {
    expect(
      getNotificationFunnel({
        notificationSentCount: 1,
        notificationTrackedSentCount: 1,
        notificationDisplayedCount: 2,
        notificationVisitCount: 0,
        notificationTrackedVisitCount: 0,
      }).acceptedToDisplayedRate
    ).toBe(200);
  });

  it('labels scheduled and manual audit sources clearly', () => {
    expect(getDeliverySourceLabel('scheduled')).toBe('Scheduled');
    expect(getDeliverySourceLabel('admin-guest-broadcast')).toBe('Manual guest broadcast');
    expect(getDeliverySourceLabel('admin-user-broadcast')).toBe('Manual user broadcast');
    expect(getDeliverySourceLabel('general')).toBe('General');
  });

  it('normalizes, de-duplicates, sorts, and limits recent delivery audits', () => {
    const deliveries = normalizeRecentDeliveries([
      ...Array.from({ length: 11 }, (_, index) => ({
        deliveryId: `delivery-${index}`,
        source: index === 0 ? 'scheduled' : 'admin-guest-broadcast',
        status: index === 0 ? 'opened' : 'accepted',
        createdAt: `2026-08-08T0${Math.min(index, 9)}:00:00.000Z`,
        acceptedAt: `2026-08-08T0${Math.min(index, 9)}:01:00.000Z`,
        openedAt: index === 0 ? '2026-08-08T11:00:00.000Z' : undefined,
      })),
      {
        deliveryId: 'delivery-0',
        source: 'general',
        status: 'failed',
        createdAt: '2026-08-08T12:00:00.000Z',
      },
    ]);

    expect(deliveries).toHaveLength(10);
    expect(deliveries[0]).toMatchObject({
      deliveryId: 'delivery-0',
      source: 'scheduled',
      status: 'opened',
    });
    expect(getDeliveryEventAt(deliveries[0])).toBe('2026-08-08T11:00:00.000Z');
    expect(deliveries.filter((delivery) => delivery.deliveryId === 'delivery-0')).toHaveLength(1);
  });

  it('aggregates funnel counts for duplicate logical devices', () => {
    const devices = dedupeNotificationDevices([
      {
        id: 'old-subscription',
        deviceId: 'same-browser',
        ownerType: 'guest',
        enabled: false,
        lastSeenAt: '2026-08-08T03:00:00.000Z',
        notificationSentCount: 4,
        notificationTrackedSentCount: 3,
        notificationDisplayedCount: 3,
        notificationVisitCount: 1,
        notificationTrackedVisitCount: 1,
        recentDeliveries: [
          {
            deliveryId: 'older-delivery',
            source: 'scheduled',
            status: 'accepted',
            createdAt: '2026-08-08T02:55:00.000Z',
          },
        ],
      },
      {
        id: 'new-subscription',
        deviceId: 'same-browser',
        ownerType: 'guest',
        enabled: true,
        lastSeenAt: '2026-08-08T04:00:00.000Z',
        notificationSentCount: 2,
        notificationTrackedSentCount: 2,
        notificationDisplayedCount: 2,
        notificationVisitCount: 1,
        notificationTrackedVisitCount: 1,
        recentDeliveries: [
          {
            deliveryId: 'newer-delivery',
            source: 'admin-guest-broadcast',
            status: 'failed',
            failedAt: '2026-08-08T04:05:00.000Z',
            createdAt: '2026-08-08T04:00:00.000Z',
          },
        ],
      },
    ]);

    expect(devices).toHaveLength(1);
    expect(devices[0]).toMatchObject({
      id: 'new-subscription',
      enabled: true,
      notificationSentCount: 6,
      notificationTrackedSentCount: 5,
      notificationDisplayedCount: 5,
      notificationVisitCount: 2,
      notificationTrackedVisitCount: 2,
    });
    expect(devices[0].recentDeliveries.map((delivery) => delivery.deliveryId)).toEqual([
      'newer-delivery',
      'older-delivery',
    ]);
  });
});
