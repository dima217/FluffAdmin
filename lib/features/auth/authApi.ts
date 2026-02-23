import { api } from '@/lib/api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { access: string; refresh: string },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: '/user/admin/sign-in',
        method: 'POST',
        body: credentials,
        credentials: 'include',
      }),
    }),
    refreshToken: builder.mutation<
      { access: string },
      { refresh: string }
    >({
      query: (body) => ({
        url: '/user/refresh',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useRefreshTokenMutation } = authApi;
