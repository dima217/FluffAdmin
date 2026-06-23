'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ListPageSuspense } from '@/components/ListPageSuspense';
import { useListReturnPath } from '@/hooks/useListReturnPath';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@/lib/features/users/usersApi';
import { ArrowLeft } from 'lucide-react';

export default function UserDetailPage() {
  return (
    <ListPageSuspense>
      <UserDetailPageContent />
    </ListPageSuspense>
  );
}

function UserDetailPageContent() {
  const router = useRouter();
  const listReturnPath = useListReturnPath('/admin/users');
  const params = useParams();
  const id = Number(params.id);
  
  const { data: user, isLoading } = useGetUserByIdQuery(id);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    isActive: user?.isActive ?? true,
    isSuper: user?.isSuper ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ id, data: formData }).unwrap();
      alert('Пользователь успешно обновлён');
      router.push(listReturnPath);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Не удалось обновить пользователя');
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  // Update form when data loads
  if (user && !formData.firstName) {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      isSuper: user.isSuper,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push(listReturnPath)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Редактирование пользователя</h1>
          <p className="text-muted-foreground">Изменение данных пользователя</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Данные пользователя</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                Имя
              </label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Фамилия
              </label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Активен</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isSuper}
                  onChange={(e) => setFormData({ ...formData, isSuper: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Супер-админ</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(listReturnPath)}>
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
