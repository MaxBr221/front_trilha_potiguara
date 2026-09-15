'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Lock, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { servicoTrilha } from '@/services/servicoTrilha';
import { trilhasFalsas, Trilha } from '@/mocks/trilhas.mock';
import { modulosFalsos, Modulo } from '@/mocks/modulos.mock';

export default function TrilhaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [trail, setTrilha] = useState<Trilha | null>(null);
  const [modules, setModulos] = useState<Modulo[]>([]);
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
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Trilhas
        </button>
        
        <div className={`bg-${trail.corBase}-50 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-${trail.corBase}-100`}>
          <div className={`w-24 h-24 bg-${trail.corBase}-100 rounded-3xl flex items-center justify-center text-5xl shadow-sm shrink-0`}>
            {trail.icon}
          </div>
          <div className="text-center md:text-left flex-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-${trail.corBase}-200 text-${trail.corBase}-800 mb-3`}>
              Nível {trail.nivel}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">{trail.title}</h1>
            <p className="text-stone-600 max-w-2xl">{trail.description}</p>
          </div>
          <div className="w-full md:w-auto bg-white p-4 rounded-2xl shadow-sm border border-stone-200 shrink-0">
            <div className="text-sm font-medium text-stone-500 mb-1">Seu progressoo</div>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-3xl font-bold text-${trail.corBase}-600`}>{trail.progresso}%</span>
            </div>
            <div className="w-full md:w-40 bg-stone-100 rounded-full h-2">
              <div 
                className={`bg-${trail.corBase}-500 h-2 rounded-full`} 
                style={{ width: `${trail.progresso}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modulos List */}
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-stone-800 text-center mb-8">Jornada de Aprendizado</h2>
        
        <div className="relative">
          {/* Vertical Line Connector */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-stone-200 -translate-x-1/2 z-0 hidden md:block"></div>

          <div className="space-y-12">
            {modules.map((mod, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div key={mod.id} className={`relative z-10 flex flex-col md:flex-row gap-6 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Modulo Content */}
                  <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'} bg-white p-6 rounded-2xl border ${mod.estaBloqueada ? 'border-stone-200 opacity-70' : 'border-stone-300 shadow-sm'}`}>
                    <div className="flex items-center gap-3 mb-2 justify-start md:justify-normal" style={{ flexDirection: !isEven ? 'row' : 'row-reverse' }}>
                      <span className="text-sm font-bold text-stone-400">Módulo {index + 1}</span>
                      {mod.estaBloqueada && <Lock className="w-4 h-4 text-stone-400" />}
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2">{mod.title}</h3>
                    <p className="text-stone-500 text-sm mb-4">{mod.description}</p>
                    
                    <div className="space-y-2 text-left">
                      {mod.lessons.map(licao => (
                        <div key={licao.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                          {licao.estaConcluida ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300 shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${licao.estaConcluida ? 'text-stone-700' : 'text-stone-600'}`}>
                              {licao.title}
                            </span>
                          </div>
                          {licao.type === 'exercise' ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Prática</span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Teoria</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {!mod.estaBloqueada && (
                      <div className={`mt-6 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <Link href={`/licoes/${mod.lessons[0].id}`}>
                          <Button size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Começar
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Center Node (Desktop only) */}
                  <div className="hidden md:flex w-16 items-center justify-center shrink-0">
                    <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shadow-md z-10 ${mod.estaBloqueada ? 'bg-stone-200' : `bg-${trail.corBase}-500 text-white`}`}>
                      {mod.estaBloqueada ? <Lock className="w-5 h-5 text-stone-400" /> : <BookOpen className="w-5 h-5" />}
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
