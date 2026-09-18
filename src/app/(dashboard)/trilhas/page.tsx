'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Loader2 } from 'lucide-react';
import { servicoTrilha } from '@/services/servicoTrilha';
import { TrilhaResponseDTO } from '@/types/dtos';

export default function TrilhasPage() {
  const [trails, setTrilhas] = useState<TrilhaResponseDTO[]>([]);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">Trilhas de Aprendizado</h1>
        <p className="text-stone-600">Escolha o seu próximo caminho de conhecimento.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {trails.map((trail) => (
          <div key={trail.id} className="relative">
            <Link 
              href={trail.estaBloqueada ? '#' : `/trilhas/${trail.id}`}
              className={`block bg-white p-6 rounded-3xl border-2 ${
                trail.estaBloqueada 
                  ? 'opacity-60 grayscale cursor-not-allowed border-stone-200 border-b-[6px]' 
                  : 'border-stone-200 border-b-[6px] hover:border-primary/40 hover:-translate-y-1 hover:border-b-[8px] active:translate-y-1 active:border-b-2 transition-all duration-200'
              } h-full`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-${trail.corBase}-100 text-${trail.corBase}-700 rounded-2xl flex items-center justify-center text-3xl`}>
                  {trail.icon}
                </div>
                {trail.estaBloqueada ? (
                  <div className="bg-stone-100 text-stone-500 p-2 rounded-full">
                    <Lock className="w-4 h-4" />
                  </div>
                ) : (
                  <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded">Nível {trail.nivel}</span>
                )}
              </div>
              
              <h3 className="font-bold text-xl mb-2 text-stone-800">{trail.title}</h3>
              <p className="text-stone-500 text-sm mb-6">{trail.description}</p>
              
              {!trail.estaBloqueada && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-stone-600">
                    <span>{trail.progresso}% concluído</span>
                    <span>{trail.quantidadeModulos} módulos</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden border border-stone-300/50 mt-1">
                    <div 
                      className={`bg-${trail.corBase}-500 h-3 rounded-full transition-[width] duration-1000 ease-out`} 
                      style={{ width: `${trail.progresso}%`, backgroundColor: trail.progresso > 0 ? 'var(--primary)' : undefined }}
                    ></div>
                  </div>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
