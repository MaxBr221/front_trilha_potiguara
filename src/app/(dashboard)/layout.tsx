'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import { Sidebar } from '@/components/layout/Sidebar';
import { InternalNavbar } from '@/components/layout/InternalNavbar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, carregando } = useAutenticacao();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, carregando, router]);

  if (carregando) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <InternalNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
