'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout, type AuthState } from '@/lib/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, LogOut, ChefHat, ShoppingCart, MessageSquare, Activity } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth) as AuthState | undefined;
  const accessToken = auth?.accessToken ?? null;
  const isSuper = auth?.isSuper ?? false;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    } else if (!isSuper) {
      router.push('/');
    }
  }, [accessToken, isSuper, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!accessToken || !isSuper) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col relative">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          </Link>
          <Link href="/admin/recipes">
            <Button variant="ghost" className="w-full justify-start">
              <ChefHat className="mr-2 h-4 w-4" />
              Recipes
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Products
            </Button>
          </Link>
          <Link href="/admin/reviews">
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Reviews
            </Button>
          </Link>
          <Link href="/admin/tracking">
            <Button variant="ghost" className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Tracking
            </Button>
          </Link>
        </nav>
        <div className="mt-auto pt-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
