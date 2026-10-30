'use client';

import React, { useEffect, useState, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Trophy,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ReactConfetti from 'react-confetti';
import { servicoArena, EstadoArenaResponseDTO } from '@/services/servicoArena';
import { OPCOES_TEMA, extrairTermosQuestao } from '@/utils/arenaTheme';
import { arenaAudio } from '@/utils/arenaAudio';
import { ArcoFlechaIcon, CocarIcon } from '@/components/icons/IndigenousIcons';

export default function ArenaHostPage({ params }: { params: Promise<{ pin: string }> }) {
  const resolvedParams = use(params);
  const pin = resolvedParams.pin;
  const router = useRouter();

  // Estados principais
  const [estado, setEstado] = useState<EstadoArenaResponseDTO | null>(null);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);
  const [pulandoDireto, setPulandoDireto] = useState(false);

  // Estados de Interface
  const [copiado, setCopiado] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalEncerrarAberto, setModalEncerrarAberto] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });

  // Cronômetro local para animação fluida da barra regressiva na pergunta ativa
  const [tempoRestanteVisual, setTempoRestanteVisual] = useState<number>(20);

  // Avanço automático opcional na tela de revelação
  const [autoAvancoAtivo, setAutoAvancoAtivo] = useState(false);
  const [segundosAutoAvanco, setSegundosAutoAvanco] = useState(10);

  const estadoRef = useRef<EstadoArenaResponseDTO | null>(null);
  estadoRef.current = estado;

  // Atualiza dimensões da tela para o Confetti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  // Polling a cada 1.5s
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let ativo = true;

    const fetchEstado = async () => {
      try {
        const dados = await servicoArena.obterEstado(pin);
        if (!ativo) return;

        // Detecta transição de status para efeitos sonoros
        const statusAnterior = estadoRef.current?.status;
        if (statusAnterior && statusAnterior !== dados.status) {
          if (dados.status === 'PERGUNTA_ATIVA') {
            arenaAudio.playClick();
          } else if (dados.status === 'REVELACAO') {
            arenaAudio.playCorrect();
          } else if (dados.status === 'FINALIZADA') {
            arenaAudio.playFanfare();
          }
        }

        setEstado(dados);
        if (dados.tempoRestanteSegundos !== null) {
          setTempoRestanteVisual(dados.tempoRestanteSegundos);
        } else {
          setTempoRestanteVisual(dados.tempoPerguntaSegundos || 20);
        }
        setErro(null);
      } catch (err: unknown) {
        if (!ativo) return;
        console.error('Erro no polling do host arena:', err);
        setErro('Falha na comunicação com o servidor da Arena.');
      } finally {
        if (ativo) {
          setCarregandoInicial(false);
          timeoutId = setTimeout(fetchEstado, 1500);
        }
      }
    };

    fetchEstado();

    return () => {
      ativo = false;
      clearTimeout(timeoutId);
    };
  }, [pin]);

  // Ações do Host
  const avancarEtapa = useCallback(async () => {
    if (acaoEmAndamento) return;
    try {
      setAcaoEmAndamento(true);
      arenaAudio.playClick();
      const novoEstado = await servicoArena.avancarEtapa(pin);
      setEstado(novoEstado);
      if (novoEstado.tempoRestanteSegundos !== null) {
        setTempoRestanteVisual(novoEstado.tempoRestanteSegundos);
      }
    } catch (err) {
      console.error('Erro ao avançar etapa:', err);
    } finally {
      setAcaoEmAndamento(false);
    }
  }, [acaoEmAndamento, pin]);

  // Finaliza a batalha e vai direto para o Pódio Final com react-confetti
  const finalizarPartida = useCallback(async () => {
    if (acaoEmAndamento) return;
    try {
      setAcaoEmAndamento(true);
      arenaAudio.playFanfare();
      const estadoFinal = await servicoArena.encerrar(pin);
      setEstado(estadoFinal);
    } catch (err) {
      console.error('Erro ao finalizar partida:', err);
    } finally {
      setAcaoEmAndamento(false);
    }
  }, [acaoEmAndamento, pin]);

  const avancarEtapaRef = useRef(avancarEtapa);
  avancarEtapaRef.current = avancarEtapa;

  // Contagem regressiva suave na pergunta ativa: quando atinge 0, avança automaticamente para REVELACAO!
  useEffect(() => {
    if (estado?.status !== 'PERGUNTA_ATIVA') return;

    const interval = setInterval(() => {
      setTempoRestanteVisual((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // O tempo acabou! Auto-encerra a pergunta e revela a resposta para toda a sala
          avancarEtapaRef.current();
          return 0;
        }
        if (prev <= 5) {
          arenaAudio.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [estado?.status, estado?.perguntaAtualIndex]);

  // Auto-avança para REVELAÇÃO se todos os participantes responderam antes do tempo acabar
  useEffect(() => {
    if (
      estado?.status === 'PERGUNTA_ATIVA' &&
      estado.totalParticipantes > 0 &&
      estado.totalRespostasRecebidas >= estado.totalParticipantes &&
      !acaoEmAndamento
    ) {
      const timeout = setTimeout(() => {
        avancarEtapaRef.current();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [estado?.status, estado?.totalRespostasRecebidas, estado?.totalParticipantes, acaoEmAndamento]);

  // Contagem regressiva para avanço automático na tela de REVELAÇÃO
  useEffect(() => {
    if (estado?.status !== 'REVELACAO' || !autoAvancoAtivo) {
      setSegundosAutoAvanco(10);
      return;
    }

    const interval = setInterval(() => {
      setSegundosAutoAvanco((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const ehUltima = (estadoRef.current?.perguntaAtualIndex || 0) + 1 >= (estadoRef.current?.totalQuestoes || 0);
          if (ehUltima) {
            finalizarPartida();
          } else {
            avancarEtapaRef.current();
          }
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [estado?.status, autoAvancoAtivo, estado?.perguntaAtualIndex, finalizarPartida]);

  // Pular o Placar e ir direto para a Próxima Pergunta (sem flash visual do placar)
  const pularDiretoProximaQuestao = async () => {
    if (acaoEmAndamento) return;

    // Se já é a última questão (ou além dela), encerra e vai para o pódio final
    const ehUltimaQuestao = (estado?.perguntaAtualIndex || 0) + 1 >= (estado?.totalQuestoes || 0);
    if (ehUltimaQuestao) {
      return finalizarPartida();
    }

    try {
      setAcaoEmAndamento(true);
      setPulandoDireto(true);
      arenaAudio.playClick();

      // Primeiro avanço: REVELACAO -> PLACAR
      await servicoArena.avancarEtapa(pin);
      // Segundo avanço: PLACAR -> PERGUNTA_ATIVA
      const novoEstado = await servicoArena.avancarEtapa(pin);
      setEstado(novoEstado);
      if (novoEstado.tempoRestanteSegundos !== null) {
        setTempoRestanteVisual(novoEstado.tempoRestanteSegundos);
      }
    } catch (err) {
      console.error('Erro ao pular direto para próxima questão:', err);
    } finally {
      setAcaoEmAndamento(false);
      setPulandoDireto(false);
    }
  };

  const encerrarPartidaManual = async () => {
    try {
      setAcaoEmAndamento(true);
      await servicoArena.encerrar(pin);
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro ao encerrar arena:', err);
      setAcaoEmAndamento(false);
      setModalEncerrarAberto(false);
    }
  };

  const toggleMute = () => {
    const mutado = arenaAudio.toggleMute();
    setIsMuted(mutado);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const copiarLinkEntrada = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/arena?pin=${pin}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const formatarPin = (codigo: string) => {
    if (!codigo) return '';
    if (codigo.length <= 3) return codigo;
    return `${codigo.slice(0, 3)} ${codigo.slice(3)}`;
  };

  if (carregandoInicial && !estado) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <h2 className="text-xl font-bold tracking-wide">Iniciando Telão da Tupi Arena...</h2>
      </div>
    );
  }

  const urlEntrada = typeof window !== 'undefined' ? `${window.location.origin}/arena?pin=${pin}` : `/arena?pin=${pin}`;

  // Extração inteligente do termo em Tupi e tradução em português
  const { termoTupi, traducaoPt } = extrairTermosQuestao(
    estado?.enunciado,
    estado?.respostaCorreta,
    estado?.fonetica,
    estado?.traducaoPtBr
  );

  // Número da questão formatado e protegido contra overflow (ex: nunca mostra Questão 11 de 10)
  const totalQ = estado?.totalQuestoes || 1;
  const questaoNumeroVisual = Math.min((estado?.perguntaAtualIndex || 0) + 1, totalQ);
  const ehUltimaQuestao = (estado?.perguntaAtualIndex || 0) + 1 >= totalQ;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col select-none overflow-x-hidden font-sans relative">
      {/* Fundo com tema de floresta e grafismos sutis */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 20%, #15803d 0%, #052e16 45%, #0c0a09 100%)",
        }}
      />

      {/* Confetti na tela Finalizada */}
      {estado?.status === 'FINALIZADA' && (
        <ReactConfetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          numberOfPieces={350}
          recycle={true}
          gravity={0.15}
        />
      )}

      {/* Overlay de transição rápida ao pular placar (elimina qualquer bug ou piscada) */}
      {pulandoDireto && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
          <span className="text-base font-extrabold text-white tracking-wide">
            Preparando próxima questão...
          </span>
        </div>
      )}

      {/* Barra de Controle do Telão */}
      <header className="relative z-20 h-16 px-6 bg-stone-900/80 backdrop-blur-md border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
            <ArcoFlechaIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wide text-emerald-400">
              TUPI ARENA
            </span>
            <span className="mx-2 text-stone-600">•</span>
            <span className="text-xs md:text-sm font-semibold text-stone-300">
              {estado?.titulo || 'Batalha do Conhecimento'}
            </span>
          </div>
        </div>

        {/* Informações da Sala e Controles */}
        <div className="flex items-center gap-3">
          {estado?.status !== 'LOBBY' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-stone-800 rounded-xl border border-stone-700 text-xs font-mono font-bold text-amber-400">
              <span>PIN:</span>
              <span className="text-sm tracking-wider">{formatarPin(pin)}</span>
            </div>
          )}

          <button
            onClick={toggleMute}
            title={isMuted ? 'Ativar som' : 'Silenciar'}
            className="p-2 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title="Tela Cheia"
            className="p-2 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setModalEncerrarAberto(true)}
            title="Encerrar Partida"
            className="px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Encerrar</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal de acordo com o Status da Sala */}
      <main className="relative z-10 flex-1 flex flex-col justify-center p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* ======================================================== */}
        {/* 1. LOBBY */}
        {/* ======================================================== */}
        {estado?.status === 'LOBBY' && (
          <div className="flex flex-col items-center justify-center space-y-8 py-4">
            {/* Topo do Lobby com PIN e QR Code */}
            <div className="w-full grid lg:grid-cols-2 gap-8 items-center bg-stone-900/90 border-2 border-stone-800 p-6 md:p-10 rounded-3xl shadow-2xl">
              {/* Esquerda: PIN Gigante e Instruções */}
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Sala Pronta para Conexões
                </div>

                <div className="space-y-2">
                  <p className="text-stone-400 text-sm md:text-base font-medium">
                    Acesse no seu celular ou tablet:
                  </p>
                  <p className="text-xl md:text-2xl font-black text-emerald-400 tracking-wide break-all">
                    {typeof window !== 'undefined' ? window.location.host : 'tupidigital.org'}/arena
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest font-extrabold text-stone-500">
                    CÓDIGO PIN DA SALA
                  </span>
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <span className="text-5xl md:text-7xl font-black tracking-widest text-white font-mono bg-stone-950 px-6 py-2 rounded-2xl border-2 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                      {formatarPin(pin)}
                    </span>
                    <button
                      onClick={copiarLinkEntrada}
                      className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-all cursor-pointer"
                      title="Copiar Link"
                    >
                      {copiado ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Botão de Iniciar a Batalha */}
                <div className="pt-2">
                  <button
                    onClick={avancarEtapa}
                    disabled={acaoEmAndamento || (estado.ranking?.length || 0) === 0}
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-700/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all border-b-4 border-emerald-800 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {acaoEmAndamento ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-6 h-6 fill-current" />
                        Iniciar Batalha!
                      </>
                    )}
                  </button>
                  {(estado.ranking?.length || 0) === 0 && (
                    <p className="text-xs text-stone-500 mt-2">
                      Aguardando pelo menos 1 guerreiro entrar para iniciar...
                    </p>
                  )}
                </div>
              </div>

              {/* Direita: QR Code Grande */}
              <div className="flex flex-col items-center justify-center bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-inner">
                <div className="p-4 bg-white rounded-2xl shadow-xl">
                  <QRCodeSVG
                    value={urlEntrada}
                    size={220}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <span className="text-xs text-stone-400 font-semibold mt-3 flex items-center gap-1.5">
                  📱 Aponte a câmera do celular para entrar direto
                </span>
              </div>
            </div>

            {/* Participantes Conectados em Tempo Real */}
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-lg font-bold text-stone-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Guerreiros na Aldeia ({estado.ranking?.length || 0})
                </h3>
                <span className="text-xs text-stone-400 font-medium">
                  {estado.totalQuestoes} questões preparadas
                </span>
              </div>

              {(estado.ranking?.length || 0) === 0 ? (
                <div className="py-12 text-center text-stone-500 bg-stone-900/40 rounded-2xl border border-dashed border-stone-800">
                  <Users className="w-10 h-10 mx-auto text-stone-600 mb-2 animate-pulse" />
                  <p className="text-sm font-medium">Nenhum guerreiro conectado ainda.</p>
                  <p className="text-xs text-stone-600">Peça para os alunos digitarem o PIN ou lerem o QR Code.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <AnimatePresence>
                    {estado.ranking.map((aluno) => (
                      <motion.div
                        key={aluno.id || aluno.apelido}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="px-4 py-2 bg-gradient-to-r from-stone-900 to-stone-800 border-2 border-stone-700/80 rounded-2xl flex items-center gap-2.5 shadow-md"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-extrabold text-sm md:text-base text-stone-100">
                          {aluno.apelido}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. PERGUNTA_ATIVA */}
        {/* ======================================================== */}
        {estado?.status === 'PERGUNTA_ATIVA' && (
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Topo da Pergunta: Número da questão + Cronômetro */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-extrabold text-sm md:text-base">
                  Questão {questaoNumeroVisual} de {totalQ}
                </span>
                <span className="text-xs text-stone-400 font-semibold hidden sm:inline">
                  {estado.totalRespostasRecebidas} de {estado.totalParticipantes} responderam
                </span>
              </div>

              {/* Temporizador Gigante */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl border-2 transition-all ${
                    tempoRestanteVisual <= 5
                      ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
                      : 'bg-stone-900 border-amber-500 text-amber-400 shadow-lg'
                  }`}
                >
                  {tempoRestanteVisual}
                </div>
              </div>
            </div>

            {/* Barra de Progresso do Tempo */}
            <div className="w-full bg-stone-900 h-3 rounded-full overflow-hidden border border-stone-800">
              <motion.div
                className={`h-full ${
                  tempoRestanteVisual <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                }`}
                initial={{ width: '100%' }}
                animate={{
                  width: `${Math.max(0, (tempoRestanteVisual / (estado.tempoPerguntaSegundos || 20)) * 100)}%`,
                }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </div>

            {/* Enunciado da Pergunta */}
            <div className="bg-stone-900/95 border-2 border-stone-800 p-6 md:p-10 rounded-3xl text-center shadow-2xl min-h-[140px] flex items-center justify-center">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-snug">
                {estado.enunciado || 'Carregando pergunta...'}
              </h2>
            </div>

            {/* 4 Alternativas Geométricas no Estilo Kahoot Indígena */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {estado.opcoes?.map((opcao, idx) => {
                const tema = OPCOES_TEMA[idx] || OPCOES_TEMA[0];

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`${tema.corBg} ${tema.corBorder} border-b-4 p-5 md:p-6 rounded-2xl shadow-lg flex items-center gap-4 text-left`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-black/25 flex items-center justify-center shrink-0">
                      <span className="text-2xl">{tema.simbolo}</span>
                    </div>
                    <span className="text-lg md:text-xl font-bold text-white flex-1">
                      {opcao}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Barra Inferior com Ação do Professor */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-stone-400 font-mono">
                ⚡ Respostas computadas: {estado.totalRespostasRecebidas} / {estado.totalParticipantes}
              </div>

              <button
                onClick={avancarEtapa}
                disabled={acaoEmAndamento}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-stone-950 font-black text-sm md:text-base rounded-xl shadow-lg transition-all border-b-4 border-amber-700 flex items-center gap-2 cursor-pointer"
              >
                {acaoEmAndamento ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Encerrar Tempo / Revelar ⏩'}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. REVELACAO (COM PRONÚNCIA EM TUPI E BOTÕES REPOSICIONADOS) */}
        {/* ======================================================== */}
        {estado?.status === 'REVELACAO' && (
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Topo Limpo: Indicador da Questão + Toggle de Avanço Automático Opcional */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-4 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-emerald-400 font-extrabold text-sm">
                  Resultado da Questão {questaoNumeroVisual} de {totalQ}
                </span>
                <span className="text-xs text-stone-400 font-medium hidden sm:inline">
                  {estado.totalRespostasRecebidas} respostas recebidas
                </span>
              </div>

              {/* Controle de Avanço Automático Opcional */}
              <button
                type="button"
                onClick={() => setAutoAvancoAtivo(!autoAvancoAtivo)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                  autoAvancoAtivo
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                }`}
                title="Ativar ou desativar avanço automático de tela"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {autoAvancoAtivo ? `Avanço auto ativo (${segundosAutoAvanco}s)` : 'Avanço manual'}
                </span>
              </button>
            </div>

            {/* Enunciado */}
            <div className="bg-stone-900 border border-stone-800 p-6 md:p-8 rounded-2xl text-center shadow-lg">
              <h2 className="text-xl md:text-3xl font-extrabold text-white">
                {estado.enunciado}
              </h2>
            </div>

            {/* Grid com Destaque na Resposta Correta e Gráfico de Votos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {estado.opcoes?.map((opcao, idx) => {
                const tema = OPCOES_TEMA[idx] || OPCOES_TEMA[0];
                const ehCorreta = opcao === estado.respostaCorreta;
                const votos = estado.contagemRespostasPorOpcao?.[opcao] || 0;
                const porcentagem =
                  estado.totalRespostasRecebidas > 0
                    ? Math.round((votos / estado.totalRespostasRecebidas) * 100)
                    : 0;

                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.96 }}
                    animate={{ scale: ehCorreta ? 1.02 : 0.98 }}
                    className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      ehCorreta
                        ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                        : 'bg-stone-900/60 border-stone-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tema.simbolo}</span>
                        <span className={`text-base md:text-lg font-bold ${ehCorreta ? 'text-white' : 'text-stone-300'}`}>
                          {opcao}
                        </span>
                      </div>
                      {ehCorreta ? (
                        <span className="px-2.5 py-1 bg-emerald-500 text-stone-950 text-xs font-black rounded-lg flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-4 h-4" /> CORRETA
                        </span>
                      ) : null}
                    </div>

                    {/* Barra de Distribuição de Votos */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold text-stone-400">
                        <span>{votos} {votos === 1 ? 'voto' : 'votos'}</span>
                        <span>{porcentagem}%</span>
                      </div>
                      <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${porcentagem}%` }}
                          transition={{ duration: 0.6 }}
                          className={`h-full ${ehCorreta ? 'bg-emerald-500' : 'bg-stone-600'}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Destaque Linguístico Cultural (Pronúncia 100% em Tupi) */}
            {(termoTupi || traducaoPt) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border-2 border-amber-600/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
              >
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Sabedoria Ancestral & Pronúncia em Tupi
                  </span>
                  <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                    {termoTupi && (
                      <span className="text-xl md:text-2xl font-black font-mono text-emerald-300">
                        [{termoTupi}]
                      </span>
                    )}
                    {traducaoPt && (
                      <span className="text-base text-stone-300">
                        Tradução: <strong className="text-white">{traducaoPt}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (termoTupi) {
                      arenaAudio.tocarAudioTupi(termoTupi);
                    }
                  }}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-stone-950 rounded-2xl font-black text-sm flex items-center gap-2.5 shadow-lg border-b-4 border-amber-700 transition-all shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 fill-current" />
                  <span>Pronunciar em Tupi</span>
                </button>
              </motion.div>
            )}

            {/* BARRA DE AÇÕES INFERIOR: REPOSICIONADA COM AMBAS AS OPÇÕES */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-400">
                {autoAvancoAtivo ? (
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Avançando automaticamente em <strong>{segundosAutoAvanco}s</strong>...</span>
                    <button
                      type="button"
                      onClick={() => setAutoAvancoAtivo(false)}
                      className="underline text-stone-300 hover:text-white ml-2 font-bold cursor-pointer"
                    >
                      Pausar
                    </button>
                  </div>
                ) : (
                  <span className="text-stone-500">
                    O professor no comando: veja o placar da rodada ou avance direto para a próxima etapa.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Botão de Pular Placar / Ir Direto para a Próxima Pergunta ou Pódio Final */}
                {ehUltimaQuestao ? (
                  <button
                    type="button"
                    onClick={finalizarPartida}
                    disabled={acaoEmAndamento}
                    className="flex-1 sm:flex-initial px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm md:text-base rounded-2xl shadow-xl shadow-amber-500/20 border-b-4 border-amber-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {acaoEmAndamento ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Trophy className="w-5 h-5 text-stone-950" />
                        <span>Ver Pódio Final</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pularDiretoProximaQuestao}
                    disabled={acaoEmAndamento}
                    className="flex-1 sm:flex-initial px-5 py-3.5 bg-stone-800 hover:bg-stone-700 active:translate-y-0.5 text-stone-200 font-bold text-sm md:text-base rounded-2xl border border-stone-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="Pular visualização do ranking e ir direto para a próxima questão"
                  >
                    {acaoEmAndamento ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Próxima Questão</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {/* Botão de Ver Placar Geral da Rodada */}
                <button
                  type="button"
                  onClick={avancarEtapa}
                  disabled={acaoEmAndamento}
                  className="flex-1 sm:flex-initial px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-black text-sm md:text-base rounded-2xl shadow-xl shadow-emerald-700/30 border-b-4 border-emerald-800 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {acaoEmAndamento ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 text-amber-300" />
                      <span>Ver Placar Geral</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. PLACAR (CORRIGIDO: FINALIZAÇÃO CORRETA NA ÚLTIMA QUESTÃO) */}
        {/* ======================================================== */}
        {estado?.status === 'PLACAR' && (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-amber-400 flex items-center gap-2">
                  <Trophy className="w-7 h-7 text-amber-400" />
                  Placar dos Guerreiros
                </h2>
                <span className="text-xs text-stone-400">
                  Questão {questaoNumeroVisual} de {totalQ} finalizada
                </span>
              </div>

              {/* Se for a última questão, chama explicitamente finalizarPartida()! */}
              {ehUltimaQuestao ? (
                <button
                  onClick={finalizarPartida}
                  disabled={acaoEmAndamento}
                  className="px-7 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/25 border-b-4 border-amber-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {acaoEmAndamento ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Ver Pódio Final</span>
                      <Trophy className="w-5 h-5 text-stone-950" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={avancarEtapa}
                  disabled={acaoEmAndamento}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-2xl shadow-lg border-b-4 border-emerald-800 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {acaoEmAndamento ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Próxima Questão</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Lista dos Top 5 Alunos */}
            <div className="space-y-3">
              {estado.ranking?.slice(0, 5).map((aluno, index) => {
                const ehPrimeiro = index === 0;

                return (
                  <motion.div
                    key={aluno.id || aluno.apelido}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 md:p-5 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                      ehPrimeiro
                        ? 'bg-gradient-to-r from-amber-950/70 via-stone-900 to-stone-900 border-amber-500 shadow-lg'
                        : 'bg-stone-900/80 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                          index === 0
                            ? 'bg-amber-500 text-stone-950 shadow-md'
                            : index === 1
                            ? 'bg-stone-300 text-stone-950'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {index + 1}º
                      </div>

                      <div>
                        <h4 className="font-extrabold text-base md:text-xl text-white">
                          {aluno.apelido}
                        </h4>
                        <span className="text-xs text-stone-400">
                          {aluno.acertos} {aluno.acertos === 1 ? 'acerto' : 'acertos'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl md:text-2xl font-black font-mono text-emerald-400">
                        {aluno.pontuacaoTotal}
                      </span>
                      <span className="text-xs text-stone-500 block font-semibold">pontos</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. FINALIZADA (PÓDIO FINAL) */}
        {/* ======================================================== */}
        {estado?.status === 'FINALIZADA' && (
          <div className="space-y-8 max-w-5xl mx-auto w-full text-center py-4">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-700 font-extrabold text-xs uppercase tracking-widest mb-2">
                <Trophy className="w-4 h-4" /> Batalha Finalizada com Honra
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white">
                Pódio dos Grandes Guerreiros
              </h1>
            </div>

            {/* Pódio Temático dos 3 Primeiros */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 items-end pt-8 max-w-3xl mx-auto">
              {/* 2º Lugar */}
              <div className="order-1 flex flex-col items-center">
                {estado.ranking?.[1] ? (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full space-y-2"
                  >
                    <span className="text-3xl md:text-4xl">🏹</span>
                    <h3 className="font-bold text-sm md:text-base text-stone-200 truncate px-1">
                      {estado.ranking[1].apelido}
                    </h3>
                    <p className="text-xs font-mono font-bold text-stone-400">
                      {estado.ranking[1].pontuacaoTotal} pts
                    </p>
                    <div className="bg-gradient-to-t from-stone-800 to-stone-700 rounded-t-3xl h-36 md:h-44 flex flex-col items-center justify-center border-t-4 border-stone-400 shadow-xl">
                      <span className="text-3xl md:text-5xl font-black text-stone-300">2º</span>
                      <span className="text-[10px] md:text-xs font-extrabold uppercase text-stone-400 mt-1">
                        Guerreiro da Trilha
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-36" />
                )}
              </div>

              {/* 1º Lugar */}
              <div className="order-2 flex flex-col items-center">
                {estado.ranking?.[0] ? (
                  <motion.div
                    initial={{ y: 70, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full space-y-2"
                  >
                    <span className="text-4xl md:text-5xl">🪶</span>
                    <h3 className="font-extrabold text-base md:text-xl text-amber-300 truncate px-1">
                      {estado.ranking[0].apelido}
                    </h3>
                    <p className="text-sm font-mono font-black text-amber-400">
                      {estado.ranking[0].pontuacaoTotal} pts
                    </p>
                    <div className="bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-3xl h-48 md:h-60 flex flex-col items-center justify-center border-t-4 border-amber-300 shadow-2xl">
                      <span className="text-4xl md:text-6xl font-black text-stone-950">1º</span>
                      <span className="text-[10px] md:text-xs font-black uppercase text-amber-950 mt-1">
                        Sábio da Aldeia
                      </span>
                    </div>
                  </motion.div>
                ) : null}
              </div>

              {/* 3º Lugar */}
              <div className="order-3 flex flex-col items-center">
                {estado.ranking?.[2] ? (
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full space-y-2"
                  >
                    <span className="text-3xl md:text-4xl">🌿</span>
                    <h3 className="font-bold text-sm md:text-base text-stone-200 truncate px-1">
                      {estado.ranking[2].apelido}
                    </h3>
                    <p className="text-xs font-mono font-bold text-stone-400">
                      {estado.ranking[2].pontuacaoTotal} pts
                    </p>
                    <div className="bg-gradient-to-t from-stone-900 to-amber-950 rounded-t-3xl h-28 md:h-36 flex flex-col items-center justify-center border-t-4 border-amber-700 shadow-lg">
                      <span className="text-3xl md:text-4xl font-black text-amber-600">3º</span>
                      <span className="text-[10px] md:text-xs font-extrabold uppercase text-amber-500 mt-1">
                        Guardião dos Saberes
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-28" />
                )}
              </div>
            </div>

            {/* Ações pós-jogo */}
            <div className="pt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-2xl transition-all border border-stone-700 cursor-pointer"
              >
                Voltar ao Dashboard
              </button>
              <button
                onClick={() => router.push('/arena/criar')}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl transition-all shadow-lg border-b-4 border-emerald-800 cursor-pointer"
              >
                Nova Partida 🏹
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Confirmação para Encerrar */}
      {modalEncerrarAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-stone-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Deseja realmente encerrar?</h3>
            <p className="text-xs text-stone-400">
              A sala da Arena será finalizada para todos os alunos conectados.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalEncerrarAberto(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-sm cursor-pointer"
              >
                Continuar Jogo
              </button>
              <button
                onClick={encerrarPartidaManual}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm cursor-pointer"
              >
                Encerrar Sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
