function isPresentCount(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function safeCount(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

export function optionalCount(value) {
  return isPresentCount(value) ? safeCount(value) : null;
}

export function hasDisplayTelemetry(device) {
  const displayedCount = optionalCount(device?.notificationDisplayedCount);
  const trackedAcceptedCount = optionalCount(device?.notificationTrackedSentCount);

  return Boolean(
    device?.displayTelemetryAvailable === true ||
      device?.notificationDisplayTrackingAvailable === true ||
      (trackedAcceptedCount !== null && trackedAcceptedCount > 0) ||
      (Array.isArray(device?.recentDeliveries) && device.recentDeliveries.length > 0) ||
      device?.lastNotificationDisplayedAt ||
      (displayedCount !== null && displayedCount > 0)
  );
}

export function getGuestDeviceReference(device) {
  return String(device?.deviceId || device?.id || '').trim();
}

export function getGuestDeviceLabel(device) {
  const id = getGuestDeviceReference(device).replace(/-/g, '');
  return `Guest ${id.slice(0, 8).toUpperCase() || 'DEVICE'}`;
}

export function getNotificationDeviceLabel(device) {
  if (device?.ownerType === 'user') {
    return device.userName || device.userEmail || 'Signed-in reader';
  }

  return getGuestDeviceLabel(device);
}

export function getNotificationDeviceDetails(userAgent) {
  const value = String(userAgent || '');
  let browser = 'Unknown browser';
  let platform = 'Unknown platform';

  if (/Edg\//i.test(value)) browser = 'Microsoft Edge';
  else if (/Firefox\//i.test(value)) browser = 'Firefox';
  else if (/CriOS\//i.test(value)) browser = 'Chrome iOS';
  else if (/Chrome\//i.test(value)) browser = 'Chrome';
  else if (/Safari\//i.test(value)) browser = 'Safari';

  if (/Android/i.test(value)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(value)) platform = 'iOS / iPadOS';
  else if (/Windows/i.test(value)) platform = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(value)) platform = 'macOS';
  else if (/Linux/i.test(value)) platform = 'Linux';

  return { browser, platform };
}

export function getNotificationDeviceKey(device) {
  if (device?.ownerType !== 'user') {
    return `guest:${getGuestDeviceReference(device)}`;
  }

  if (device?.deviceId) {
    return `user:${device.userId}:${device.deviceId}`;
  }

  const details = getNotificationDeviceDetails(device?.userAgent);
  return `user:${device.userId}:${details.browser}:${details.platform}`;
}

export function percentageRate(numerator, denominator) {
  const normalizedDenominator = safeCount(denominator);
  if (normalizedDenominator === 0) {
    return null;
  }

  return (safeCount(numerator) / normalizedDenominator) * 100;
}

export function getNotificationFunnel(device) {
  const accepted = safeCount(device?.notificationSentCount);
  const trackedAccepted = optionalCount(device?.notificationTrackedSentCount);
  const displayed = hasDisplayTelemetry(device)
    ? safeCount(device?.notificationDisplayedCount)
    : null;
  const opened = safeCount(device?.notificationVisitCount);
  const trackedOpened = optionalCount(device?.notificationTrackedVisitCount);

  return {
    accepted,
    trackedAccepted,
    displayed,
    opened,
    trackedOpened,
    acceptedToDisplayedRate:
      displayed === null || trackedAccepted === null
        ? null
        : percentageRate(displayed, trackedAccepted),
    displayedToOpenedRate:
      displayed === null || trackedOpened === null
        ? null
        : percentageRate(trackedOpened, displayed),
    acceptedToOpenedRate:
      trackedAccepted === null || trackedOpened === null
        ? null
        : percentageRate(trackedOpened, trackedAccepted),
  };
}

export function latestNullableIso(left, right) {
  if (!left) return right || null;
  if (!right) return left;
  return String(left).localeCompare(String(right)) >= 0 ? left : right;
}

function normalizeNullableText(value) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

export function getDeliveryEventAt(delivery) {
  return (
    delivery?.openedAt ||
    delivery?.displayedAt ||
    delivery?.failedAt ||
    delivery?.acceptedAt ||
    delivery?.createdAt ||
    null
  );
}

export function getDeliverySourceLabel(source) {
  const normalized = String(source || 'general')
    .trim()
    .toLowerCase();

  if (normalized === 'scheduled') return 'Scheduled';
  if (normalized === 'admin-guest-broadcast') return 'Manual guest broadcast';
  if (normalized === 'admin-user-broadcast') return 'Manual user broadcast';
  if (normalized === 'user-notification') return 'User notification';
  if (normalized === 'general') return 'General';

  return normalized.replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function normalizeRecentDeliveries(value) {
  if (!Array.isArray(value)) return [];

  const deliveries = new Map();

  value.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;

    const delivery = {
      deliveryId: normalizeNullableText(entry.deliveryId),
      source: normalizeNullableText(entry.source) || 'general',
      campaignId: normalizeNullableText(entry.campaignId),
      notificationKind: normalizeNullableText(entry.notificationKind),
      status: normalizeNullableText(entry.status)?.toLowerCase() || 'pending',
      acceptedAt: normalizeNullableText(entry.acceptedAt),
      failedAt: normalizeNullableText(entry.failedAt),
      displayedAt: normalizeNullableText(entry.displayedAt),
      openedAt: normalizeNullableText(entry.openedAt),
      statusCode:
        entry.statusCode === null || entry.statusCode === undefined ? null : entry.statusCode,
      errorMessage: normalizeNullableText(entry.errorMessage),
      disabled: entry.disabled === true,
      createdAt: normalizeNullableText(entry.createdAt),
    };
    const fallbackKey = [delivery.source, delivery.campaignId, delivery.createdAt, index].join(':');
    const key = delivery.deliveryId || fallbackKey;

    if (!deliveries.has(key)) {
      deliveries.set(key, delivery);
    }
  });

  return Array.from(deliveries.values())
    .sort((left, right) => {
      const leftTime = new Date(getDeliveryEventAt(left) || 0).getTime();
      const rightTime = new Date(getDeliveryEventAt(right) || 0).getTime();
      const normalizedLeftTime = Number.isFinite(leftTime) ? leftTime : 0;
      const normalizedRightTime = Number.isFinite(rightTime) ? rightTime : 0;

      if (normalizedLeftTime !== normalizedRightTime) {
        return normalizedRightTime - normalizedLeftTime;
      }

      return String(right.deliveryId || '').localeCompare(String(left.deliveryId || ''));
    })
    .slice(0, 10);
}

export function normalizeNotificationDevice(device) {
  const recentDeliveries = normalizeRecentDeliveries(device?.recentDeliveries);
  const displayTelemetryAvailable = hasDisplayTelemetry({
    ...device,
    recentDeliveries,
  });

  return {
    ...device,
    enabled: device?.enabled !== false,
    contentPreference:
      device?.contentPreference || (device?.ownerType === 'guest' ? 'hadith' : 'balanced'),
    timeZone: device?.timeZone || 'UTC',
    notificationSentCount: safeCount(device?.notificationSentCount),
    notificationTrackedSentCount: optionalCount(device?.notificationTrackedSentCount),
    notificationDisplayedCount: displayTelemetryAvailable
      ? safeCount(device?.notificationDisplayedCount)
      : null,
    displayTelemetryAvailable,
    notificationVisitCount: safeCount(device?.notificationVisitCount),
    notificationTrackedVisitCount: optionalCount(device?.notificationTrackedVisitCount),
    totalVisitCount: safeCount(device?.totalVisitCount),
    lastTotalVisitAt: device?.lastTotalVisitAt || null,
    lastNotificationDisplayedAt: device?.lastNotificationDisplayedAt || null,
    failureCount: safeCount(device?.failureCount),
    recentDeliveries,
  };
}

export function dedupeNotificationDevices(items) {
  const logicalDevices = new Map();

  items.map(normalizeNotificationDevice).forEach((device) => {
    const key = getNotificationDeviceKey(device);
    const existing = logicalDevices.get(key);

    if (!existing) {
      logicalDevices.set(key, device);
      return;
    }

    const latest =
      String(device.lastSeenAt || '').localeCompare(String(existing.lastSeenAt || '')) >= 0
        ? device
        : existing;
    const latestVisit =
      String(device.lastNotificationVisitAt || '').localeCompare(
        String(existing.lastNotificationVisitAt || '')
      ) >= 0
        ? device
        : existing;
    const displayTelemetryAvailable =
      existing.displayTelemetryAvailable || device.displayTelemetryAvailable;
    const displayedCount = displayTelemetryAvailable
      ? safeCount(existing.notificationDisplayedCount) +
        safeCount(device.notificationDisplayedCount)
      : null;
    const trackedSentCount =
      existing.notificationTrackedSentCount === null &&
      device.notificationTrackedSentCount === null
        ? null
        : safeCount(existing.notificationTrackedSentCount) +
          safeCount(device.notificationTrackedSentCount);
    const trackedVisitCount =
      existing.notificationTrackedVisitCount === null &&
      device.notificationTrackedVisitCount === null
        ? null
        : safeCount(existing.notificationTrackedVisitCount) +
          safeCount(device.notificationTrackedVisitCount);

    logicalDevices.set(key, {
      ...latest,
      failureCount: Math.max(existing.failureCount, device.failureCount),
      lastSentAt: latestNullableIso(existing.lastSentAt, device.lastSentAt),
      lastEngagementAt: latestNullableIso(existing.lastEngagementAt, device.lastEngagementAt),
      notificationSentCount: existing.notificationSentCount + device.notificationSentCount,
      notificationTrackedSentCount: trackedSentCount,
      notificationDisplayedCount: displayedCount,
      displayTelemetryAvailable,
      notificationVisitCount: existing.notificationVisitCount + device.notificationVisitCount,
      notificationTrackedVisitCount: trackedVisitCount,
      totalVisitCount: Math.max(existing.totalVisitCount, device.totalVisitCount),
      lastTotalVisitAt: latestNullableIso(existing.lastTotalVisitAt, device.lastTotalVisitAt),
      lastNotificationDisplayedAt: latestNullableIso(
        existing.lastNotificationDisplayedAt,
        device.lastNotificationDisplayedAt
      ),
      lastNotificationVisitAt: latestNullableIso(
        existing.lastNotificationVisitAt,
        device.lastNotificationVisitAt
      ),
      lastNotificationCampaignId: latestVisit.lastNotificationCampaignId,
      lastNotificationKind: latestVisit.lastNotificationKind,
      recentDeliveries: normalizeRecentDeliveries([
        ...existing.recentDeliveries,
        ...device.recentDeliveries,
      ]),
    });
  });

  return Array.from(logicalDevices.values());
}
