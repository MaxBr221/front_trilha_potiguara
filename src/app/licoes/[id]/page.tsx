
'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Check, Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
  

  useEffect(() => {
    const carregarExercicios = async () => {
      try {
        const dados = await servicoExercicio.obterExerciciosPorLicao(id);
        setExercicios(dados);
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
      <div className="h-screen w-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!exercicioAtual) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center flex-col">
        <h2 className="text-xl font-bold text-stone-700 mb-4">Nenhum exercício encontrado.</h2>
        <Button onClick={() => router.push('/dashboard')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-16 flex items-center px-4 md:px-8 max-w-4xl w-full mx-auto gap-4">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 text-stone-400 hover:text-stone-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex-1 bg-stone-200 rounded-full h-4 overflow-hidden border border-stone-300/50">
          <div 
            className="bg-emerald-500 h-4 rounded-full transition-[width] duration-1000 ease-out" 
            style={{ width: `${progresso}%` }}
          ></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8">
            {exercicioAtual.enunciado}
          </h1>
          
          <div className="grid gap-3">
            {exercicioAtual.opcoes.map((option) => {
              const isSelected = selectedAnswer === option;
              let btnClass = 'border-stone-200 border-b-[6px] bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 hover:-translate-y-1 hover:border-b-[8px] active:translate-y-1 active:border-b-2';
              
              if (isSelected) {
                btnClass = 'border-primary border-b-[6px] bg-primary/10 text-primary active:translate-y-1 active:border-b-2';
              }
              
              if (isChecked && isSelected) {
                btnClass = isCorrect 
                  ? 'border-emerald-500 border-b-[6px] bg-emerald-100 text-emerald-800'
                  : 'border-rose-500 border-b-[6px] bg-rose-100 text-rose-800 animate-shake';
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
      </main>

      <footer className={`border-t-2 transition-colors duration-300 ${isChecked ? (isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50') : 'border-stone-200 bg-white'}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto" aria-live="polite">
            {isChecked && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-rose-100 text-rose-600 animate-shake'}`}>
                  {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isCorrect ? 'Excelente!' : 'Resposta incorreta'}
                  </h3>
                  {!isCorrect && (
                    <p className="text-rose-600 font-medium mt-1">Resposta correta: {respostaCertaBackend}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Button
            size="lg"
            disabled={!selectedAnswer || validando}
            isLoading={validando}
            onClick={isChecked ? handleNext : handleCheck}
            className={`w-full md:w-auto min-w-[150px] font-bold transition-all duration-200 border-b-4 hover:-translate-y-0.5 hover:border-b-[6px] active:translate-y-1 active:border-b-0 ${
              isChecked 
                ? (isCorrect ? 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-400 focus:ring-emerald-500' : 'bg-rose-500 text-white border-rose-700 hover:bg-rose-400 focus:ring-rose-500') 
                : 'bg-primary text-white border-emerald-800 hover:bg-emerald-600 focus:ring-primary'
            }`}
          >
            {isChecked ? 'Continuar' : 'Verificar'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
