// Utilitário de Efeitos Sonoros usando Web Audio API e Síntese de Voz Tupi
class ArenaAudioManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public playTick() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignora erros de áudio
    }
  }

  public playCorrect() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch {
      // Ignora erros de áudio
    }
  }

  public playWrong() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignora erros de áudio
    }
  }

  public playClick() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignora erros de áudio
    }
  }

  public playFanfare() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const sequence = [
        { freq: 440, time: 0, dur: 0.15 },
        { freq: 554.37, time: 0.15, dur: 0.15 },
        { freq: 659.25, time: 0.3, dur: 0.2 },
        { freq: 880, time: 0.5, dur: 0.5 },
      ];
      sequence.forEach((item) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.freq, now + item.time);
        gain.gain.setValueAtTime(0.18, now + item.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + item.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + item.time);
        osc.stop(now + item.time + item.dur);
      });
    } catch {
      // Ignora erros de áudio
    }
  }

  /**
   * Reproduz a pronúncia em TUPI com os mesmos mapeamentos fonéticos e regras
   * de dicção utilizados no Dicionário da plataforma.
   */
  public tocarAudioTupi(palavraTupi: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!palavraTupi || !palavraTupi.trim()) return;

    try {
      window.speechSynthesis.cancel();

      // Normaliza caracteres Unicode compostos e minúsculas
      let palavraSanitizada = palavraTupi.normalize('NFC').toLowerCase();

      // Remove colchetes de fonética ex: "[tesá]" -> "tesá"
      palavraSanitizada = palavraSanitizada.replace(/[\[\]]/g, '');

      // Remove pontuações indesejadas e símbolos que fariam o leitor falar os nomes deles
      palavraSanitizada = palavraSanitizada.replace(/[/\\;:=(?)²!.]/g, ' ');

      // Remove o apóstrofo, hífen e pontuações que forçam pausas no motor de voz
      palavraSanitizada = palavraSanitizada.replace(/['´`\-]/g, '');

      // Mapeamento fonético para a voz em pt-BR pronunciar corretamente os sons e vogais do Tupi
      palavraSanitizada = palavraSanitizada
        .replace(/ï|i\u0308/g, 'i') // Trata trema (ï) para evitar que o mobile soletre letra por letra
        .replace(/ĩ|i\u0303/g, 'in')
        .replace(/ẽ|e\u0303/g, 'en')
        .replace(/ũ|u\u0303/g, 'un')
        .replace(/ỹ|y\u0303/g, 'in')
        .replace(/ŷ|ý|y/g, 'i')
        .replace(/î/g, 'i')
        .replace(/û/g, 'u')
        .replace(/ô/g, 'o')
        .replace(/ñ/g, 'nh')
        .replace(/x/g, 'ch')
        // Consoantes pré-nasalizadas no início de palavras que não existem na fonotática do pt-BR:
        .replace(/\bnde\b/g, 'ne')
        .replace(/\bnd([aeiou])/g, 'n$1')
        .replace(/\bmb/g, 'b');

      palavraSanitizada = palavraSanitizada.replace(/\s+/g, ' ').trim();

      const fala = new SpeechSynthesisUtterance(palavraSanitizada);
      fala.lang = 'pt-BR';

      const vozes = window.speechSynthesis.getVoices();
      const vozesPtBr = vozes.filter(
        (v) => v.lang.includes('pt-BR') || v.lang.includes('pt_BR') || v.lang.startsWith('pt')
      );

      // Tenta encontrar uma voz masculina (Windows: Daniel/Thiago, iOS/Mac: Felipe, Android/Chrome: male)
      const vozMasculina = vozesPtBr.find(
        (v) =>
          /daniel|thiago|julio|antonio|macedo|felipe|male|homem/i.test(v.name) ||
          /male/i.test(v.voiceURI)
      );

      if (vozMasculina) {
        fala.voice = vozMasculina;
        fala.pitch = 0.95;
      } else if (vozesPtBr.length > 1) {
        fala.voice = vozesPtBr[vozesPtBr.length - 1];
        fala.pitch = 0.9;
      } else if (vozesPtBr.length === 1) {
        fala.voice = vozesPtBr[0];
        fala.pitch = 0.9;
      } else {
        fala.pitch = 0.9;
      }

      // Velocidade cadenciada para boa dicção
      fala.rate = 0.95;

      window.speechSynthesis.speak(fala);
    } catch {
      // Ignora erro
    }
  }

  public falarTexto(texto: string) {
    this.tocarAudioTupi(texto);
  }
}

export const arenaAudio = new ArenaAudioManager();
