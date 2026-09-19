
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Book, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { servicoTrilha } from '@/services/servicoTrilha';
import { servicoDashboard, DashboardData } from '@/services/servicoDashboard';
import { TrilhaResponseDTO } from '@/types/dtos';

export default function DashboardPage() {
  const [trilhas, setTrilhas] = useState<TrilhaResponseDTO[]>([]);
  const [dadosDashboard, setDadosDashboard] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [trailsData, dashboardData] = await Promise.all([
          servicoTrilha.obterTrilhas(),
          servicoDashboard.obterDadosDashboard()
        ]);
        setTrilhas(trailsData);
        setDadosDashboard(dashboardData);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setCarregando(false);
      }
    };
    fetchDados();
  }, []);

  if (carregando || !dadosDashboard) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Busca a primeira trilha não bloqueada que ainda não foi concluída (progresso < 100%)
  const primeiraTrilha = trilhas.find(t => !t.estaBloqueada && t.progresso < 100) || (trilhas.length > 0 ? trilhas[0] : null);
  const conquistasDesbloqueadas = dadosDashboard.conquistas.filter(c => c.desbloqueada);
  const ultimaConquista = conquistasDesbloqueadas.length > 0 ? conquistasDesbloqueadas[conquistasDesbloqueadas.length - 1] : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {primeiraTrilha && (
        <section className="bg-primary/5 border-2 border-b-[6px] border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-200 hover:-translate-y-1 hover:border-b-[8px] active:translate-y-1 active:border-b-2">
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
              <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-primary h-3 rounded-full" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${primeiraTrilha.progresso}%` }} 
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <Link href={`/trilhas/${primeiraTrilha.id}`}>
              <Button size="lg" className="w-full md:w-auto bg-primary text-white border-b-4 border-emerald-800 hover:bg-emerald-600 hover:-translate-y-0.5 hover:border-b-[6px] active:translate-y-1 active:border-b-0 transition-all duration-200">
                <Play className="w-5 h-5 mr-2" />
                Continuar Trilha
              </Button>
            </Link>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-stone-800">Suas Trilhas</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {trilhas.slice(0, 2).map((trail, index) => (
              <motion.div
                key={trail.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.15 + 0.1 }}
              >
                <Link 
                  href={trail.estaBloqueada ? '#' : `/trilhas/${trail.id}`} 
                  className="block group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                <div className={`bg-white p-5 rounded-3xl border-2 ${trail.estaBloqueada ? 'opacity-60 grayscale cursor-not-allowed border-stone-200 border-b-[6px]' : 'border-stone-200 border-b-[6px] hover:border-primary/40 hover:-translate-y-1 hover:border-b-[8px] active:translate-y-1 active:border-b-2'} transition-all duration-200 h-full`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${trail.corBase}-100 text-${trail.corBase}-700 rounded-xl flex items-center justify-center`}>
                      <span className="text-2xl">{trail.icon}</span>
                    </div>
                    <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded">Nível {trail.nivel}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-stone-800 group-hover:text-primary transition-colors">{trail.title}</h3>
                  <p className="text-stone-500 text-sm mb-4 line-clamp-2">{trail.description}</p>
                  
                  {!trail.estaBloqueada && (
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                      <div className="flex-1 bg-stone-200 rounded-full h-3 overflow-hidden border border-stone-300/50">
                        <motion.div 
                          className="bg-primary h-3 rounded-full" 
                          initial={{ width: 0 }} 
                          animate={{ width: `${trail.progresso}%` }} 
                          transition={{ duration: 1, ease: "easeOut", delay: index * 0.15 + 0.4 }}
                        />
                      </div>
                      <span>{trail.progresso}%</span>
                    </div>
                  )}
                </div>
              </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-800">Seu Progresso</h2>

          <div className="bg-white border-2 border-b-[6px] border-stone-200 p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Book className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Lições concluídas</p>
                <p className="font-bold text-lg text-stone-800">
                  <AnimatedCounter value={dadosDashboard.licoesConcluidas} />
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Taxa de acerto</p>
                <p className="font-bold text-lg text-stone-800">
                  <AnimatedCounter value={Math.round(dadosDashboard.taxaAcerto)} formatFn={(v) => `${v}%`} />
                </p>
              </div>
            </div>

            {ultimaConquista && (
              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Última conquista
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-${ultimaConquista.corBase}-100 rounded-xl flex items-center justify-center text-2xl border border-${ultimaConquista.corBase}-200 shadow-sm shadow-${ultimaConquista.corBase}-200 text-${ultimaConquista.corBase}-600`} aria-hidden="true">
                    {(() => {
                      const Icon = (LucideIcons as Record<string, React.ElementType>)[ultimaConquista.icone] || LucideIcons.Trophy;
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-stone-800">{ultimaConquista.titulo}</p>
                    <p className="text-xs text-stone-500 line-clamp-1">{ultimaConquista.descricao}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
