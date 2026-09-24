'use client';

import { Exercicio } from '@/services/servicoExercicio';

interface PalavrasEnsinoProps {
  exercicio: Exercicio;
}

export function PalavrasEnsino({ exercicio }: PalavrasEnsinoProps) {
  const pairs = exercicio.opcoes.map(op => {
    const parts = op.split(':');
    return { left: parts[0] || '', right: parts[1] || '' };
  });

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-8 text-center max-w-xl">
        {exercicio.enunciado || 'Aprenda estas palavras antes de continuar'}
      </h1>
      
      <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border-2 border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        <div className="flex bg-stone-100 dark:bg-stone-800/50 border-b-2 border-stone-200 dark:border-stone-800">
          <div className="flex-1 py-4 px-6 font-bold text-stone-600 dark:text-stone-400 text-center border-r-2 border-stone-200 dark:border-stone-800 uppercase tracking-wider">
            Tupi
          </div>
          <div className="flex-1 py-4 px-6 font-bold text-stone-600 dark:text-stone-400 text-center uppercase tracking-wider">
            Português
          </div>
        </div>
        
        <div className="divide-y-2 divide-stone-100 dark:divide-stone-800">
          {pairs.map((pair, idx) => (
            <div key={idx} className="flex hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
              <div className="flex-1 py-4 px-6 font-bold text-primary dark:text-primary-400 text-center border-r-2 border-stone-100 dark:border-stone-800 text-lg">
                {pair.left}
              </div>
              <div className="flex-1 py-4 px-6 font-medium text-stone-700 dark:text-stone-300 text-center text-lg">
                {pair.right}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
