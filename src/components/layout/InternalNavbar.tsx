'use client';

import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import { Menu, Flame, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { servicoDashboard, DashboardData } from '@/services/servicoDashboard';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export function InternalNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { usuario } = useAutenticacao();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (usuario) {
      servicoDashboard.obterDadosDashboard().then(setDashboard).catch(console.error);
    }
  }, [usuario]);
  
  const displayXp = dashboard?.xp ?? usuario?.xp ?? 0;
  const displayOfensiva = dashboard?.diasOfensiva ?? usuario?.sequenciaAtual ?? 0;

  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center md:hidden">
        <button onClick={onMenuClick} className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="hidden md:block">
        <h2 className="text-lg font-bold text-stone-800">
          Olá, {usuario?.nome?.split(' ')[0] || 'Aprendiz'}!
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {/* Streak Indicator */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
          displayOfensiva > 0 
            ? 'bg-orange-100 text-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
            : 'bg-stone-100 text-stone-500'
        }`}>
          <Flame className={`w-4 h-4 ${displayOfensiva > 0 ? 'fill-orange-500 animate-pulse' : 'text-stone-400'}`} />
          <span>{displayOfensiva} dias</span>
        </div>
        
        {/* XP Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-2xl font-bold text-sm shadow-sm transition-all duration-300 hover:shadow-md">
          <Star className="w-4 h-4 fill-amber-500" />
          <span>{displayXp} XP</span>
        </div>

        {/* User Avatar Placeholder */}
        <Link href="/perfil" className="w-9 h-9 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold overflow-hidden border border-primary/20 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
          {usuario?.fotoPerfil ? (
            <img src={usuario.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" style={{ objectPosition: usuario.fotoPerfilPosicao || 'center' }} />
          ) : (
            usuario?.nome?.charAt(0).toUpperCase() || 'U'
          )}
        </Link>
      </div>
    </header>
  );
}
