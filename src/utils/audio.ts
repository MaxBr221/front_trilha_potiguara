'use client';

// Singleton para o AudioContext
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

// Função base para tocar uma nota
const playTone = (freq: number, type: OscillatorType, startTime: number, duration: number, volume: number = 0.1) => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

  // Envelope de volume suave
  gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

export const sons = {
  // Som tocado ao acertar uma questão (Duas notas felizes: C5 -> E5)
  sucesso: () => {
    playTone(523.25, 'sine', 0, 0.15, 0.15); // Dó
    playTone(659.25, 'sine', 0.15, 0.3, 0.15); // Mi
  },
  
  // Som tocado ao errar uma questão (Som grave e ríspido)
  erro: () => {
    playTone(200, 'sawtooth', 0, 0.15, 0.1);
    playTone(150, 'sawtooth', 0.1, 0.3, 0.1);
  },

  // Som para nova notificação (Pop/chime suave: G5 -> C6)
  notificacao: () => {
    playTone(783.99, 'sine', 0, 0.1, 0.1); // Sol
    playTone(1046.50, 'sine', 0.1, 0.3, 0.1); // Dó (oitava acima)
  },

  // Som épico para quando concluir a lição (Arpejo)
  conclusao: () => {
    playTone(440.00, 'sine', 0, 0.2, 0.1); // A4
    playTone(554.37, 'sine', 0.15, 0.2, 0.1); // C#5
    playTone(659.25, 'sine', 0.30, 0.2, 0.1); // E5
    playTone(880.00, 'sine', 0.45, 0.6, 0.15); // A5
  }
};
