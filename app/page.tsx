'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect на login через 3 секунды
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Fluff Admin</h1>
          <Link href="/login">
            <Button>Войти в админку</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <h2 className="text-5xl font-bold">Добро пожаловать в админку</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Панель управления для Fluff приложения
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Войти</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Вы будете перенаправлены на страницу входа через несколько секунд...
          </p>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Fluff Admin. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
