import { api } from '@/lib/api';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  totalCompanies: number;
  totalTasks: number;
}

export interface ChartData {
  userGrowth: Array<{ date: string; count: number }>;
  applicationUsage: Array<{ name: string; userCount: number }>;
  taskStats: Array<{ date: string; count: number }>;
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    getDashboardCharts: builder.query<ChartData, void>({
      query: () => '/dashboard/charts',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetDashboardChartsQuery } = dashboardApi;
