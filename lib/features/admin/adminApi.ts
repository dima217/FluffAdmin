import { api } from '@/lib/api';

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_recipes: number;
  total_products: number;
  total_reviews: number;
  total_tracking: number;
  total_favorites: number;
  avg_recipe_rating: number;
  avg_review_score: number;
  users_with_tracking: number;
  users_with_favorites: number;
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      providesTags: ['Dashboard'],
    }),
    refreshAdminStats: builder.mutation<void, void>({
      query: () => ({
        url: '/admin/stats/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Dashboard'],
    }),
    getAdminUsers: builder.query<{ data: any[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/admin/users?page=${page}&limit=${limit}`,
      providesTags: ['Users'],
    }),
    getAdminUser: builder.query<any, number>({
      query: (id) => `/admin/users/${id}`,
      providesTags: ['Users'],
    }),
    updateUserStatus: builder.mutation<any, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/users/${id}/activate`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    getAdminRecipes: builder.query<{ data: any[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/admin/recipes?page=${page}&limit=${limit}`,
      providesTags: ['Recipes'],
    }),
    getAdminRecipesRequests: builder.query<{ data: any[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/admin/recipes/requests?page=${page}&limit=${limit}`,
      providesTags: ['Recipes'],
    }),
    getAdminRecipe: builder.query<any, number>({
      query: (id) => `/admin/recipes/${id}`,
      providesTags: ['Recipes'],
    }),
    deleteRecipe: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recipes'],
    }),
    createAdminRecipe: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/recipes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Recipes', 'Dashboard'],
    }),
    updateAdminRecipe: builder.mutation<any, { id: number; body: any }>({
      query: ({ id, body }) => ({
        url: `/admin/recipes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Recipes', 'Dashboard'],
    }),
    getAdminProducts: builder.query<{ data: any[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/admin/products?page=${page}&limit=${limit}`,
      providesTags: ['Products'],
    }),
    getAdminProduct: builder.query<any, number>({
      query: (id) => `/admin/products/${id}`,
      providesTags: ['Products'],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    createAdminProduct: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products', 'Dashboard'],
    }),
    updateAdminProduct: builder.mutation<any, { id: number; body: any }>({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Products', 'Dashboard'],
    }),
    getAdminReviews: builder.query<{ data: any[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/admin/reviews?page=${page}&limit=${limit}`,
      providesTags: ['Reviews'],
    }),
    getAdminTracking: builder.query<{ data: any[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/admin/tracking?page=${page}&limit=${limit}`,
      providesTags: ['Tracking'],
    }),
    getAdminAuthActivity: builder.query<
      Array<{ date: string; registrations: number; logins: number }>,
      { dateStart: string; dateEnd: string }
    >({
      query: ({ dateStart, dateEnd }) => `/admin/auth-activity?dateStart=${encodeURIComponent(dateStart)}&dateEnd=${encodeURIComponent(dateEnd)}`,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useRefreshAdminStatsMutation,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetAdminRecipesQuery,
  useGetAdminRecipeQuery,
  useDeleteRecipeMutation,
  useCreateAdminRecipeMutation,
  useUpdateAdminRecipeMutation,
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useGetAdminRecipesRequestsQuery,
  useDeleteProductMutation,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useGetAdminReviewsQuery,
  useGetAdminTrackingQuery,
  useGetAdminAuthActivityQuery,
} = adminApi;
