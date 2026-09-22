'use client';

import { useState, useEffect } from 'react';
import { Exercicio } from '@/services/servicoExercicio';

interface LigarColunasExercicioProps {
  exercicio: Exercicio;
  onComplete: () => void;
}

// Helper para embaralhar listas (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function LigarColunasExercicio({ exercicio, onComplete }: LigarColunasExercicioProps) {
  const [leftCol, setLeftCol] = useState<string[]>([]);
  const [rightCol, setRightCol] = useState<string[]>([]);

  // Estados de seleção
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Estados de jogo
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // pares que já foram ligados com sucesso (ex: "Tupi:Português")
  const [errorPair, setErrorPair] = useState<{ left: string, right: string } | null>(null);
  const [successPair, setSuccessPair] = useState<{ left: string, right: string } | null>(null);
  const [audioAcerto] = useState(() => typeof window !== 'undefined' ? new Audio('/sounds/correct.mp3') : null);

  useEffect(() => {
    // Separa as colunas a partir do array de opções
    const lefts: string[] = [];
    const rights: string[] = [];
    
    exercicio.opcoes.forEach(op => {
      const parts = op.split(':');
      if (parts.length === 2) {
        lefts.push(parts[0]);
        rights.push(parts[1]);
      }
    });

    setLeftCol(shuffle(lefts));
    setRightCol(shuffle(rights));
  }, [exercicio]);

  // Efeito para validar o par quando ambos os lados são selecionados
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const combined = `${selectedLeft}:${selectedRight}`;
      
      if (exercicio.opcoes.includes(combined)) {
        // Acertou o par
        setSuccessPair({ left: selectedLeft, right: selectedRight });
        if (audioAcerto) {
          audioAcerto.currentTime = 0;
          audioAcerto.play().catch(() => {}); // catch para navegadores que bloqueiam autoplay
        }
        
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, combined]);
          setSuccessPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 1000);
      } else {
        // Errou o par
        setErrorPair({ left: selectedLeft, right: selectedRight });
        
        setTimeout(() => {
          setErrorPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 1000);
      }
    }
  }, [selectedLeft, selectedRight, exercicio.opcoes, audioAcerto]);

  // Efeito para verificar a condição de vitória
  useEffect(() => {
    if (exercicio.opcoes.length > 0 && matchedPairs.length === exercicio.opcoes.length) {
      // Pequeno delay para mostrar a animação do último botão antes de avançar
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [matchedPairs, exercicio.opcoes, onComplete]);

  const handleLeftClick = (val: string) => {
    // Previne clique se estiver processando uma animação ou se o botão já foi acertado
    if (successPair || errorPair || matchedPairs.some(p => p.startsWith(val + ':'))) return;
    // Permite desmarcar
    setSelectedLeft(val === selectedLeft ? null : val);
  };

  const handleRightClick = (val: string) => {
    if (successPair || errorPair || matchedPairs.some(p => p.endsWith(':' + val))) return;
    setSelectedRight(val === selectedRight ? null : val);
  };

  const getButtonClass = (val: string, side: 'left' | 'right') => {
    const isMatched = side === 'left' 
      ? matchedPairs.some(p => p.startsWith(val + ':'))
      : matchedPairs.some(p => p.endsWith(':' + val));
    
    // Some o botão se o par já foi resolvido
    if (isMatched) return 'opacity-0 pointer-events-none scale-95';

    const isSuccess = side === 'left' ? successPair?.left === val : successPair?.right === val;
    const isError = side === 'left' ? errorPair?.left === val : errorPair?.right === val;
    const isSelected = side === 'left' ? selectedLeft === val : selectedRight === val;

    if (isSuccess) return 'border-emerald-500 border-b-[6px] bg-emerald-100 text-emerald-800 scale-105';
    if (isError) return 'border-rose-500 border-b-[6px] bg-rose-100 text-rose-800 animate-shake';
    if (isSelected) return 'border-primary border-b-[6px] bg-primary/10 text-primary active:translate-y-1 active:border-b-2 scale-105';
    
    // Estado normal (estilo Duolingo)
    return 'border-stone-200 border-b-[6px] bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 hover:-translate-y-1 hover:border-b-[8px] active:translate-y-1 active:border-b-2';
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8 text-center max-w-xl">
        {exercicio.enunciado}
      </h1>
      
      <div className="flex w-full gap-4 md:gap-12 justify-center max-w-3xl">
        {/* Coluna da Esquerda (Tupi) */}
        <div className="flex flex-col gap-4 w-1/2 max-w-[240px]">
          {leftCol.map((item, index) => (
            <button
              key={`left-${index}`}
              onClick={() => handleLeftClick(item)}
              aria-pressed={selectedLeft === item}
              className={`px-4 py-4 md:py-5 rounded-2xl border-2 text-center font-bold text-sm md:text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${getButtonClass(item, 'left')}`}
            >
              {item}
            </button>
          ))}
        </div>
        
        {/* Coluna da Direita (Português) */}
        <div className="flex flex-col gap-4 w-1/2 max-w-[240px]">
          {rightCol.map((item, index) => (
            <button
              key={`right-${index}`}
              onClick={() => handleRightClick(item)}
              aria-pressed={selectedRight === item}
              className={`px-4 py-4 md:py-5 rounded-2xl border-2 text-center font-bold text-sm md:text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${getButtonClass(item, 'right')}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
