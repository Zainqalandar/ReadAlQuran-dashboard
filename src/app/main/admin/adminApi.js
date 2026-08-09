import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { adminApiBase } from '../analytics/analyticsApiConfig';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: adminApiBase,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'AdminUsers',
    'GuestPushDevices',
    'NotificationDevices',
    'AdminActivity',
  ],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getAdminUsers: builder.query({
      query: () => ({
        url: 'alhuda',
        params: { path: 'users' },
      }),
      providesTags: ['AdminUsers'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: 'alhuda',
        method: 'DELETE',
        params: { path: `users/${id}` },
      }),
      invalidatesTags: ['AdminUsers', 'NotificationDevices', 'AdminActivity'],
    }),
    deleteFeedback: builder.mutation({
      query: (id) => ({
        url: 'alhuda',
        method: 'DELETE',
        params: { path: `feedback/${id}` },
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    getGuestPushDevices: builder.query({
      query: () => ({
        url: 'alhuda',
        params: { path: 'notifications/guest-devices' },
      }),
      providesTags: ['GuestPushDevices'],
    }),
    getNotificationDevices: builder.query({
      query: () => ({
        url: 'alhuda',
        params: { path: 'notifications/devices' },
      }),
      providesTags: ['NotificationDevices'],
    }),
    getAdminActivity: builder.query({
      query: () => ({
        url: 'alhuda',
        params: { path: 'notifications/activity' },
      }),
      providesTags: ['AdminActivity'],
    }),
    broadcastNotification: builder.mutation({
      query: (body) => ({
        url: 'alhuda',
        method: 'POST',
        params: { path: 'notifications/broadcast' },
        body,
      }),
      invalidatesTags: ['NotificationDevices'],
    }),
    broadcastGuestNotification: builder.mutation({
      query: (body) => ({
        url: 'alhuda',
        method: 'POST',
        params: { path: 'notifications/guest-broadcast' },
        body,
      }),
      invalidatesTags: ['GuestPushDevices', 'NotificationDevices'],
    }),
  }),
});

export function getAdminApiErrorMessage(error, fallbackMessage) {
  if (typeof error?.data?.message === 'string') {
    return error.data.message;
  }

  if (typeof error?.error === 'string') {
    return error.error;
  }

  return fallbackMessage;
}

export const {
  useGetAdminUsersQuery,
  useDeleteUserMutation,
  useGetGuestPushDevicesQuery,
  useGetNotificationDevicesQuery,
  useGetAdminActivityQuery,
  useDeleteFeedbackMutation,
  useBroadcastNotificationMutation,
  useBroadcastGuestNotificationMutation,
} = adminApi;
