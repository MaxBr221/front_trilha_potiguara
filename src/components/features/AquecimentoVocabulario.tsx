'use client';

import { ConteudoLinguistico } from '@/services/servicoDicionario';
import Image from 'next/image';

interface AquecimentoVocabularioProps {
  vocabulario: ConteudoLinguistico[];
}

export function AquecimentoVocabulario({ vocabulario }: AquecimentoVocabularioProps) {
  if (!vocabulario || vocabulario.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-8 text-center max-w-xl">
        Vamos conhecer as palavras desta lição!
      </h1>
      
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {vocabulario.map((palavra) => (
          <div 
            key={palavra.id} 
            className="flex flex-col bg-white dark:bg-stone-900 rounded-3xl border-2 border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:-translate-y-1 transition-transform duration-300"
          >
            {palavra.imageUrl && (
              <div className="w-full h-48 relative bg-stone-100 dark:bg-stone-800">
                <Image 
                  src={palavra.imageUrl} 
                  alt={palavra.palavraTupi}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6 flex flex-col gap-2">
              <div className="flex items-end gap-3">
                <h3 className="text-2xl font-bold text-primary dark:text-primary-400">
                  {palavra.palavraTupi}
                </h3>
                {palavra.fonetica && (
                  <span className="text-stone-500 dark:text-stone-400 text-sm mb-1 italic">
                    /{palavra.fonetica}/
                  </span>
                )}
              </div>
              <p className="text-lg font-medium text-stone-700 dark:text-stone-300">
                {palavra.traducaoPtBr}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
