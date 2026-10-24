
'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Check, Flag, Loader2, Info, Lightbulb, Trophy, Sparkles, Zap, Target, Clock, CheckCircle2, ArrowRight, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import { Button } from '@/components/ui/Button';
import { PalavrasEnsino } from '@/components/features/PalavrasEnsino';
import { LigarColunasExercicio } from '@/components/features/LigarColunasExercicio';
import { PronunciaExercicio } from '@/components/features/PronunciaExercicio';
import { AquecimentoVocabulario } from '@/components/features/AquecimentoVocabulario';
import { servicoExercicio, Exercicio, ValidacaoAudioResponse, decodificarEntidadesHtml } from '@/services/servicoExercicio';
import { servicoDicionario, ConteudoLinguistico } from '@/services/servicoDicionario';
import { sons } from '@/utils/audio';

export default function LicaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAutenticacao();
  
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [vocabulario, setVocabulario] = useState<ConteudoLinguistico[]>([]);
  const [fase, setFase] = useState<'AQUECIMENTO' | 'EXERCICIOS'>('AQUECIMENTO');
  const [totalExercicios, setTotalExercicios] = useState(0);
  const [exerciciosAcertados, setExerciciosAcertados] = useState(0);
  const [xpGanhoTotal, setXpGanhoTotal] = useState(0);
  const [mostrarModalCadastro, setMostrarModalCadastro] = useState(false);
  const [licaoConcluida, setLicaoConcluida] = useState(false);
  const [salvandoProgresso, setSalvandoProgresso] = useState(false);
  const [progressoSalvo, setProgressoSalvo] = useState(false);
  const [tempoGastoSegundos, setTempoGastoSegundos] = useState(0);
  const tempoInicioRef = useRef<number>(Date.now());
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [avisoFalaDesativada, setAvisoFalaDesativada] = useState(false);
  const trilhaIdRef = useRef<string | null>(null);
  const salvarPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (fase === 'EXERCICIOS') {
      tempoInicioRef.current = Date.now();
    }
  }, [fase]);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const { servicoTrilha } = await import('@/services/servicoTrilha');
        const trilhas = await servicoTrilha.obterTrilhas();
        for (const t of trilhas) {
          if (cancelado) break;
          const modulos = await servicoTrilha.obterModulosPorIdTrilha(t.id);
          if (modulos.some(m => m.lessons.some(l => String(l.id) === String(id)))) {
            trilhaIdRef.current = String(t.id);
            break;
          }
        }
      } catch (e) {
        console.warn('Erro ao pré-carregar trilhaId', e);
      }
    })();
    return () => { cancelado = true; };
  }, [id]);
  
  const [carregando, setCarregando] = useState(true);
  const [validando, setValidando] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [respostaCertaBackend, setRespostaCertaBackend] = useState('');
  const [feedbackPedagogico, setFeedbackPedagogico] = useState<string | null>(null);
  const [resultadoAudio, setResultadoAudio] = useState<ValidacaoAudioResponse | null>(null);
  const [contextoCultural, setContextoCultural] = useState('');
  const [mostrarDica, setMostrarDica] = useState(false);
  
  // Track errors per exercise to show hints
  const [errosExercicio, setErrosExercicio] = useState<Record<string, number>>({});
  const [respostasSalvas, setRespostasSalvas] = useState<Record<string, string>>({});
  const [dicasExercicio, setDicasExercicio] = useState<Record<string, string>>({});
  const [carregandoDica, setCarregandoDica] = useState<boolean>(false);
  const [dicaEstaticaExibida, setDicaEstaticaExibida] = useState<Record<string, number>>({});
  const [saindo, setSaindo] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const inserirCaractere = (caractere: string) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart ?? (selectedAnswer || '').length;
      const end = input.selectionEnd ?? (selectedAnswer || '').length;
      const atual = selectedAnswer || '';
      const novoValor = atual.substring(0, start) + caractere + atual.substring(end);
      setSelectedAnswer(novoValor);
      
      setTimeout(() => {
        input.focus();
        const novoCursor = start + caractere.length;
        input.setSelectionRange(novoCursor, novoCursor);
      }, 0);
    } else {
      setSelectedAnswer((prev) => (prev || '') + caractere);
    }
  };

  const handleExit = async () => {
    setSaindo(true);
    if (trilhaIdRef.current) {
      router.push(`/trilhas/${trilhaIdRef.current}`);
      return;
    }
    try {
      const { servicoTrilha } = await import('@/services/servicoTrilha');
      const trilhas = await servicoTrilha.obterTrilhas();
      for (const t of trilhas) {
        const modulos = await servicoTrilha.obterModulosPorIdTrilha(t.id);
        if (modulos.some(m => m.lessons.some(l => String(l.id) === String(id)))) {
          trilhaIdRef.current = String(t.id);
          router.push(`/trilhas/${t.id}`);
          return;
        }
      }
    } catch (e) {
      console.error('Erro ao buscar trilha da licao', e);
    }
    router.push('/dashboard');
  };

  const handleContinuar = async () => {
    setSaindo(true);
    if (salvarPromiseRef.current) {
      try {
        await salvarPromiseRef.current;
      } catch (e) {
        console.warn('Erro ao aguardar salvamento da lição:', e);
      }
    } else if (salvandoProgresso) {
      try {
        await servicoExercicio.concluirLicao(id);
      } catch (e) {
        console.warn('Erro ao concluir lição:', e);
      }
    }
    await handleExit();
  };
  

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [dadosExercicios, dadosVocabulario] = await Promise.all([
          servicoExercicio.obterExerciciosPorLicao(id),
          servicoDicionario.obterPorLicao(id)
        ]);
        
        // Embaralha as opções de cada exercício para não ficarem sempre na mesma ordem
        const dadosEmbaralhados = dadosExercicios.map(ex => {
          if (ex.opcoes && ex.opcoes.length > 0 && ex.tipo !== 'ENSINO' && ex.tipo !== 'DIGITACAO' && ex.tipo !== 'PRONUNCIA') {
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

  // Scaffolding progressivo de erros:
  // - 1º Erro: Busca e exibe dica gerada por IA (GET /exercicios/{id}/dica) no topo do exercício
  // - 2º Erro: Exibe a Dica Estática / Conteúdo Teórico da Lição quando a questão retorna
  useEffect(() => {
    if (!exercicioAtual || fase !== 'EXERCICIOS' || isChecked) return;

    const idAtual = String(exercicioAtual.id);
    const erros = errosExercicio[idAtual] || 0;

    if (erros === 1) {
      if (!dicasExercicio[idAtual] && !carregandoDica) {
        setCarregandoDica(true);
        servicoExercicio.obterDicaExercicio(exercicioAtual.id)
          .then((dica) => {
            if (dica) {
              setDicasExercicio((prev) => ({ ...prev, [idAtual]: dica }));
            }
          })
          .catch((err) => console.error('Erro ao buscar dica do tutor:', err))
          .finally(() => setCarregandoDica(false));
      }
    } else if (erros >= 2) {
      // Quando a questão volta após o 2º erro, abre o modal de Dica Estática / Revisão Teórica
      if (dicaEstaticaExibida[idAtual] !== erros) {
        setMostrarDica(true);
        setDicaEstaticaExibida((prev) => ({ ...prev, [idAtual]: erros }));
      }
    }
  }, [exercicioAtual?.id, isChecked, fase, errosExercicio, dicasExercicio, dicaEstaticaExibida, carregandoDica]);

  const handleCheck = async () => {
    if (!selectedAnswer || !exercicioAtual) return;
    setValidando(true);
    
    try {
      const validacao = await servicoExercicio.validarExercicio(exercicioAtual.id, selectedAnswer.trim());
      
      setIsCorrect(validacao.correta);
      setRespostaCertaBackend(validacao.respostaCorreta || '');
      setFeedbackPedagogico(validacao.feedbackPedagogico || null);
      setContextoCultural(validacao.contextoCultural || 'Os povos Tupi habitavam grande parte do litoral brasileiro e sua língua influenciou fortemente o português que falamos hoje!');
      
      if (validacao.correta) {
        sons.sucesso();
        setXpGanhoTotal(prev => prev + (validacao.xpGanho || 0));
      } else {
        sons.erro();
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

  const handleValidatedAudio = (validacao: ValidacaoAudioResponse) => {
    setResultadoAudio(validacao);
    setIsCorrect(validacao.correta);
    setFeedbackPedagogico(validacao.feedbackPedagogico || null);
    setRespostaCertaBackend(validacao.respostaCorreta || exercicioAtual?.respostaCorreta || '');
    setContextoCultural(validacao.contextoCultural || 'A oralidade é parte viva da tradição e memória dos povos indígenas!');

    if (validacao.correta) {
      sons.sucesso();
      const xp = validacao.xpGanho ?? (exercicioAtual?.pontuacaoXp || 15);
      setXpGanhoTotal(prev => prev + xp);
    } else {
      sons.erro();
      if (exercicioAtual) {
        setErrosExercicio(prev => ({
          ...prev,
          [exercicioAtual.id]: (prev[exercicioAtual.id] || 0) + 1
        }));
        setRespostasSalvas(prev => ({
          ...prev,
          [exercicioAtual.id]: validacao.respostaCorreta || exercicioAtual.respostaCorreta || ''
        }));
      }
    }

    setIsChecked(true);
  };

  const handleSkipPronuncia = (desativarTodos = false) => {
    const filaAtual = [...exercicios];
    const exercicioPulado = filaAtual.shift();

    const novaFila = desativarTodos
      ? filaAtual.filter(ex => ex.tipo !== 'PRONUNCIA')
      : (exercicioPulado ? [...filaAtual, exercicioPulado] : filaAtual);

    setExercicios(novaFila);
    setIsChecked(false);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setResultadoAudio(null);
    setFeedbackPedagogico(null);

    if (desativarTodos) {
      setAvisoFalaDesativada(true);
      setTimeout(() => setAvisoFalaDesativada(false), 4500);

      // Se a fila esvaziou após desativar todos os de fala, conclui comemorativamente
      if (novaFila.length === 0) {
        sons.conclusao();
        const tempoTotal = Math.max(1, Math.floor((Date.now() - tempoInicioRef.current) / 1000));
        setTempoGastoSegundos(tempoTotal);
        setLicaoConcluida(true);

        if (isAuthenticated) {
          setSalvandoProgresso(true);
          const p = servicoExercicio.concluirLicao(id);
          salvarPromiseRef.current = p;
          p.then(() => setProgressoSalvo(true))
           .catch(err => console.error('Erro ao registrar conclusão da lição:', err))
           .finally(() => setSalvandoProgresso(false));
        } else {
          setMostrarModalCadastro(true);
        }
      }
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
      setFeedbackPedagogico(null);
      setResultadoAudio(null);
      
      // Checa a condição com o tamanho atualizado
      if (exercicios.length <= 1) {
        sons.conclusao();
        const tempoTotal = Math.max(1, Math.floor((Date.now() - tempoInicioRef.current) / 1000));
        setTempoGastoSegundos(tempoTotal);
        setLicaoConcluida(true);

        if (isAuthenticated) {
          setSalvandoProgresso(true);
          const p = servicoExercicio.concluirLicao(id);
          salvarPromiseRef.current = p;
          p.then(() => {
            setProgressoSalvo(true);
          })
          .catch(err => {
            console.error('Erro ao registrar conclusão da lição:', err);
          })
          .finally(() => {
            setSalvandoProgresso(false);
          });
        } else {
          setMostrarModalCadastro(true);
        }
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
      setFeedbackPedagogico(null);
      setResultadoAudio(null);
    }
  };

  if (carregando) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if ((!exercicioAtual && fase === 'EXERCICIOS') || licaoConcluida) {
    if (!licaoConcluida && saindo) {
      return (
        <div className="h-dvh w-screen flex flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-stone-950">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-stone-600 dark:text-stone-300 font-medium">Voltando para a trilha...</p>
        </div>
      );
    }

    if (licaoConcluida || (!exercicioAtual && totalExercicios > 0)) {
      const totalErros = Object.values(errosExercicio).reduce((acc, curr) => acc + curr, 0);
      const precisao = totalExercicios > 0
        ? Math.max(10, Math.round((totalExercicios / (totalExercicios + totalErros)) * 100))
        : 100;
      const minutos = Math.floor(tempoGastoSegundos / 60);
      const segundos = tempoGastoSegundos % 60;
      const tempoFormatado = minutos > 0 
        ? `${minutos}m ${segundos < 10 ? '0' : ''}${segundos}s` 
        : `${segundos}s`;
      const xpFinal = xpGanhoTotal > 0 ? xpGanhoTotal : (totalExercicios * 15);

      return (
        <div className="relative min-h-dvh w-screen flex flex-col items-center justify-between p-4 md:p-8 bg-stone-50 dark:bg-stone-950 overflow-x-hidden selection:bg-none">
          {windowSize.width > 0 && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={350}
              gravity={0.2}
            />
          )}

          {/* Header com status de sincronização */}
          <div className="w-full max-w-lg flex justify-end pt-2">
            {isAuthenticated && (
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-sm shadow-xs transition-all">
                {salvandoProgresso ? (
                  <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    Salvando progresso...
                  </span>
                ) : progressoSalvo ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Progresso sincronizado!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
                    Pronto para continuar
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Conteúdo Central Comemorativo Estilo Duolingo */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg text-center py-4">
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-amber-400/25 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative w-28 h-28 md:w-32 md:h-32 bg-gradient-to-tr from-amber-400 to-amber-200 dark:from-amber-500 dark:to-yellow-300 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/20 border-4 border-white dark:border-stone-900">
                <Trophy className="w-14 h-14 md:w-16 md:h-16 text-amber-900 dark:text-amber-950 fill-amber-900/10" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-950 p-2 rounded-full shadow-md"
              >
                <Sparkles className="w-5 h-5 fill-yellow-950" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-3.5 py-1 mb-2 text-xs font-black tracking-widest uppercase bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">
                Katueté! 🎉
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-stone-800 dark:text-stone-100 tracking-tight mb-2">
                Lição Concluída!
              </h1>
              <p className="text-sm md:text-base text-stone-600 dark:text-stone-300 max-w-md mx-auto mb-6">
                Você mandou muito bem e fortaleceu seu domínio da língua Tupi Potiguara!
              </p>
            </motion.div>

            {/* Grid com os 3 cards estatísticos clássicos do Duolingo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-3 gap-3 md:gap-4 w-full mb-6"
            >
              {/* Card XP */}
              <div className="bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-500/20 dark:border-amber-700/40 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Total XP</span>
                </div>
                <span className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">
                  +{xpFinal}
                </span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-0.5">
                  Pontos ganhos
                </span>
              </div>

              {/* Card Precisão */}
              <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border-2 border-emerald-500/20 dark:border-emerald-700/40 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Precisão</span>
                </div>
                <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {precisao}%
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-0.5">
                  {precisao >= 90 ? 'Incrível!' : precisao >= 70 ? 'Muito bom!' : 'Praticando!'}
                </span>
              </div>

              {/* Card Tempo */}
              <div className="bg-sky-500/10 dark:bg-sky-950/30 border-2 border-sky-500/20 dark:border-sky-700/40 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>Tempo</span>
                </div>
                <span className="text-xl md:text-2xl font-black text-sky-600 dark:text-sky-400">
                  {tempoFormatado}
                </span>
                <span className="text-[10px] text-sky-600/80 dark:text-sky-400/80 font-medium mt-0.5">
                  {tempoGastoSegundos < 120 ? 'Rápido!' : 'Foco total!'}
                </span>
              </div>
            </motion.div>

            {/* Mensagem de incentivo se não estiver logado */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 text-xs md:text-sm text-stone-700 dark:text-stone-300 w-full mb-4"
              >
                Crie um perfil para <strong>salvar esses pontos</strong>, manter sua ofensiva diária e acompanhar sua evolução na trilha!
              </motion.div>
            )}
          </div>

          {/* Footer com Botões de Ação */}
          <div className="w-full max-w-lg pb-4 pt-2">
            {isAuthenticated ? (
              <Button
                size="lg"
                disabled={saindo}
                onClick={handleContinuar}
                className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {saindo ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Carregando trilha...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar</span>
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/25"
                  onClick={() => {
                    localStorage.setItem('pendingLessonCompletion', String(id));
                    localStorage.setItem('pendingLessonXP', String(xpFinal));
                    router.push('/cadastro');
                  }}
                >
                  Criar Conta e Salvar Progresso
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-12 text-base font-bold rounded-2xl border-stone-300 dark:border-stone-700"
                  onClick={() => {
                    localStorage.setItem('pendingLessonCompletion', String(id));
                    localStorage.setItem('pendingLessonXP', String(xpFinal));
                    router.push('/login');
                  }}
                >
                  Já tenho conta (Entrar)
                </Button>
              </div>
            )}
          </div>
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
    <div className="min-h-dvh bg-white dark:bg-stone-950 flex flex-col relative">
      <AnimatePresence>
        {avisoFalaDesativada && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white dark:bg-stone-100 dark:text-stone-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs md:text-sm font-semibold border border-stone-700/50 backdrop-blur-md pointer-events-none"
          >
            <VolumeX className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Exercícios de pronúncia desativados nesta lição!</span>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="h-16 flex items-center px-4 md:px-8 max-w-4xl w-full mx-auto gap-4 relative z-10">
        <button 
          onClick={handleExit}
          disabled={saindo}
          className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full shrink-0 disabled:opacity-50"
        >
          {saindo ? <Loader2 className="w-6 h-6 animate-spin" /> : <X className="w-6 h-6" />}
        </button>
        
        <div className="flex-1 bg-stone-200 dark:bg-stone-800 rounded-full h-4 overflow-hidden border border-stone-300/50 dark:border-stone-700">
          <div 
            className="bg-emerald-500 h-4 rounded-full transition-[width] duration-1000 ease-out" 
            style={{ width: `${progresso}%` }}
          ></div>
        </div>

        {fase === 'EXERCICIOS' && exercicioAtual && (errosExercicio[exercicioAtual.id] || 0) >= 2 && !isChecked && (
          <button 
            onClick={() => setMostrarDica(true)}
            className="p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full shrink-0 animate-in fade-in zoom-in text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 animate-pulse ring-2 ring-amber-400"
            title="Ver Conteúdo Teórico"
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
        ) : (
          <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Balão / Card amigável com a Dica retornada da IA (Pista do Tutor) */}
            {errosExercicio[exercicioAtual.id] >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-6 p-4 md:p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/70 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/60 dark:from-amber-950/40 dark:via-stone-900 dark:to-orange-950/20 shadow-md flex flex-col gap-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-200/90 dark:bg-amber-800/70 text-amber-900 dark:text-amber-200 text-base shadow-xs shrink-0">
                      💡
                    </span>
                    <div>
                      <h2 className="font-bold text-amber-950 dark:text-amber-200 text-sm md:text-base leading-tight">
                        Pista do Tutor
                      </h2>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/80 dark:text-amber-400/80">
                        Auxílio Pedagógico
                      </p>
                    </div>
                  </div>

                  {errosExercicio[exercicioAtual.id] >= 2 && (
                    <button
                      type="button"
                      onClick={() => setMostrarDica(true)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-200/90 hover:bg-amber-300 dark:bg-amber-800/80 dark:hover:bg-amber-700 text-amber-950 dark:text-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Revisar Teoria</span>
                    </button>
                  )}
                </div>

                {carregandoDica && !dicasExercicio[exercicioAtual.id] ? (
                  <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm italic py-1 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Consultando o tutor para uma pista...</span>
                  </div>
                ) : dicasExercicio[exercicioAtual.id] ? (
                  <p className="text-stone-800 dark:text-stone-200 text-sm md:text-base font-medium leading-relaxed pl-3 border-l-2 border-amber-400 dark:border-amber-600 italic">
                    &ldquo;{dicasExercicio[exercicioAtual.id]}&rdquo;
                  </p>
                ) : (
                  <p className="text-stone-600 dark:text-stone-400 text-sm italic pl-3 border-l-2 border-amber-400/60">
                    Preste atenção nas raízes e terminações das palavras para encontrar a resposta certa!
                  </p>
                )}
              </motion.div>
            )}

            {exercicioAtual.tipo === 'LIGAR_COLUNAS' ? (
              <LigarColunasExercicio exercicio={exercicioAtual} onComplete={() => { setIsChecked(true); setIsCorrect(true); }} />
            ) : exercicioAtual.tipo === 'PRONUNCIA' ? (
              <PronunciaExercicio
                exercicio={exercicioAtual}
                onValidated={handleValidatedAudio}
                onSkip={handleSkipPronuncia}
                isValidating={validando}
                isAnswered={isChecked}
                validationResult={resultadoAudio}
                exibirDetalhesCard={false}
              />
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-8">
                  {exercicioAtual.enunciado}
                </h1>
                
                {exercicioAtual.tipo !== 'DIGITACAO' && exercicioAtual.opcoes && exercicioAtual.opcoes.length > 0 ? (
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
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="relative w-full">
                      <input
                        ref={inputRef}
                        type="text"
                        disabled={isChecked || validando}
                        value={selectedAnswer || ''}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && selectedAnswer?.trim() && !validando) {
                            if (!isChecked) {
                              handleCheck();
                            } else {
                              handleNext();
                            }
                          }
                        }}
                        placeholder="Digite a palavra em Tupi..."
                        className={`w-full px-5 py-4 text-lg md:text-xl rounded-2xl border-2 bg-white dark:bg-stone-900 font-medium transition-all outline-none shadow-sm focus:ring-2 focus:ring-primary ${
                          isChecked 
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200'
                              : 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-200'
                            : 'border-stone-200 dark:border-stone-800 focus:border-primary text-stone-800 dark:text-stone-100 placeholder:text-stone-400'
                        }`}
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />
                    </div>
                    
                    {!isChecked && (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                          Caracteres especiais:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {['î', 'û', 'ã', 'õ', "'", 'ẽ', 'ĩ', 'ũ', 'ỹ'].map((char) => (
                            <button
                              key={char}
                              type="button"
                              disabled={validando}
                              onClick={() => inserirCaractere(char)}
                              className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-base md:text-lg font-bold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                              title={`Inserir "${char}"`}
                            >
                              {char}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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

                {exercicioAtual && dicasExercicio[exercicioAtual.id] && (
                  <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800/40 rounded-2xl">
                    <p className="text-orange-800 dark:text-orange-300 font-bold mb-1">Pista do Tutor:</p>
                    <p className="text-orange-700 dark:text-orange-400 italic">&ldquo;{dicasExercicio[exercicioAtual.id]}&rdquo;</p>
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
                        <p className="text-rose-600/90 dark:text-rose-400/90 text-sm font-medium mt-0.5">
                          Não se preocupe, essa questão voltará para você tentar de novo!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Detalhes de validação da pronúncia */}
                  {exercicioAtual?.tipo === 'PRONUNCIA' && resultadoAudio && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {resultadoAudio.precisao !== undefined && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          resultadoAudio.precisao >= 75
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : resultadoAudio.precisao >= 50
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}>
                          Precisão: {resultadoAudio.precisao}%
                        </span>
                      )}
                      {resultadoAudio.xpGanho && isCorrect && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          +{resultadoAudio.xpGanho} XP
                        </span>
                      )}
                      {resultadoAudio.transcricaoAproximada && (
                        <span className="text-xs text-stone-600 dark:text-stone-300 italic">
                          Ouvimos: &ldquo;{decodificarEntidadesHtml(resultadoAudio.transcricaoAproximada)}&rdquo;
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Feedback Pedagógico retornado pela IA Gemini */}
                  {feedbackPedagogico && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-2.5 p-3.5 rounded-2xl border text-sm max-w-xl shadow-xs ${
                        isCorrect
                          ? 'bg-emerald-100/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                          : 'bg-amber-100/80 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
                      }`}
                    >
                      <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs uppercase tracking-wider opacity-75">
                          Feedback Pedagógico
                        </span>
                        <p className="font-medium leading-relaxed">
                          {decodificarEntidadesHtml(feedbackPedagogico)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button
            size="lg"
            disabled={
              fase === 'AQUECIMENTO' ? false :
              (exercicioAtual?.tipo !== 'ENSINO' && exercicioAtual?.tipo !== 'LIGAR_COLUNAS' && exercicioAtual?.tipo !== 'PRONUNCIA' && !selectedAnswer?.trim()) ||
              validando ||
              (exercicioAtual?.tipo === 'LIGAR_COLUNAS' && !isChecked) ||
              (exercicioAtual?.tipo === 'PRONUNCIA' && !isChecked)
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

      <AnimatePresence>
        {mostrarModalCadastro && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-md overflow-hidden flex flex-col text-center"
            >
              <div className="p-8">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">Excelente trabalho!</h2>
                <p className="text-stone-600 dark:text-stone-300 mb-6">
                  Você mandou muito bem. Crie um perfil agora mesmo para salvar seu progresso e não perder esses pontos!
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-8 inline-block w-full">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-bold mb-1">Recompensas Ganhas</p>
                  <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-500">+{xpGanhoTotal} XP</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    size="lg" 
                    className="w-full font-bold text-lg"
                    onClick={() => {
                      localStorage.setItem('pendingLessonCompletion', String(id));
                      localStorage.setItem('pendingLessonXP', String(xpGanhoTotal));
                      router.push('/cadastro');
                    }}
                  >
                    Criar Conta
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full font-bold"
                    onClick={() => {
                      localStorage.setItem('pendingLessonCompletion', String(id));
                      localStorage.setItem('pendingLessonXP', String(xpGanhoTotal));
                      router.push('/login');
                    }}
                  >
                    Entrar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
