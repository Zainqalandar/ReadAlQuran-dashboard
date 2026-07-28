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
  tagTypes: ['AdminUsers', 'GuestPushDevices'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getAdminUsers: builder.query({
      query: () => ({
        url: 'alhuda',
        params: { path: 'users' },
      }),
      providesTags: ['AdminUsers'],
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
    broadcastNotification: builder.mutation({
      query: (body) => ({
        url: 'alhuda',
        method: 'POST',
        params: { path: 'notifications/broadcast' },
        body,
      }),
    }),
    broadcastGuestNotification: builder.mutation({
      query: (body) => ({
        url: 'alhuda',
        method: 'POST',
        params: { path: 'notifications/guest-broadcast' },
        body,
      }),
      invalidatesTags: ['GuestPushDevices'],
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
  useGetGuestPushDevicesQuery,
  useDeleteFeedbackMutation,
  useBroadcastNotificationMutation,
  useBroadcastGuestNotificationMutation,
} = adminApi;
