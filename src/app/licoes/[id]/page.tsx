
'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Check, Flag, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { PalavrasEnsino } from '@/components/features/PalavrasEnsino';
import { LigarColunasExercicio } from '@/components/features/LigarColunasExercicio';
import { servicoExercicio, Exercicio } from '@/services/servicoExercicio';

export default function LicaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [validando, setValidando] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [respostaCertaBackend, setRespostaCertaBackend] = useState('');
  const [contextoCultural, setContextoCultural] = useState('');
  

  useEffect(() => {
    const carregarExercicios = async () => {
      try {
        const dados = await servicoExercicio.obterExerciciosPorLicao(id);
        
        // Embaralha as opções de cada exercício para não ficarem sempre na mesma ordem
        const dadosEmbaralhados = dados.map(ex => {
          if (ex.opcoes && ex.opcoes.length > 0 && ex.tipo !== 'ENSINO') {
            const opcoes = [...ex.opcoes];
            for (let i = opcoes.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]];
            }
            return { ...ex, opcoes };
          }
          return ex;
        });

        setExercicios(dadosEmbaralhados);
      } catch (error) {
        console.error('Erro ao buscar exercícios', error);
      } finally {
        setCarregando(false);
      }
    };
    carregarExercicios();
  }, [id]);

  const exercicioAtual = exercicios[indiceAtual];
  const progresso = exercicios.length > 0 ? (indiceAtual / exercicios.length) * 100 : 0;

  const handleCheck = async () => {
    if (!selectedAnswer || !exercicioAtual) return;
    setValidando(true);
    
    try {
      const validacao = await servicoExercicio.validarExercicio(exercicioAtual.id, selectedAnswer);
      
      setIsCorrect(validacao.correta);
      setRespostaCertaBackend(validacao.respostaCorreta || '');
      setContextoCultural(validacao.contextoCultural || 'Os povos Tupi habitavam grande parte do litoral brasileiro e sua língua influenciou fortemente o português que falamos hoje!');
      
      setIsChecked(true);
    } catch (error) {
      console.error('Erro ao validar resposta', error);
    } finally {
      setValidando(false);
    }
  };

  const handleNext = async () => {
    if (isCorrect) {
      if (indiceAtual + 1 < exercicios.length) {
        setIndiceAtual(prev => prev + 1);
        setIsChecked(false);
        setSelectedAnswer(null);
        setIsCorrect(false);
      } else {
        setValidando(true);
        await servicoExercicio.concluirLicao(id);
        router.push('/dashboard');
      }
    } else {
      setIsChecked(false);
      setSelectedAnswer(null);
    }
  };

  if (carregando) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!exercicioAtual) {
    return (
      <div className="min-h-dvh bg-stone-50 dark:bg-stone-950 flex items-center justify-center flex-col">
        <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300 mb-4">Nenhum exercício encontrado.</h2>
        <Button onClick={() => router.push('/dashboard')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-stone-950 flex flex-col">
      <header className="h-16 flex items-center px-4 md:px-8 max-w-4xl w-full mx-auto gap-4">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex-1 bg-stone-200 dark:bg-stone-800 rounded-full h-4 overflow-hidden border border-stone-300/50 dark:border-stone-700">
          <div 
            className="bg-emerald-500 h-4 rounded-full transition-[width] duration-1000 ease-out" 
            style={{ width: `${progresso}%` }}
          ></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {exercicioAtual.tipo === 'ENSINO' ? (
          <PalavrasEnsino exercicio={exercicioAtual} />
        ) : exercicioAtual.tipo === 'LIGAR_COLUNAS' ? (
          <LigarColunasExercicio exercicio={exercicioAtual} onComplete={() => { setIsChecked(true); setIsCorrect(true); }} />
        ) : (
          <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-8">
              {exercicioAtual.enunciado}
            </h1>
            
            <div className="grid gap-3">
              {exercicioAtual.opcoes.map((option) => {
                const isSelected = selectedAnswer === option;
                let btnClass = 'border-stone-200 dark:border-stone-800 border-b-[6px] bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-700 hover:-translate-y-1 hover:border-b-[8px] active:translate-y-1 active:border-b-2';
                
                if (isSelected) {
                  btnClass = 'border-primary dark:border-primary-600 border-b-[6px] bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 active:translate-y-1 active:border-b-2';
                }
                
                if (isChecked && selectedAnswer === option) {
                  btnClass = isCorrect 
                    ? 'border-emerald-500 dark:border-emerald-600 border-b-[6px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                    : 'border-rose-500 dark:border-rose-600 border-b-[6px] bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 animate-shake';
                }

                return (
                  <button
                    key={option}
                    disabled={isChecked || validando}
                    onClick={() => setSelectedAnswer(option)}
                    aria-pressed={isSelected}
                    className={`px-4 py-4 rounded-2xl border-2 text-left font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${btnClass} disabled:opacity-80 disabled:cursor-not-allowed`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className={`border-t-2 transition-colors duration-300 ${isChecked ? (isCorrect ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20' : 'border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20') : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950'}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto" aria-live="polite">
            <AnimatePresence>
              {isChecked && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'}`}
                    >
                      {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                    </motion.div>
                    <div>
                      <h3 className={`text-xl font-bold ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {isCorrect ? 'Excelente!' : 'Resposta incorreta'}
                      </h3>
                      {!isCorrect && (
                        <p className="text-rose-600 dark:text-rose-400 font-medium mt-1">Resposta correta: {respostaCertaBackend}</p>
                      )}
                    </div>
                  </div>
                  

                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button
            size="lg"
            disabled={(exercicioAtual.tipo !== 'ENSINO' && exercicioAtual.tipo !== 'LIGAR_COLUNAS' && !selectedAnswer) || validando || (exercicioAtual.tipo === 'LIGAR_COLUNAS' && !isChecked)}
            isLoading={validando}
            onClick={exercicioAtual.tipo === 'ENSINO' ? () => { setIsCorrect(true); handleNext(); } : (isChecked ? handleNext : handleCheck)}
            className="w-full md:w-auto min-w-[150px] font-bold"
          >
            {isChecked || exercicioAtual.tipo === 'ENSINO' ? 'Continuar' : 'Verificar'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
