'use client';

import { usarAutenticacao } from '@/contexts/ContextoAutenticacao';
import { Menu, Flame, Star } from 'lucide-react';

export function InternalNavbar() {
  const { usuario } = usarAutenticacao();

  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center md:hidden">
        <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="hidden md:block">
        <h2 className="text-lg font-bold text-stone-800">
          Olá, {usuario?.nome?.split(' ')[0] || 'Aprendiz'}!
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full font-bold text-sm">
          <Flame className="w-4 h-4 fill-orange-600" />
          <span>{usuario?.sequenciaAtual || 0} dias</span>
        </div>
        
        {/* XP Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full font-bold text-sm">
          <Star className="w-4 h-4 fill-amber-500" />
          <span>{usuario?.xp || 0} XP</span>
        </div>

        {/* User Avatar Placeholder */}
        <div className="w-9 h-9 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
          {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
