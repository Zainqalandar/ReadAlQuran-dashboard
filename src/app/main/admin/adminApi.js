import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { analyticsApiBase } from '../analytics/analyticsApiConfig';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${analyticsApiBase}/api/admin/`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['AdminUsers'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getAdminUsers: builder.query({
      query: () => 'users',
      providesTags: ['AdminUsers'],
    }),
    deleteFeedback: builder.mutation({
      query: (id) => ({
        url: `feedback/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    broadcastNotification: builder.mutation({
      query: (body) => ({
        url: 'notifications/broadcast',
        method: 'POST',
        body,
      }),
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
  useDeleteFeedbackMutation,
  useBroadcastNotificationMutation,
} = adminApi;
