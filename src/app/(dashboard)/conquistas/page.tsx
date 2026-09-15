'use client';

import { Trophy, Star, Flame, Crown, Lock, Target, Medal } from 'lucide-react';

const conquistasDesbloqueadas = [
  {
    id: 1,
    title: 'Fogo Inicial',
    description: 'Completou 7 dias de ofensiva seguidos.',
    date: '10 Set 2026',
    icon: Flame,
    color: 'amber',
    bg: 'bg-amber-100',
    text: 'text-amber-600',
  },
  {
    id: 2,
    title: 'Primeiros Passos',
    description: 'Completou sua primeira lição.',
    date: '02 Set 2026',
    icon: Target,
    color: 'emerald',
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
  },
  {
    id: 3,
    title: 'Explorador Nato',
    description: 'Desbloqueou o módulo de Natureza.',
    date: '12 Set 2026',
    icon: Star,
    color: 'blue',
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  }
];

const conquistasBloqueadas = [
  {
    id: 4,
    title: 'Mestre da Aldeia',
    description: 'Complete 50 lições sem errar nenhuma pergunta.',
    progress: 30, // percentage
    icon: Crown,
  },
  {
    id: 5,
    title: 'Lenda Viva',
    description: 'Alcance 10.000 XP acumulado.',
    progress: 15,
    icon: Trophy,
  },
  {
    id: 6,
    title: 'Guerreiro Implacável',
    description: 'Mantenha 30 dias de ofensiva seguidos.',
    progress: 25,
    icon: Medal,
  }
];

export default function ConquistasPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-10 text-white shadow-lg flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Suas Conquistas</h1>
          <p className="text-white/90 max-w-2xl text-lg">
            Você já desbloqueou {conquistasDesbloqueadas.length} de {conquistasDesbloqueadas.length + conquistasBloqueadas.length} conquistas disponíveis. Continue aprendendo para platinar seu perfil!
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-stone-800">Conquistas Desbloqueadas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conquistasDesbloqueadas.map((conquista) => {
            const Icon = conquista.icon;
            return (
              <div key={conquista.id} className="bg-white p-6 rounded-2xl border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${conquista.bg} ${conquista.text} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                    {conquista.date}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-stone-800 mb-2">{conquista.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{conquista.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-800">Em Progresso</h2>
          <span className="text-stone-500 text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Bloqueadas
          </span>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conquistasBloqueadas.map((conquista) => {
            const Icon = conquista.icon;
            return (
              <div key={conquista.id} className="bg-stone-50 p-6 rounded-2xl border border-stone-200 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-stone-200 text-stone-400 rounded-2xl flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </div>
                  <Lock className="w-5 h-5 text-stone-300" />
                </div>
                <h3 className="font-bold text-xl text-stone-700 mb-2">{conquista.title}</h3>
                <p className="text-stone-500 text-sm mb-6 leading-relaxed">{conquista.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-500">
                    <span>Progresso</span>
                    <span>{conquista.progress}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div 
                      className="bg-stone-400 h-2 rounded-full" 
                      style={{ width: `${conquista.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
