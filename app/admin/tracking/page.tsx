'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash2, Plus } from 'lucide-react';
import { useGetAdminTrackingQuery } from '@/lib/features/admin/adminApi';

export default function TrackingPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminTrackingQuery({ page, limit: 10 });

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this tracking record?')) {
      try {
        // TODO: Implement delete tracking
        console.log('Delete tracking:', id);
      } catch (error) {
        console.error('Failed to delete tracking:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tracking Management</h1>
          <p className="text-muted-foreground">Manage all tracking records in the system</p>
        </div>
        <Button onClick={() => router.push('/admin/tracking/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Tracking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tracking Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Calories</th>
                  <th className="text-left p-4">Recipe</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((tracking: any) => (
                  <tr key={tracking.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{tracking.id}</td>
                    <td className="p-4">{tracking.user?.firstName} {tracking.user?.lastName}</td>
                    <td className="p-4">{tracking.name}</td>
                    <td className="p-4">{tracking.calories}</td>
                    <td className="p-4">{tracking.recipe?.name || 'N/A'}</td>
                    <td className="p-4">{format(new Date(tracking.created), 'MMM dd, yyyy')}</td>
                    <td className="p-4">
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(tracking.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {data?.data.length || 0} of {data?.total || 0} tracking records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!data || data.data.length < 10}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
