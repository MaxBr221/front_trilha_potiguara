import { describe, it, expect, vi, beforeEach } from 'vitest';
import { servicoExercicio, decodificarEntidadesHtml } from './servicoExercicio';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('servicoExercicio', () => {
  describe('decodificarEntidadesHtml', () => {
    it('deve converter entidades HTML como &#39; e &quot; para caracteres legíveis', () => {
      const entrada = "Você pronunciou a palavra &#39;Pirá&#39; perfeitamente &quot;Tupi&quot; &amp; cia";
      const saida = decodificarEntidadesHtml(entrada);
      expect(saida).toBe("Você pronunciou a palavra 'Pirá' perfeitamente \"Tupi\" & cia");
    });

    it('deve retornar string vazia para valores nulos ou indefinidos', () => {
      expect(decodificarEntidadesHtml(null)).toBe('');
      expect(decodificarEntidadesHtml(undefined)).toBe('');
      expect(decodificarEntidadesHtml('')).toBe('');
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validarExercicio', () => {
    it('deve enviar a resposta do usuário e retornar o objeto de validação com feedbackPedagogico', async () => {
      const mockResponse = {
        data: {
          correta: true,
          xpGanho: 10,
          respostaCorreta: "mandi'oka",
          feedbackPedagogico: "Parabéns, você lembrou da palavra! Lembre-se apenas do apóstrofo (') para marcar a pausa glotal: mandi'oka."
        }
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const resultado = await servicoExercicio.validarExercicio('ex-123', 'mandioka');

      expect(api.post).toHaveBeenCalledWith('/exercicios/ex-123/validar', { respostaUsuario: 'mandioka' });
      expect(resultado.correta).toBe(true);
      expect(resultado.feedbackPedagogico).toContain("Parabéns, você lembrou da palavra!");
    });
  });

  describe('validarAudio', () => {
    it('deve enviar o blob de áudio via FormData e retornar a resposta do backend', async () => {
      const mockResponse = {
        data: {
          correta: true,
          precisao: 85,
          xpGanho: 15,
          respostaCorreta: "Tîa nde Ko'ema",
          transcricaoAproximada: "Tia nde Ko'ema",
          feedbackPedagogico: "Muito bem! Sua pronúncia foi reconhecida com sucesso."
        }
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const audioBlob = new Blob(['dummy audio content'], { type: 'audio/webm' });
      const resultado = await servicoExercicio.validarAudio('ex-audio-1', audioBlob);

      expect(api.post).toHaveBeenCalledWith(
        '/exercicios/ex-audio-1/validar-audio',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(resultado.correta).toBe(true);
      expect(resultado.precisao).toBe(85);
      expect(resultado.xpGanho).toBe(15);
      expect(resultado.respostaCorreta).toBe("Tîa nde Ko'ema");
      expect(resultado.transcricaoAproximada).toBe("Tia nde Ko'ema");
      expect(resultado.feedbackPedagogico).toContain("Muito bem!");
    });
  });

  describe('obterDicaExercicio', () => {
    it('deve chamar o endpoint GET /exercicios/{id}/dica e retornar dica quando formato for objeto com dica', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { dica: 'Lembre-se da raiz tupi "oka" que significa casa.' }
      });

      const dica = await servicoExercicio.obterDicaExercicio(42);

      expect(api.get).toHaveBeenCalledWith('/exercicios/42/dica');
      expect(dica).toBe('Lembre-se da raiz tupi "oka" que significa casa.');
    });

    it('deve retornar string quando a API responder com texto simples', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: 'Pista direta em texto puro'
      });

      const dica = await servicoExercicio.obterDicaExercicio('ex-99');

      expect(api.get).toHaveBeenCalledWith('/exercicios/ex-99/dica');
      expect(dica).toBe('Pista direta em texto puro');
    });

    it('deve lidar com campo pista ou mensagem caso venha com nome alternativo', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { pista: 'Pista alternativa do tutor' }
      });

      const dica = await servicoExercicio.obterDicaExercicio('ex-100');
      expect(dica).toBe('Pista alternativa do tutor');
    });

    it('deve retornar string vazia caso ocorra erro na chamada', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Erro de conexão'));

      const dica = await servicoExercicio.obterDicaExercicio('ex-err');
      expect(dica).toBe('');
    });
  });
});
