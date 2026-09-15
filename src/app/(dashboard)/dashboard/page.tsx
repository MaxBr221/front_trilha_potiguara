'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Book, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { servicoTrilha } from '@/services/servicoTrilha';
import { Trilha } from '@/mocks/trilhas.mock';

export default function DashboardPage() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchTrilhas = async () => {
      try {
        const data = await servicoTrilha.obterTrilhas();
        setTrilhas(data);
      } catch (error) {
        console.error('Erro ao buscar trilhas:', error);
      } finally {
        setCarregando(false);
      }
    };
    fetchTrilhas();
  }, []);

  if (carregando) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const primeiraTrilha = trilhas.length > 0 ? trilhas[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      {primeiraTrilha && (
        <section className="bg-primary/5 border border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">Continue aprendendo!</h1>
            <p className="text-stone-600 mb-4 max-w-lg">
              Você está indo muito bem. Sua próxima lição na trilha <strong>{primeiraTrilha.title}</strong> está te esperando.
            </p>
            <div className="space-y-2 max-w-md">
              <div className="flex justify-between text-sm font-medium text-stone-700">
                <span>Continuar jornada</span>
                <span>{primeiraTrilha.progresso}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-3">
                <div className="bg-primary h-3 rounded-full" style={{ width: `${primeiraTrilha.progresso}%` }}></div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <Link href={`/trilhas/${primeiraTrilha.id}`}>
              <Button size="lg" className="w-full md:w-auto shadow-lg shadow-primary/25">
                <Play className="w-5 h-5 mr-2" />
                Continuar Trilha
              </Button>
            </Link>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Trilhas em andamento */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-stone-800">Suas Trilhas</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {trilhas.slice(0, 2).map((trail) => (
              <Link key={trail.id} href={trail.estaBloqueada ? '#' : `/trilhas/${trail.id}`} className="block group">
                <div className={`bg-white p-5 rounded-2xl border ${trail.estaBloqueada ? 'border-stone-200 opacity-60 cursor-not-allowed' : 'border-stone-200 hover:border-primary/50 hover:shadow-md'} transition-all h-full`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${trail.corBase}-100 text-${trail.corBase}-700 rounded-xl flex items-center justify-center`}>
                      <span className="text-2xl">{trail.icon}</span>
                    </div>
                    <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded">Nível {trail.nivel}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{trail.title}</h3>
                  <p className="text-stone-500 text-sm mb-4 line-clamp-2">{trail.description}</p>
                  
                  {!trail.estaBloqueada && (
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                      <div className="flex-1 bg-stone-100 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${trail.progresso}%` }}></div>
                      </div>
                      <span>{trail.progresso}%</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Resumo e Conquistas */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-800">Seu Progresso</h2>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Book className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Lições concluídas</p>
                <p className="font-bold text-lg text-stone-800">12</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Taxa de acerto</p>
                <p className="font-bold text-lg text-stone-800">92%</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Última conquista
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl border border-amber-200">
                  🔥
                </div>
                <div>
                  <p className="font-bold text-sm text-stone-800">Fogo Inicial</p>
                  <p className="text-xs text-stone-500">7 dias seguidos!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
