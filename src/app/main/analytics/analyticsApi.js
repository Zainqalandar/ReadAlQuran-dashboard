import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { adminApiBase } from './analyticsApiConfig';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: adminApiBase,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      async queryFn({ dateRange = {}, view }, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: 'alhuda',
          params: {
            path: 'analytics',
            ...dateRange,
            ...(view ? { view } : {}),
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        let data = result.data;

        if (view === 'traffic' && !data?.pageEventDetails?.length) {
          const fallbackResult = await baseQuery({
            url: 'alhuda',
            params: {
              path: 'analytics',
              ...dateRange,
            },
          });

          if (fallbackResult.data?.pageEventDetails?.length) {
            data = {
              ...data,
              pageEventDetails: fallbackResult.data.pageEventDetails,
              pageEventDetailsMeta: fallbackResult.data.pageEventDetailsMeta,
            };
          }
        }

        return { data };
      },
    }),
  }),
});

export function getAnalyticsErrorMessage(error, fallbackMessage) {
  if (typeof error?.data?.message === 'string') {
    return error.data.message;
  }

  if (typeof error?.error === 'string') {
    return error.error;
  }

  return fallbackMessage;
}

export const { useGetAnalyticsQuery } = analyticsApi;
