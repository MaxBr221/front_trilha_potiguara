'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2, Sparkles, Volume2, AlertCircle, RotateCcw, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercicio, ValidacaoAudioResponse, servicoExercicio, decodificarEntidadesHtml } from '@/services/servicoExercicio';

interface PronunciaExercicioProps {
  exercicio: Exercicio;
  onValidated: (resultado: ValidacaoAudioResponse) => void;
  onSkip?: () => void;
  isValidating?: boolean;
  isAnswered?: boolean;
  validationResult?: ValidacaoAudioResponse | null;
  exibirDetalhesCard?: boolean;
}

export function PronunciaExercicio({
  exercicio,
  onValidated,
  onSkip,
  isValidating = false,
  isAnswered = false,
  validationResult = null,
  exibirDetalhesCard = true,
}: PronunciaExercicioProps) {
  const [gravando, setGravando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [erroMicrofone, setErroMicrofone] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [enviandoAudio, setEnviandoAudio] = useState(false);
  const [audioNivel, setAudioNivel] = useState<number[]>([15, 25, 40, 20, 35]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Limpa recursos ao desmontar ou trocar de exercício
  const liberarRecursos = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignora erro no fechamento
      }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      liberarRecursos();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [liberarRecursos, audioUrl]);

  // Reseta estados quando o exercício atual mudar
  useEffect(() => {
    setGravando(false);
    setSegundos(0);
    setErroMicrofone(null);
    setEnviandoAudio(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    liberarRecursos();
  }, [exercicio.id, liberarRecursos]);

  const iniciarGravacao = async () => {
    setErroMicrofone(null);
    audioChunksRef.current = [];

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErroMicrofone('Seu navegador não suporta gravação de áudio.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Suporte dinâmico a diferentes mimetypes
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const finalType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Desconecta tracks do microfone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Envia automaticamente para validação
        await enviarGravacao(audioBlob);
      };

      // Inicia análise de áudio para ondas visuais
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 32;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const atualizarNiveis = () => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
            analyser.getByteFrequencyData(dataArray);
            
            // Pega amostras para 5 barras
            const bars = [
              Math.max(15, Math.min(100, (dataArray[1] || 0) * 0.7)),
              Math.max(20, Math.min(100, (dataArray[3] || 0) * 0.8)),
              Math.max(25, Math.min(100, (dataArray[5] || 0) * 0.9)),
              Math.max(20, Math.min(100, (dataArray[7] || 0) * 0.8)),
              Math.max(15, Math.min(100, (dataArray[9] || 0) * 0.7)),
            ];
            setAudioNivel(bars);
            animationFrameRef.current = requestAnimationFrame(atualizarNiveis);
          };
          atualizarNiveis();
        }
      } catch {
        // Fallback silencioso para animação CSS padrão
      }

      recorder.start(200); // Coleta a cada 200ms
      setGravando(true);
      setSegundos(0);

      // Contador de segundos e limite automático de 15 segundos
      timerRef.current = setInterval(() => {
        setSegundos((prev) => {
          if (prev >= 14) {
            pararGravacao();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.error('Erro ao acessar o microfone:', err);
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setErroMicrofone('Acesso ao microfone negado. Conceda permissão no navegador para gravar áudio.');
      } else {
        setErroMicrofone('Não foi possível iniciar a gravação. Verifique seu microfone e tente novamente.');
      }
      liberarRecursos();
    }
  };

  const pararGravacao = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setGravando(false);
  };

  const enviarGravacao = async (blob: Blob) => {
    setEnviandoAudio(true);
    try {
      const resposta = await servicoExercicio.validarAudio(exercicio.id, blob);
      onValidated(resposta);
    } catch (error) {
      console.error('Erro ao validar áudio da pronúncia:', error);
      setErroMicrofone('Ocorreu um erro ao enviar seu áudio para avaliação. Você pode tentar novamente ou pular.');
    } finally {
      setEnviandoAudio(false);
    }
  };

  const formatarTempo = (totalSegundos: number) => {
    const mins = Math.floor(totalSegundos / 60);
    const segs = totalSegundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const palavraAlvo = exercicio.respostaCorreta || '';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Título / Enunciado */}
      <div className="w-full text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-3 border border-emerald-300 dark:border-emerald-800">
          <Mic className="w-3.5 h-3.5" />
          Exercício de Pronúncia
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 leading-snug">
          {exercicio.enunciado}
        </h1>
      </div>

      {/* Cartão de Destaque da Palavra/Frase a Falar */}
      {palavraAlvo && (
        <div className="w-full bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-900/80 rounded-3xl border-2 border-stone-200 dark:border-stone-800 p-6 shadow-sm mb-8 text-center flex flex-col items-center justify-center gap-2">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
            Fale a frase abaixo:
          </span>
          <p className="text-3xl md:text-4xl font-extrabold text-primary dark:text-primary-400 tracking-wide">
            &ldquo;{palavraAlvo}&rdquo;
          </p>
        </div>
      )}

      {/* Área Central: Botão de Gravação & Indicador Visual */}
      <div className="flex flex-col items-center justify-center w-full py-4 gap-4">
        <div className="relative flex items-center justify-center">
          {/* Anéis pulsantes durante a gravação */}
          {gravando && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-rose-500/30"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                className="absolute inset-0 rounded-full bg-rose-500/40"
              />
            </>
          )}

          {/* Botão Principal do Microfone */}
          <button
            type="button"
            disabled={isAnswered || enviandoAudio || isValidating}
            onClick={gravando ? pararGravacao : iniciarGravacao}
            aria-label={gravando ? 'Parar gravação' : 'Gravar áudio da pronúncia'}
            className={`relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4 disabled:opacity-60 disabled:cursor-not-allowed ${
              gravando
                ? 'bg-rose-500 hover:bg-rose-600 text-white scale-105 shadow-rose-500/40'
                : enviandoAudio || isValidating
                ? 'bg-amber-500 text-white shadow-amber-500/30'
                : isAnswered
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-default'
                : 'bg-primary hover:bg-primary-600 text-white hover:scale-105 active:scale-95 shadow-primary/30 border-b-4 border-primary-700'
            }`}
          >
            {enviandoAudio || isValidating ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : gravando ? (
              <Square className="w-10 h-10 fill-current" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </button>
        </div>

        {/* Legenda de Status / Indicador Visual de Gravação */}
        <div className="flex flex-col items-center justify-center text-center min-h-[4rem]">
          {gravando ? (
            <div className="flex flex-col items-center gap-2 animate-in fade-in">
              {/* Barras de frequência de áudio dinâmicas */}
              <div className="flex items-center gap-1.5 h-8">
                {audioNivel.map((altura, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ height: `${altura}%` }}
                    transition={{ duration: 0.1 }}
                    className="w-1.5 bg-rose-500 rounded-full min-h-[6px]"
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-sm md:text-base font-bold text-rose-600 dark:text-rose-400">
                  Gravando... {formatarTempo(segundos)}
                </span>
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Toque no botão para finalizar e enviar
              </span>
            </div>
          ) : enviandoAudio || isValidating ? (
            <div className="flex flex-col items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <span className="text-sm md:text-base font-bold flex items-center gap-2 text-primary dark:text-primary-400">
                <Sparkles className="w-4 h-4 animate-spin" />
                Avaliando pronúncia com IA...
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Aguarde um instante enquanto processamos sua fala
              </span>
            </div>
          ) : isAnswered ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-stone-700 dark:text-stone-300">
                Gravação avaliada!
              </span>
              {audioUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <audio src={audioUrl} controls className="h-10 max-w-[240px]" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm md:text-base font-semibold text-stone-700 dark:text-stone-300">
                Toque no microfone e fale claramente
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Pronuncie a frase completa em Tupi
              </span>
            </div>
          )}
        </div>

        {/* Exibição de Erro de Microfone */}
        {erroMicrofone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm max-w-md"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex flex-col gap-1">
              <p className="font-medium">{erroMicrofone}</p>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={iniciarGravacao}
                  className="text-xs font-bold underline flex items-center gap-1 text-rose-700 dark:text-rose-300 hover:text-rose-900"
                >
                  <RotateCcw className="w-3 h-3" />
                  Tentar novamente
                </button>
                {onSkip && (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="text-xs font-bold underline text-stone-600 dark:text-stone-400 hover:text-stone-800"
                  >
                    Pular este exercício
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Detalhes da Avaliação (Ocultável se o rodapé já exibir para evitar duplicação) */}
        {exibirDetalhesCard && validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md flex flex-col gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 mt-2"
          >
            {/* Pontuação de Precisão */}
            {validationResult.precisao !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Precisão da Pronúncia:
                </span>
                <span
                  className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                    validationResult.precisao >= 75
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : validationResult.precisao >= 50
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {validationResult.precisao}%
                </span>
              </div>
            )}

            {/* Transcrição que a IA ouviu */}
            {validationResult.transcricaoAproximada && (
              <div className="flex flex-col gap-0.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Ouvimos:
                </span>
                <p className="text-stone-800 dark:text-stone-200 font-medium italic text-sm">
                  &ldquo;{validationResult.transcricaoAproximada}&rdquo;
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Botão Opcional: "Não posso falar agora" / "Pular" */}
        {!isAnswered && !gravando && !enviandoAudio && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-4 px-4 py-2 text-sm font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
            Não posso falar agora
          </button>
        )}
      </div>
    </div>
  );
}
