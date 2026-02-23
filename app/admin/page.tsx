'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ChefHat, ShoppingCart, MessageSquare, Activity, RefreshCw } from 'lucide-react';
import { useGetAdminAuthActivityQuery, useGetAdminStatsQuery, useRefreshAdminStatsMutation } from '@/lib/features/admin/adminApi';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();
  const [refreshStats] = useRefreshAdminStatsMutation();

  const { dateStart, dateEnd } = (() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 13);
    const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);
    return { dateStart: toIsoDate(start), dateEnd: toIsoDate(end) };
  })();

  const { data: authActivity, isLoading: isAuthActivityLoading } = useGetAdminAuthActivityQuery({
    dateStart,
    dateEnd,
  });

  const handleRefresh = async () => {
    try {
      await refreshStats().unwrap();
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform statistics</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_users || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_recipes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg rating: {Number(stats?.avg_recipe_rating || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg score: {Number(stats?.avg_review_score || 0).toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracking Records</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_tracking || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_favorites || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auth Activity (last 14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthActivityLoading ? (
            <div>Loading...</div>
          ) : (
            (() => {
              const items = authActivity ?? [];
              const max = Math.max(
                1,
                ...items.map((i) => Math.max(Number(i.registrations || 0), Number(i.logins || 0))),
              );

              if (items.length === 0) {
                return <div className="text-sm text-muted-foreground">No data</div>;
              }

              return (
                <div className="space-y-3">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
                      <span>Registrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
                      <span>Logins</span>
                    </div>
                  </div>

                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={items} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(v) => String(v).slice(5)} />
                        <YAxis allowDecimals={false} domain={[0, Math.max(1, max)]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                        <Line type="monotone" dataKey="logins" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>
    </div>
  );
}
