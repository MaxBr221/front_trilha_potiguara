
'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Check, Flag, Loader2, Info, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { PalavrasEnsino } from '@/components/features/PalavrasEnsino';
import { LigarColunasExercicio } from '@/components/features/LigarColunasExercicio';
import { AquecimentoVocabulario } from '@/components/features/AquecimentoVocabulario';
import { servicoExercicio, Exercicio } from '@/services/servicoExercicio';
import { servicoDicionario, ConteudoLinguistico } from '@/services/servicoDicionario';

export default function LicaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [vocabulario, setVocabulario] = useState<ConteudoLinguistico[]>([]);
  const [fase, setFase] = useState<'AQUECIMENTO' | 'EXERCICIOS'>('AQUECIMENTO');
  const [totalExercicios, setTotalExercicios] = useState(0);
  const [exerciciosAcertados, setExerciciosAcertados] = useState(0);
  
  const [carregando, setCarregando] = useState(true);
  const [validando, setValidando] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [respostaCertaBackend, setRespostaCertaBackend] = useState('');
  const [contextoCultural, setContextoCultural] = useState('');
  const [mostrarDica, setMostrarDica] = useState(false);
  
  // Track errors per exercise to show hints
  const [errosExercicio, setErrosExercicio] = useState<Record<string, number>>({});
  const [respostasSalvas, setRespostasSalvas] = useState<Record<string, string>>({});
  

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [dadosExercicios, dadosVocabulario] = await Promise.all([
          servicoExercicio.obterExerciciosPorLicao(id),
          servicoDicionario.obterPorLicao(id)
        ]);
        
        // Embaralha as opções de cada exercício para não ficarem sempre na mesma ordem
        const dadosEmbaralhados = dadosExercicios.map(ex => {
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
        setTotalExercicios(dadosEmbaralhados.length);
        
        if (dadosVocabulario && dadosVocabulario.length > 0) {
          setVocabulario(dadosVocabulario);
          setFase('AQUECIMENTO');
        } else {
          setFase('EXERCICIOS');
        }
      } catch (error) {
        console.error('Erro ao buscar dados da lição', error);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, [id]);

  const exercicioAtual = exercicios[0];
  const progresso = totalExercicios > 0 ? (exerciciosAcertados / totalExercicios) * 100 : 0;

  const handleCheck = async () => {
    if (!selectedAnswer || !exercicioAtual) return;
    setValidando(true);
    
    try {
      const validacao = await servicoExercicio.validarExercicio(exercicioAtual.id, selectedAnswer);
      
      setIsCorrect(validacao.correta);
      setRespostaCertaBackend(validacao.respostaCorreta || '');
      setContextoCultural(validacao.contextoCultural || 'Os povos Tupi habitavam grande parte do litoral brasileiro e sua língua influenciou fortemente o português que falamos hoje!');
      
      if (!validacao.correta) {
        setErrosExercicio(prev => ({
          ...prev,
          [exercicioAtual.id]: (prev[exercicioAtual.id] || 0) + 1
        }));
        setRespostasSalvas(prev => ({
          ...prev,
          [exercicioAtual.id]: validacao.respostaCorreta || ''
        }));
      }

      setIsChecked(true);
    } catch (error) {
      console.error('Erro ao validar resposta', error);
    } finally {
      setValidando(false);
    }
  };

  const handleNext = async () => {
    if (isCorrect) {
      setExercicios(prev => {
        const novaFila = [...prev];
        novaFila.shift();
        return novaFila;
      });
      setExerciciosAcertados(prev => prev + 1);

      setIsChecked(false);
      setSelectedAnswer(null);
      setIsCorrect(false);
      
      // Checa a condição com o tamanho atualizado
      if (exercicios.length <= 1) {
        setValidando(true);
        await servicoExercicio.concluirLicao(id);
        router.push('/dashboard');
      }
    } else {
      // Errou: remove do início e coloca no final da fila (Queue)
      setExercicios(prev => {
        const novaFila = [...prev];
        const exercicioErrado = novaFila.shift();
        if (exercicioErrado) {
          novaFila.push(exercicioErrado);
        }
        return novaFila;
      });
      
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

  if (!exercicioAtual && fase === 'EXERCICIOS') {
    if (validando) {
      return (
        <div className="h-dvh w-screen flex flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-stone-950">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-stone-600 dark:text-stone-300 font-medium">Salvando seu progresso...</p>
        </div>
      );
    }

    return (
      <div className="min-h-dvh bg-stone-50 dark:bg-stone-950 flex items-center justify-center flex-col">
        <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300 mb-4">Nenhum exercício encontrado.</h2>
        <Button onClick={() => router.push('/dashboard')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-stone-950 flex flex-col">
      <header className="h-16 flex items-center px-4 md:px-8 max-w-4xl w-full mx-auto gap-4 relative z-10">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full shrink-0"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex-1 bg-stone-200 dark:bg-stone-800 rounded-full h-4 overflow-hidden border border-stone-300/50 dark:border-stone-700">
          <div 
            className="bg-emerald-500 h-4 rounded-full transition-[width] duration-1000 ease-out" 
            style={{ width: `${progresso}%` }}
          ></div>
        </div>

        {fase === 'EXERCICIOS' && ((vocabulario && vocabulario.length > 0) || (exercicioAtual && errosExercicio[exercicioAtual.id] >= 2)) && (
          <button 
            onClick={() => setMostrarDica(true)}
            className={`p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full shrink-0 animate-in fade-in zoom-in ${
              exercicioAtual && errosExercicio[exercicioAtual.id] >= 2 
                ? 'text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 animate-pulse ring-2 ring-amber-400' 
                : 'text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
            title="Ver Dica"
          >
            <Lightbulb className="w-6 h-6" />
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {fase === 'AQUECIMENTO' ? (
          <AquecimentoVocabulario vocabulario={vocabulario} />
        ) : exercicioAtual.tipo === 'ENSINO' ? (
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

      <AnimatePresence>
        {mostrarDica && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2 text-amber-500">
                  <Lightbulb className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Dicas da Lição</h3>
                </div>
                <button 
                  onClick={() => setMostrarDica(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {exercicioAtual && errosExercicio[exercicioAtual.id] >= 2 && respostasSalvas[exercicioAtual.id] && (
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl">
                    <p className="text-amber-800 dark:text-amber-300 font-bold mb-1">Dica Especial:</p>
                    <p className="text-amber-700 dark:text-amber-400">A resposta para essa questão é: <strong>{respostasSalvas[exercicioAtual.id]}</strong></p>
                  </div>
                )}
                
                {vocabulario && vocabulario.length > 0 && (
                  <>
                    <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
                      Relembre as palavras dessa lição para te ajudar com a questão:
                    </p>
                    <div className="flex flex-col gap-3">
                      {vocabulario.map(v => (
                        <div key={v.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-100 dark:border-stone-800 gap-1">
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-primary">{v.palavraTupi}</span>
                            {v.fonetica && <span className="text-xs text-stone-500 italic">/{v.fonetica}/</span>}
                          </div>
                          <span className="text-stone-600 dark:text-stone-300 font-medium">{v.traducaoPtBr}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
                <Button className="w-full" onClick={() => setMostrarDica(false)}>
                  Voltar para o Exercício
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            disabled={
              fase === 'AQUECIMENTO' ? false :
              (exercicioAtual?.tipo !== 'ENSINO' && exercicioAtual?.tipo !== 'LIGAR_COLUNAS' && !selectedAnswer) || validando || (exercicioAtual?.tipo === 'LIGAR_COLUNAS' && !isChecked)
            }
            isLoading={validando}
            onClick={
              fase === 'AQUECIMENTO' ? () => setFase('EXERCICIOS') :
              exercicioAtual?.tipo === 'ENSINO' ? () => { setIsCorrect(true); handleNext(); } : (isChecked ? handleNext : handleCheck)
            }
            className="w-full md:w-auto min-w-[150px] font-bold"
          >
            {fase === 'AQUECIMENTO' ? 'Começar Exercícios' : (isChecked || exercicioAtual?.tipo === 'ENSINO' ? 'Continuar' : 'Verificar')}
          </Button>
        </div>
      </footer>
    </div>
  );
}
