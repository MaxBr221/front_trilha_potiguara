'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Lock, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { servicoTrilha } from '@/services/servicoTrilha';
import { TrilhaResponseDTO, ModuloResponseDTO } from '@/types/dtos';

const imgMap: Record<string, string> = {
  'Trilha Potiguara Básica': '/images/trilhas/potiguara_basica.jpg',
  'Vocabulário do Dia a Dia': '/images/trilhas/vocabulario.jpg',
  'Mitos e Lendas Tupi': '/images/trilhas/mitos.jpg'
};

export default function TrilhaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [trail, setTrilha] = useState<TrilhaResponseDTO | null>(null);
  const [modules, setModulos] = useState<ModuloResponseDTO[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const trailId = id;
      if (!trailId) {
        notFound();
        return;
      }

      try {
        const [trailData, modulesData] = await Promise.all([
          servicoTrilha.obterTrilhaPorId(trailId),
          servicoTrilha.obterModulosPorIdTrilha(trailId)
        ]);

        if (!trailData) {
          notFound();
          return;
        }

        setTrilha(trailData);
        setModulos(modulesData);
      } catch (err) {
        console.error('Erro ao carregar dados da trilha', err);
      } finally {
        setCarregando(false);
      }
    };

    loadData();
  }, [id]);

  if (carregando) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trail) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => router.push('/trilhas')}
          className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Trilhas
        </button>
        
        <div className={`bg-${trail.corBase}-50 dark:bg-${trail.corBase}-900/20 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 border-2 border-b-[6px] border-${trail.corBase}-200/50 dark:border-${trail.corBase}-900/50`}>
          <div className={`w-24 h-24 bg-${trail.corBase}-100 dark:bg-${trail.corBase}-900/50 rounded-3xl flex items-center justify-center text-5xl shadow-sm shrink-0 overflow-hidden`}>
            {trail.imageUrl ? (
              <img src={trail.imageUrl} alt={trail.title} className="w-full h-full object-cover" />
            ) : imgMap[trail.title.trim()] ? (
              <img src={imgMap[trail.title.trim()]} alt={trail.title} className="w-full h-full object-cover" />
            ) : (
              trail.icon
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-${trail.corBase}-200 dark:bg-${trail.corBase}-900/50 text-${trail.corBase}-800 dark:text-${trail.corBase}-300 mb-3`}>
              Nível {trail.nivel}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">{trail.title}</h1>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl">{trail.description}</p>
          </div>
          <div className="w-full md:w-auto bg-white dark:bg-stone-900 p-5 rounded-3xl border-2 border-b-[4px] border-stone-200 dark:border-stone-800 shrink-0">
            <div className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Seu progressoo</div>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-3xl font-bold text-${trail.corBase}-600 dark:text-${trail.corBase}-400`}>{trail.progresso}%</span>
            </div>
            <div className="w-full md:w-40 bg-stone-200 dark:bg-stone-800 rounded-full h-3 overflow-hidden border border-stone-300/50 dark:border-stone-700 mt-1">
              <div 
                className={`bg-${trail.corBase}-500 h-3 rounded-full transition-[width] duration-1000 ease-out`} 
                style={{ width: `${trail.progresso}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modulos List */}
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 text-center mb-8">Jornada de Aprendizado</h2>
        
        <div className="relative">
          {/* Vertical Line Connector */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-stone-200 dark:bg-stone-800 -translate-x-1/2 z-0 hidden md:block"></div>

          <div className="space-y-12">
            {modules.map((mod, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div key={mod.id} className={`relative z-10 flex flex-col md:flex-row gap-6 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Modulo Content */}
                  <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'} bg-white dark:bg-stone-900 p-6 rounded-3xl border-2 ${mod.estaBloqueada ? 'opacity-60 grayscale cursor-not-allowed border-stone-200 dark:border-stone-800 border-b-[6px]' : 'border-stone-200 dark:border-stone-800 border-b-[6px] transition-all duration-200'}`}>
                    <div className="flex items-center gap-3 mb-2 justify-start md:justify-normal" style={{ flexDirection: !isEven ? 'row' : 'row-reverse' }}>
                      <span className="text-sm font-bold text-stone-400 dark:text-stone-500">Módulo {index + 1}</span>
                      {mod.estaBloqueada && <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500" />}
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">{mod.title}</h3>
                    <p className="text-slate-400 dark:text-stone-400 italic font-serif text-sm mb-4">{mod.description}</p>
                    
                    <div className="space-y-2 text-left">
                      {mod.lessons.map(licao => (
                        <div key={licao.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 hover:scale-[1.02] hover:shadow-sm transition-all duration-300">
                          {licao.estaConcluida ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600 shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${licao.estaConcluida ? 'text-stone-700 dark:text-stone-300' : 'text-stone-600 dark:text-stone-400'}`}>
                              {licao.title}
                            </span>
                          </div>
                          {licao.type === 'exercise' ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">Prática</span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">Teoria</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {!mod.estaBloqueada && (
                      <div className={`mt-6 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <Link href={`/licoes/${(mod.lessons.find(l => !l.estaConcluida) || mod.lessons[0]).id}`}>
                          <Button size="sm" className="bg-primary text-white border-b-4 border-emerald-800 hover:bg-emerald-600 hover:-translate-y-0.5 hover:border-b-[6px] active:translate-y-1 active:border-b-0 transition-all duration-200">
                            <Play className="w-4 h-4 mr-2" />
                            Começar
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Center Node (Desktop only) */}
                  <div className="hidden md:flex w-16 items-center justify-center shrink-0">
                    <div className={`w-12 h-12 rounded-full border-4 border-white dark:border-stone-900 flex items-center justify-center shadow-md z-10 ${mod.estaBloqueada ? 'bg-stone-200 dark:bg-stone-800' : `bg-${trail.corBase}-500 text-white`}`}>
                      {mod.estaBloqueada ? <Lock className="w-5 h-5 text-stone-400 dark:text-stone-500" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block flex-1"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
