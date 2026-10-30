'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Book, CheckCircle2, Trophy, Loader2, AlertCircle, Sparkles, X, ArrowRight, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { servicoTrilha } from '@/services/servicoTrilha';
import { servicoDashboard, DashboardData } from '@/services/servicoDashboard';
import { TrilhaResponseDTO } from '@/types/dtos';

const imgMap: Record<string, string> = {
  'Trilha Potiguara Básica': '/images/trilhas/potiguara_basica.jpg',
  'Vocabulário do Dia a Dia': '/images/trilhas/vocabulario.jpg',
  'Mitos e Lendas Tupi': '/images/trilhas/mitos.jpg'
};
import { useQuery } from '@tanstack/react-query';
import {
  FogueiraIcon,
  MachadoIcon,
  PenaIcon,
  CocarIcon,
  OcaIcon,
  ArcoFlechaIcon,
  TriboIcon,
  GuerreiroIcon,
  MaracaIcon,
  ArenaBatalhaIcon
} from '@/components/icons/IndigenousIcons';

const indigenousIconsMap: Record<string, React.ElementType> = {
  FogueiraIcon,
  MachadoIcon,
  PenaIcon,
  CocarIcon,
  OcaIcon,
  ArcoFlechaIcon,
  TriboIcon,
  GuerreiroIcon,
  MaracaIcon,
  ArenaBatalhaIcon
};

const renderConquistaIcon = (iconeName: string) => {
  if (indigenousIconsMap[iconeName]) {
    const IndigComp = indigenousIconsMap[iconeName];
    return <IndigComp className="w-6 h-6" />;
  }
  if (iconeName && (iconeName.startsWith('http') || iconeName.startsWith('/'))) {
    return <img src={iconeName} alt="Conquista" className="w-6 h-6 object-contain" />;
  }
  const Icon = ((LucideIcons as Record<string, unknown>)[iconeName] as React.ElementType) || LucideIcons.Trophy;
  return <Icon className="w-6 h-6" />;
};

export default function DashboardPage() {
  const router = useRouter();
  const [modalPinAberto, setModalPinAberto] = useState(false);
  const [pinAluno, setPinAluno] = useState('');

  const { data: trilhas = [], isLoading: carregandoTrilhas } = useQuery({
    queryKey: ['trails'],
    queryFn: servicoTrilha.obterTrilhas
  });

  const { data: dadosDashboard, isLoading: carregandoDashboard, isError } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: servicoDashboard.obterDadosDashboard
  });

  const carregando = carregandoTrilhas || carregandoDashboard;
  const erro = isError ? 'Não foi possível carregar os dados. Tente novamente mais tarde.' : '';

  const handleEntrarComPin = (e: React.FormEvent) => {
    e.preventDefault();
    const pinLimpo = pinAluno.replace(/\s+/g, '').trim();
    if (pinLimpo) {
      router.push(`/arena?pin=${pinLimpo}`);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se deu erro e não tem dados do dashboard, não podemos renderizar a página inteira
  if (!dadosDashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-stone-800">Ops! Algo deu errado.</h2>
        <p className="text-stone-600 mb-4">{erro}</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  // Busca a primeira trilha não bloqueada que ainda não foi concluída (progresso < 100%)
  const primeiraTrilha = trilhas.find(t => !t.estaBloqueada && t.progresso < 100) || (trilhas.length > 0 ? trilhas[0] : null);
  const conquistasDesbloqueadas = dadosDashboard.conquistas.filter(c => c.desbloqueada);
  const ultimaConquista = conquistasDesbloqueadas.length > 0 ? conquistasDesbloqueadas[conquistasDesbloqueadas.length - 1] : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Toast de Erro */}
      {erro && (
        <div className="fixed top-20 right-8 bg-rose-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">{erro}</span>
        </div>
      )}

      {/* CARD SPOTLIGHT: TUPI ARENA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 md:p-8 shadow-xl border-2 border-emerald-600/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 to-transparent" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Novo / Sala de Aula
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <span className="p-2 bg-emerald-700/80 rounded-2xl border border-emerald-500/40">
                <ArenaBatalhaIcon className="w-6 h-6 text-amber-300" />
              </span>
              Tupi Arena: Batalha ao Vivo
            </h2>

            <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed">
              Transforme sua sala de aula em uma arena de quiz interativa estilo Kahoot com temas e saberes da cultura indígena!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Link
              href="/arena/criar"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-stone-950 font-black text-sm md:text-base shadow-lg transition-all flex items-center justify-center gap-2 border-b-4 border-amber-600 cursor-pointer"
            >
              <ArenaBatalhaIcon className="w-5 h-5" />
              Criar Sala (Professor)
            </Link>

            <button
              type="button"
              onClick={() => setModalPinAberto(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:translate-y-0.5 text-white font-bold text-sm md:text-base border border-white/20 backdrop-blur-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Entrar com PIN (Aluno)
            </button>
          </div>
        </div>
      </section>

      {primeiraTrilha && (
        <section className="bg-white dark:bg-stone-900 border-2 border-b-[6px] border-stone-200 dark:border-stone-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-200 hover:-translate-y-1 hover:border-b-[8px] active:translate-y-1 active:border-b-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              {primeiraTrilha.progresso === 0 ? 'Comece sua jornada!' : 'Continue aprendendo!'}
            </h1>
            <p className="text-stone-600 dark:text-stone-300 mb-4 max-w-lg">
              {primeiraTrilha.progresso === 0 
                ? <>Dê o seu primeiro passo! Sua primeira lição na trilha <strong>{primeiraTrilha.title}</strong> está te esperando.</>
                : <>Você está indo muito bem. Sua próxima lição na trilha <strong>{primeiraTrilha.title}</strong> está te esperando.</>}
            </p>
            <div className="space-y-2 max-w-md">
              <div className="flex justify-between text-sm font-medium text-stone-700 dark:text-stone-300">
                <span>{primeiraTrilha.progresso === 0 ? 'Iniciar jornada' : 'Continuar jornada'}</span>
                <span>{primeiraTrilha.progresso}%</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-3 overflow-hidden">
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
            <Button 
              size="lg" 
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const modulos = await servicoTrilha.obterModulosPorIdTrilha(primeiraTrilha.id);
                  let proximaLicaoId = null;
                  
                  for (const mod of modulos) {
                    if (!mod.estaBloqueada) {
                      const licao = mod.lessons.find(l => !l.estaConcluida);
                      if (licao) {
                        proximaLicaoId = licao.id;
                        break;
                      }
                    }
                  }
                  
                  if (proximaLicaoId) {
                    window.location.href = `/licoes/${proximaLicaoId}`;
                  } else {
                    window.location.href = `/trilhas/${primeiraTrilha.id}`;
                  }
                } catch (err) {
                  window.location.href = `/trilhas/${primeiraTrilha.id}`;
                }
              }}
              className="w-full md:w-auto bg-primary text-white border-b-4 border-emerald-800 hover:bg-emerald-600 hover:-translate-y-0.5 hover:border-b-[6px] active:translate-y-1 active:border-b-0 transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              {primeiraTrilha.progresso === 0 ? 'Começar Trilha' : 'Continuar Trilha'}
            </Button>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Suas Trilhas</h2>
            <Link href="/trilhas" className="text-sm font-bold text-primary hover:text-emerald-600 transition-colors">
              Ver todas
            </Link>
          </div>

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
                <div className={`bg-white dark:bg-stone-900 p-5 rounded-3xl border-2 ${trail.estaBloqueada ? 'opacity-60 grayscale cursor-not-allowed border-stone-200 dark:border-stone-800 border-b-[6px]' : 'border-stone-200 dark:border-stone-800 border-b-[6px] hover:border-primary/40 hover:-translate-y-1 hover:border-b-[8px] active:translate-y-1 active:border-b-2'} transition-all duration-200 h-full`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${trail.corBase}-100 dark:bg-${trail.corBase}-900/30 text-${trail.corBase}-700 dark:text-${trail.corBase}-400 rounded-xl flex items-center justify-center overflow-hidden`}>
                      {trail.imageUrl ? (
                        <img src={trail.imageUrl} alt={trail.title} className="w-full h-full object-cover" />
                      ) : imgMap[trail.title.trim()] ? (
                        <img src={imgMap[trail.title.trim()]} alt={trail.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{trail.icon}</span>
                      )}
                    </div>
                    <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold px-2 py-1 rounded">Nível {trail.nivel}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">{trail.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mb-4 line-clamp-2">{trail.description}</p>
                  
                  {!trail.estaBloqueada && (
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                      <div className="flex-1 bg-stone-200 dark:bg-stone-800 rounded-full h-3 overflow-hidden border border-stone-300/50 dark:border-stone-700">
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
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Seu Progresso</h2>

          <div className="bg-white dark:bg-stone-900 border-2 border-b-[6px] border-stone-200 dark:border-stone-800 p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                <Book className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">Lições concluídas</p>
                <p className="font-bold text-lg text-stone-800 dark:text-stone-100">
                  <AnimatedCounter value={dadosDashboard.licoesConcluidas} />
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">Taxa de acerto</p>
                <p className="font-bold text-lg text-stone-800 dark:text-stone-100">
                  <AnimatedCounter value={Math.round(dadosDashboard.taxaAcerto)} formatFn={(v) => `${v}%`} />
                </p>
              </div>
            </div>

            {ultimaConquista && (
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Última conquista
                  </h3>
                  <Link href="/conquistas" className="text-xs font-bold text-primary hover:underline">
                    Ver todas
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 rounded-xl flex items-center justify-center text-2xl border border-amber-200 dark:border-amber-800/80 shadow-sm text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true">
                    {renderConquistaIcon(ultimaConquista.icone)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-stone-800 dark:text-stone-100 truncate">{ultimaConquista.titulo}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">{ultimaConquista.descricao}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Rápido: Entrar com PIN */}
      <AnimatePresence>
        {modalPinAberto && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-3xl p-6 md:p-8 max-w-sm w-full space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setModalPinAberto(false)}
                className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <ArenaBatalhaIcon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                  Entrar na Tupi Arena
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Digite o PIN exibido na lousa pelo seu professor:
                </p>
              </div>

              <form onSubmit={handleEntrarComPin} className="space-y-4">
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="Ex: 482910"
                  autoFocus
                  value={pinAluno}
                  onChange={(e) => setPinAluno(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center text-3xl font-mono font-black py-3 px-4 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 tracking-widest focus:border-emerald-500 focus:outline-none"
                  required
                />

                <button
                  type="submit"
                  disabled={!pinAluno.trim()}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-extrabold text-base shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 border-b-4 border-emerald-800 cursor-pointer"
                >
                  Continuar para a Arena
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
