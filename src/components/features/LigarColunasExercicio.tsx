'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercicio } from '@/services/servicoExercicio';

interface Props {
  exercicio: Exercicio;
  onComplete: () => void;
}

export function LigarColunasExercicio({ exercicio, onComplete }: Props) {
  const [esquerda, setEsquerda] = useState<{ id: string; texto: string; correspondencia: string }[]>([]);
  const [direita, setDireita] = useState<{ id: string; texto: string; correspondencia: string }[]>([]);
  
  const [selecionadoEsq, setSelecionadoEsq] = useState<string | null>(null);
  const [selecionadoDir, setSelecionadoDir] = useState<string | null>(null);
  
  const [paresCorretos, setParesCorretos] = useState<string[]>([]); // ids of matched items
  
  useEffect(() => {
    // exercicio.opcoes format: ["Tupi:Português", "Tupi2:Português2"]
    const pares = exercicio.opcoes.map((opcao, index) => {
      const [tupi, ptbr] = opcao.split(':');
      return { id: `par-${index}`, tupi: tupi?.trim() || '', ptbr: ptbr?.trim() || '' };
    });

    const esq = pares.map(p => ({ id: `${p.id}-esq`, texto: p.tupi, correspondencia: p.id }));
    const dir = pares.map(p => ({ id: `${p.id}-dir`, texto: p.ptbr, correspondencia: p.id }));

    // Shuffle arrays
    setEsquerda(esq.sort(() => Math.random() - 0.5));
    setDireita(dir.sort(() => Math.random() - 0.5));
    
    setSelecionadoEsq(null);
    setSelecionadoDir(null);
    setParesCorretos([]);
  }, [exercicio]);

  useEffect(() => {
    if (selecionadoEsq && selecionadoDir) {
      const itemEsq = esquerda.find(e => e.id === selecionadoEsq);
      const itemDir = direita.find(d => d.id === selecionadoDir);
      
      if (itemEsq && itemDir && itemEsq.correspondencia === itemDir.correspondencia) {
        // Match!
        const novoPar = itemEsq.correspondencia;
        const novosParesCorretos = [...paresCorretos, novoPar];
        setParesCorretos(novosParesCorretos);
        
        if (novosParesCorretos.length === esquerda.length) {
          onComplete(); // All matched!
        }
      }
      
      // Reset selection after a short delay so they see the result
      setTimeout(() => {
        setSelecionadoEsq(null);
        setSelecionadoDir(null);
      }, 500);
    }
  }, [selecionadoEsq, selecionadoDir, esquerda, direita, paresCorretos, onComplete]);

  return (
    <div className="max-w-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8 text-center">
        {exercicio.enunciado}
      </h1>
      
      <div className="flex gap-4 md:gap-8">
        <div className="flex-1 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-stone-500 text-center mb-2">Tupi</h2>
          {esquerda.map(item => {
            const isMatched = paresCorretos.includes(item.correspondencia);
            const isSelected = selecionadoEsq === item.id;
            
            let btnClass = 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300';
            if (isSelected) btnClass = 'border-primary bg-primary/10 text-primary';
            if (isMatched) btnClass = 'border-emerald-500 bg-emerald-100 text-emerald-800 opacity-50 cursor-default';

            return (
              <button
                key={item.id}
                disabled={isMatched}
                onClick={() => setSelecionadoEsq(item.id)}
                className={`px-4 py-4 rounded-xl border-2 text-center font-medium transition-all duration-200 ${btnClass}`}
              >
                {item.texto}
              </button>
            );
          })}
        </div>
        
        <div className="flex-1 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-stone-500 text-center mb-2">Português</h2>
          {direita.map(item => {
            const isMatched = paresCorretos.includes(item.correspondencia);
            const isSelected = selecionadoDir === item.id;
            
            let btnClass = 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300';
            if (isSelected) btnClass = 'border-primary bg-primary/10 text-primary';
            if (isMatched) btnClass = 'border-emerald-500 bg-emerald-100 text-emerald-800 opacity-50 cursor-default';

            return (
              <button
                key={item.id}
                disabled={isMatched}
                onClick={() => setSelecionadoDir(item.id)}
                className={`px-4 py-4 rounded-xl border-2 text-center font-medium transition-all duration-200 ${btnClass}`}
              >
                {item.texto}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
