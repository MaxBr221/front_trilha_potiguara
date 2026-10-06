'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import { Sidebar } from '@/components/layout/Sidebar';
import { InternalNavbar } from '@/components/layout/InternalNavbar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, carregando } = useAutenticacao();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!carregando && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, carregando, router]);

  if (carregando) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-dvh bg-background overflow-hidden relative">
      <div 
        className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/images/pintura_potiguara.jpg')", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
      />
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col h-dvh overflow-hidden relative z-10 bg-[#f0ead6]/80 dark:bg-[#1f1a14]/85">
        <InternalNavbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
