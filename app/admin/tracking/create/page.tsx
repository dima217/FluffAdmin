'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminTrackingCreatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Создание записи трекинга</h1>
          <p className="text-muted-foreground">Эта функция пока не реализована на бэкенде</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Недоступно</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Эндпоинт бэкенда для создания записей трекинга не реализован (см. /admin/tracking в бэкенде).
            </p>
            <Button variant="outline" onClick={() => router.push('/admin/tracking')}>
              Перейти к трекингу
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
