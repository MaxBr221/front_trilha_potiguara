'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, LayoutDashboard, Map, Trophy, User, LogOut, Book } from 'lucide-react';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAutenticacao();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trilhas', href: '/trilhas', icon: Map },
    { name: 'Conquistas', href: '/conquistas', icon: Trophy },
    { name: 'Perfil', href: '/perfil', icon: User },
    { name: 'Dicionário', href: '/dicionario', icon: Book },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200 h-screen hidden md:flex flex-col sticky top-0 left-0">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-2xl">
          <Leaf className="w-8 h-8 text-primary" />
          <span>Tupi Digital</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
