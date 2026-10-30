'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  LogOut,
  Loader2,
  AlertCircle,
  HelpCircle,
  Zap
} from 'lucide-react';
import ReactConfetti from 'react-confetti';
import {
  servicoArena,
  EstadoArenaResponseDTO,
  ParticipanteStatusDTO,
  EntrarArenaResponseDTO
} from '@/services/servicoArena';
import { OPCOES_TEMA, TITULOS_PODIO } from '@/utils/arenaTheme';
import { arenaAudio } from '@/utils/arenaAudio';
import { ArcoFlechaIcon, CocarIcon } from '@/components/icons/IndigenousIcons';

interface ArenaAlunoViewProps {
  pinParam?: string;
}

export function ArenaAlunoView({ pinParam }: ArenaAlunoViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // PIN do parâmetro de URL ou query string
  const pinInicial = pinParam || searchParams?.get('pin') || '';

  // Estados de Entrada
  const [pin, setPin] = useState(pinInicial);
  const [apelido, setApelido] = useState('');
  const [conectado, setConectado] = useState(false);
  const [participanteId, setParticipanteId] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do Jogo
  const [estado, setEstado] = useState<EstadoArenaResponseDTO | null>(null);
  const [opcaoEscolhidaLocal, setOpcaoEscolhidaLocal] = useState<string | null>(null);
  const [respondendo, setRespondendo] = useState(false);
  const [questaoInicioTimestamp, setQuestaoInicioTimestamp] = useState<number>(Date.now());
  const [windowDimensions, setWindowDimensions] = useState({ width: 400, height: 700 });

  const estadoRef = useRef<EstadoArenaResponseDTO | null>(null);
  estadoRef.current = estado;
  const questaoIndexRef = useRef<number>(-1);

  // Dimensões para confetti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  // Restaura sessão existente caso o aluno atualize a página no celular
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const salvo = sessionStorage.getItem('tupi_arena_session');
      if (salvo) {
        const dados = JSON.parse(salvo);
        if (dados.pin && dados.participanteId && dados.apelido) {
          // Se houver um PIN na rota diferente da sessão salva, não restaura
          if (!pinInicial || pinInicial === dados.pin) {
            setPin(dados.pin);
            setApelido(dados.apelido);
            setParticipanteId(dados.participanteId);
            setConectado(true);
          }
        }
      }
    } catch {
      // Ignora erro
    }
  }, [pinInicial]);

  // Polling de estado quando conectado
  useEffect(() => {
    if (!conectado || !pin || !participanteId) return;

    let timeoutId: NodeJS.Timeout;
    let ativo = true;

    const fetchEstado = async () => {
      try {
        const dados = await servicoArena.obterEstado(pin, participanteId);
        if (!ativo) return;

        // Se mudou de questão, reseta o estado local de resposta
        if (dados.perguntaAtualIndex !== questaoIndexRef.current) {
          questaoIndexRef.current = dados.perguntaAtualIndex;
          setOpcaoEscolhidaLocal(null);
          setQuestaoInicioTimestamp(Date.now());
        }

        // Feedback sonoro para transição de status
        const statusAnterior = estadoRef.current?.status;
        if (statusAnterior && statusAnterior !== dados.status) {
          if (dados.status === 'REVELACAO') {
            if (dados.meuStatus?.acertouQuestaoAnterior) {
              arenaAudio.playCorrect();
            } else if (dados.meuStatus?.acertouQuestaoAnterior === false) {
              arenaAudio.playWrong();
            }
          } else if (dados.status === 'FINALIZADA') {
            arenaAudio.playFanfare();
          }
        }

        setEstado(dados);
        setErro(null);
      } catch (err: unknown) {
        if (!ativo) return;
        console.error('Erro no polling do aluno:', err);
      } finally {
        if (ativo) {
          timeoutId = setTimeout(fetchEstado, 1500);
        }
      }
    };

    fetchEstado();

    return () => {
      ativo = false;
      clearTimeout(timeoutId);
    };
  }, [conectado, pin, participanteId]);

  // Ação: Entrar na Sala
  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinLimpo = pin.replace(/\s+/g, '').trim();
    const apelidoLimpo = apelido.trim();

    if (!pinLimpo || !apelidoLimpo) {
      setErro('Preencha o PIN e seu apelido.');
      return;
    }

    try {
      setEntrando(true);
      setErro(null);
      arenaAudio.playClick();

      const res: EntrarArenaResponseDTO = await servicoArena.entrarSala({
        codigoPin: pinLimpo,
        apelido: apelidoLimpo,
      });

      setPin(res.codigoPin);
      setApelido(res.apelido);
      setParticipanteId(res.participanteId);
      setConectado(true);

      // Salva na sessão
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'tupi_arena_session',
          JSON.stringify({
            pin: res.codigoPin,
            participanteId: res.participanteId,
            apelido: res.apelido,
          })
        );
      }
    } catch (err: unknown) {
      console.error('Erro ao entrar na sala:', err);
      setErro('Sala não encontrada ou PIN incorreto. Verifique a lousa e tente novamente.');
    } finally {
      setEntrando(false);
    }
  };

  // Ação: Enviar Resposta
  const handleResponder = async (opcao: string) => {
    if (respondendo || opcaoEscolhidaLocal || !participanteId || !pin) return;

    try {
      setRespondendo(true);
      setOpcaoEscolhidaLocal(opcao);
      arenaAudio.playClick();

      // Vibração no celular se compatível
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(60);
      }

      const tempoRespostaMs = Math.max(100, Date.now() - questaoInicioTimestamp);
      await servicoArena.responder(pin, {
        participanteId,
        opcaoEscolhida: opcao,
        tempoRespostaMs,
      });
    } catch (err) {
      console.error('Erro ao registrar resposta:', err);
    } finally {
      setRespondendo(false);
    }
  };

  // Sair da Sala
  const handleSair = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tupi_arena_session');
    }
    setConectado(false);
    setParticipanteId(null);
    setEstado(null);
    setOpcaoEscolhidaLocal(null);
    router.push('/arena');
  };

  // ========================================================
  // 1. TELA DE ENTRADA (SE NÃO CONECTADO)
  // ========================================================
  if (!conectado) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden">
        {/* Fundo temático com brilho esmeralda */}
        <div
          className="absolute inset-0 z-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 10%, #15803d 0%, #052e16 50%, #0c0a09 100%)",
          }}
        />

        <div className="relative z-10 max-w-md mx-auto w-full pt-8 pb-4 text-center">
          <div className="inline-flex p-3 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-700/30 text-white mb-4">
            <ArcoFlechaIcon className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            TUPI ARENA
          </h1>
          <p className="text-xs md:text-sm text-emerald-400 font-bold uppercase tracking-wider mt-1">
            Batalha de Conhecimento Indígena
          </p>
        </div>

        {/* Card de Formulário */}
        <div className="relative z-10 max-w-md mx-auto w-full bg-stone-900/90 border-2 border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleEntrar} className="space-y-4">
            {erro && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-stone-400 block">
                PIN da Batalha (da Lousa)
              </label>
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={8}
                placeholder="Ex: 482910"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center text-3xl font-mono font-black py-3.5 px-4 rounded-2xl bg-stone-950 border-2 border-stone-700 focus:border-amber-500 focus:outline-none tracking-widest text-amber-300 placeholder:text-stone-700"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-stone-400 block">
                Seu Apelido de Guerreiro
              </label>
              <input
                type="text"
                maxLength={18}
                placeholder="Ex: Kauê Potiguara"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                className="w-full text-center text-lg font-bold py-3.5 px-4 rounded-2xl bg-stone-950 border-2 border-stone-700 focus:border-emerald-500 focus:outline-none text-white placeholder:text-stone-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={entrando || !pin || !apelido}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-black text-lg shadow-xl shadow-emerald-700/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-b-4 border-emerald-800 flex items-center justify-center gap-2"
            >
              {entrando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando na Aldeia...
                </>
              ) : (
                <>
                  Entrar na Arena 🏹
                </>
              )}
            </button>
          </form>
        </div>

        {/* Rodapé simples */}
        <div className="relative z-10 text-center py-4">
          <p className="text-xs text-stone-500">
            Tupi Digital • Feito para salas de aula interativas
          </p>
        </div>
      </div>
    );
  }

  // ========================================================
  // 2. JOGO CONECTADO
  // ========================================================
  const jaRespondeu =
    opcaoEscolhidaLocal !== null || Boolean(estado?.meuStatus?.jaRespondeuEstaQuestao);

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Confetti na vitória */}
      {estado?.status === 'FINALIZADA' && (
        <ReactConfetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          numberOfPieces={250}
          recycle={false}
          gravity={0.2}
        />
      )}

      {/* Topo do Aluno: Apelido + Pontos + Posição */}
      <header className="h-14 px-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-sm text-stone-200 truncate max-w-[140px]">
            {apelido}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {estado?.meuStatus && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold">
                {estado.meuStatus.pontuacaoTotal} pts
              </span>
              <span className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded-lg font-bold">
                #{estado.meuStatus.posicao}º
              </span>
            </div>
          )}

          <button
            onClick={handleSair}
            className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg"
            title="Sair da sala"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Conteúdo Central da Tela do Aluno */}
      <main className="flex-1 flex flex-col justify-center p-4 max-w-md mx-auto w-full">
        {/* ======================================================== */}
        {/* ESTADO 1: LOBBY */}
        {/* ======================================================== */}
        {estado?.status === 'LOBBY' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 flex items-center justify-center mx-auto shadow-2xl">
                <CocarIcon className="w-12 h-12 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Você está conectado!
              </h2>
              <p className="text-stone-300 text-sm">
                Conectado como <strong className="text-amber-400">{apelido}</strong> na sala <strong className="text-emerald-400">{pin}</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 shadow-inner">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                👀 Olhe para a lousa
              </span>
              <p className="text-xs text-stone-400">
                Aguarde o professor iniciar a partida no telão da sala.
              </p>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* ESTADO 2: PERGUNTA_ATIVA */}
        {/* ======================================================== */}
        {estado?.status === 'PERGUNTA_ATIVA' && (
          <div className="space-y-4 py-2 flex-1 flex flex-col justify-between">
            {/* Indicador de Questão */}
            <div className="flex items-center justify-between text-xs font-bold text-stone-400">
              <span>Questão {estado.perguntaAtualIndex + 1} de {estado.totalQuestoes}</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Fique atento à lousa!
              </span>
            </div>

            {/* SE O ALUNO AINDA NÃO RESPONDEU: BOTÕES GIGANTES TÁTEIS */}
            {!jaRespondeu ? (
              <div className="grid grid-cols-2 gap-3.5 flex-1 min-h-[320px]">
                {OPCOES_TEMA.map((tema) => (
                  <motion.button
                    key={tema.index}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      const opcaoTexto = estado.opcoes?.[tema.index] || `Opção ${tema.letra}`;
                      handleResponder(opcaoTexto);
                    }}
                    disabled={respondendo}
                    className={`${tema.corBg} active:brightness-90 rounded-3xl flex flex-col items-center justify-center p-4 border-b-6 ${tema.corBorder} shadow-xl text-white transition-all`}
                  >
                    <span className="text-4xl md:text-5xl mb-2">{tema.simbolo}</span>
                    <span className="text-base font-black tracking-wide">
                      {tema.nomeSimbolo}
                    </span>
                  </motion.button>
                ))}
              </div>
            ) : (
              /* SE O ALUNO JÁ RESPONDEU: TELA DE ESPERA COM ANIMAÇÃO */
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4 bg-stone-900/90 border-2 border-stone-800 rounded-3xl p-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-pulse">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">
                    Resposta Enviada!
                  </h3>
                  <p className="text-xs text-stone-400">
                    Aguarde o encerramento do cronômetro na lousa para ver o resultado...
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ESTADO 3: REVELACAO */}
        {/* ======================================================== */}
        {estado?.status === 'REVELACAO' && (
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-center space-y-6 p-8 rounded-3xl border-2 shadow-2xl ${
              estado.meuStatus?.acertouQuestaoAnterior
                ? 'bg-emerald-950/90 border-emerald-400 shadow-emerald-900/30'
                : 'bg-stone-900/95 border-rose-800/80 shadow-rose-950/30'
            }`}
          >
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg">
              {estado.meuStatus?.acertouQuestaoAnterior ? (
                <div className="w-20 h-20 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-rose-700 text-white flex items-center justify-center">
                  <XCircle className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                {estado.meuStatus?.acertouQuestaoAnterior
                  ? 'Você acertou! 🏹'
                  : 'Ops, não foi dessa vez! 🍂'}
              </h2>
              {estado.meuStatus?.pontosGanhosQuestaoAnterior ? (
                <p className="text-lg font-black font-mono text-amber-300">
                  +{estado.meuStatus.pontosGanhosQuestaoAnterior} pontos!
                </p>
              ) : null}
            </div>

            {/* Posição Atual */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-xs text-stone-400 font-semibold block">Sua Posição na Sala</span>
              <span className="text-2xl font-black text-white">
                #{estado.meuStatus?.posicao || 1}º lugar
              </span>
              <span className="text-xs text-stone-400 block">
                Total acumulado: {estado.meuStatus?.pontuacaoTotal || 0} pts
              </span>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* ESTADO 4: PLACAR */}
        {/* ======================================================== */}
        {estado?.status === 'PLACAR' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 p-6 rounded-3xl bg-stone-900 border-2 border-stone-800"
          >
            <Trophy className="w-14 h-14 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Placar da Sala</h3>
              <p className="text-xs text-stone-400">Olhe para a lousa para ver o Top 5!</p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-xs uppercase font-extrabold text-stone-500">Seu Desempenho</span>
              <p className="text-3xl font-black text-amber-400">
                #{estado.meuStatus?.posicao}º Lugar
              </p>
              <p className="text-sm font-mono text-emerald-400 font-bold">
                {estado.meuStatus?.pontuacaoTotal} pontos
              </p>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* ESTADO 5: FINALIZADA */}
        {/* ======================================================== */}
        {estado?.status === 'FINALIZADA' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6 py-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 mx-auto flex items-center justify-center text-stone-950 shadow-xl shadow-amber-500/30">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Batalha Concluída!
              </h2>
              <p className="text-xs text-stone-400">
                Parabéns pela dedicação e aprendizado com o Tupi Digital.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-900 border-2 border-amber-500/50 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {estado.meuStatus?.posicao === 1
                    ? '🥇 Sábio da Aldeia'
                    : estado.meuStatus?.posicao === 2
                    ? '🥈 Guerreiro da Trilha'
                    : estado.meuStatus?.posicao === 3
                    ? '🥉 Guardião dos Saberes'
                    : '🏹 Guerreiro da Aldeia'}
                </span>
                <h3 className="text-3xl font-black text-white mt-1">
                  #{estado.meuStatus?.posicao || 1}º Lugar
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-800 text-left">
                <div className="p-3 bg-stone-950 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold">Pontos</span>
                  <span className="text-lg font-mono font-black text-emerald-400">
                    {estado.meuStatus?.pontuacaoTotal || 0}
                  </span>
                </div>
                <div className="p-3 bg-stone-950 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold">Acertos</span>
                  <span className="text-lg font-mono font-black text-amber-400">
                    {estado.meuStatus?.acertos || 0} de {estado.totalQuestoes}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSair}
              className="w-full py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-2xl transition-all"
            >
              Voltar ao Início
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

