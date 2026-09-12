'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Heart, Check, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock simple exercise for MVP
const exercicioFalso = {
  id: 1001,
  type: 'translate',
  question: 'Como se diz "Olá" em Tupi?',
  options: ['Ikatú', 'Eba', 'Kwá', 'Mba\'éichapa'], // Just a mock example
  correctAnswer: 'Ikatú' // Note: This is an example, actual tupi for hello could be different
};

export default function LicaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lives, setLives] = useState(3);
  const [progresso, setProgress] = useState(25);

  const handleCheck = () => {
    if (!selectedAnswer) return;
    
    if (selectedAnswer === exercicioFalso.correctAnswer) {
      setIsCorrect(true);
      setProgress(50);
    } else {
      setIsCorrect(false);
      setLives(prev => Math.max(0, prev - 1));
    }
    setIsChecked(true);
  };

  const handleNext = () => {
    if (isCorrect) {
      // In a real app, go to next exercise. Here we just redirect back to the trail
      router.push('/trilhas/1');
    } else {
      // Try again
      setIsChecked(false);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar (Progress & Lives) */}
      <header className="h-16 flex items-center px-4 md:px-8 max-w-4xl w-full mx-auto gap-4">
        <button 
          onClick={() => router.push('/trilhas/1')}
          className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex-1 bg-stone-200 rounded-full h-3.5">
          <div 
            className="bg-emerald-500 h-3.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progresso}%` }}
          ></div>
        </div>
        
        <div className="flex items-center gap-1.5 text-rose-500 font-bold">
          <Heart className="w-6 h-6 fill-rose-500" />
          <span>{lives}</span>
        </div>
      </header>

      {/* Main Content (Exercise) */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8">
            {exercicioFalso.question}
          </h1>
          
          <div className="grid gap-3">
            {exercicioFalso.options.map((option) => {
              const isSelected = selectedAnswer === option;
              let btnClass = 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300';
              
              if (isSelected) {
                btnClass = 'border-primary bg-primary/5 text-primary shadow-sm';
              }
              
              if (isChecked && isSelected) {
                btnClass = isCorrect 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-rose-500 bg-rose-50 text-rose-700';
              }

              return (
                <button
                  key={option}
                  disabled={isChecked}
                  onClick={() => setSelectedAnswer(option)}
                  className={`px-4 py-4 rounded-xl border-2 text-left font-medium transition-all ${btnClass} disabled:cursor-default`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Area (Check/Continue Botao) */}
      <footer className={`border-t-2 ${isChecked ? (isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50') : 'border-stone-200 bg-white'}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Feedback Message */}
          <div className="w-full md:w-auto">
            {isChecked && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isCorrect ? 'Excelente!' : 'Resposta incorreta'}
                  </h3>
                  {!isCorrect && (
                    <p className="text-rose-600 font-medium mt-1">Resposta correta: {exercicioFalso.correctAnswer}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Button
            size="lg"
            disabled={!selectedAnswer}
            onClick={isChecked ? handleNext : handleCheck}
            className={`w-full md:w-auto min-w-[150px] ${
              isChecked 
                ? (isCorrect ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500' : 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500') 
                : ''
            }`}
          >
            {isChecked ? 'Continuar' : 'Verificar'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
