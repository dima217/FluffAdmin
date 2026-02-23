'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminReviewCreatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Review</h1>
          <p className="text-muted-foreground">This feature is not implemented on the backend yet</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Not available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Backend endpoint for creating reviews is not implemented (see /admin/reviews in backend).
            </p>
            <Button variant="outline" onClick={() => router.push('/admin/reviews')}>
              Go to Reviews
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
