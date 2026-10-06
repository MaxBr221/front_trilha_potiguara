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
      <aside className={`w-64 bg-[#b04a32] dark:bg-[#7a2e16] border-r border-[#963c26] dark:border-[#5c210f] h-dvh flex flex-col fixed md:sticky top-0 left-0 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      <div className="p-6">
        <Link href="/dashboard" onClick={() => onClose && onClose()} className="flex items-center gap-2 text-white font-bold text-2xl">
          <Image src="/images/logo-potiguara.jpg" alt="Logo" width={32} height={32} className="w-8 h-8 rounded-full shadow-sm object-cover" />
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
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
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
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-white/80 hover:bg-red-900/40 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
    </>
  );
}
