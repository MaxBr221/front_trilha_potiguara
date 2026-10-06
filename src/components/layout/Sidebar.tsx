'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { OcaIcon, ArcoFlechaIcon, CocarIcon, GuerreiroIcon, MaracaIcon, TriboIcon } from '@/components/icons/IndigenousIcons';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import Image from 'next/image';

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAutenticacao();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: OcaIcon },
    { name: 'Trilhas', href: '/trilhas', icon: ArcoFlechaIcon },
    { name: 'Conquistas', href: '/conquistas', icon: CocarIcon },
    { name: 'Amigos', href: '/amigos', icon: TriboIcon },
    { name: 'Perfil', href: '/perfil', icon: GuerreiroIcon },
    { name: 'Dicionário', href: '/dicionario', icon: MaracaIcon },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`w-64 bg-[#f8f5f2]/90 dark:bg-[#1f1d1a]/90 backdrop-blur-md border-r border-stone-200 dark:border-stone-800 h-dvh flex flex-col fixed md:sticky top-0 left-0 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      <div className="p-6">
        <Link href="/dashboard" onClick={() => onClose && onClose()} className="flex items-center gap-2 text-primary font-bold text-2xl">
          <Image src="/images/logo-camarao.jpg" alt="Logo Camarão" width={32} height={32} className="w-8 h-8 rounded-full shadow-sm object-cover" />
          <span>Tupi Digital</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => onClose && onClose()}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-200 dark:border-stone-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-stone-600 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
    </>
  );
}
