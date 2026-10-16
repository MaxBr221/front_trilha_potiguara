import { api } from './api';

export interface Exercicio {
  id: string | number;
  enunciado: string;
  tipo: string;
  opcoes?: string[];
  pontuacaoXp: number;
  ordemIndex: number;
}

export interface ValidacaoRespostaRequest {
  respostaUsuario: string;
}

export interface ValidacaoRespostaResponse {
  correta: boolean;
  xpGanho: number;
  respostaCorreta: string;
  contextoCultural?: string;
  feedbackPedagogico?: string;
}

export interface DicaExercicioResponse {
  dica?: string;
  pista?: string;
  mensagem?: string;
  [key: string]: unknown;
}

export const servicoExercicio = {
  async obterExerciciosPorLicao(licaoId: string | number): Promise<Exercicio[]> {
    const response = await api.get<Exercicio[]>(`/licoes/${licaoId}/exercicios`);
    return response.data;
  },

  async validarExercicio(exercicioId: string | number, respostaUsuario: string): Promise<ValidacaoRespostaResponse> {
    const response = await api.post<ValidacaoRespostaResponse>(`/exercicios/${exercicioId}/validar`, { respostaUsuario });
    return response.data;
  },

  async obterDicaExercicio(exercicioId: string | number): Promise<string> {
    try {
      const response = await api.get<DicaExercicioResponse | string>(`/exercicios/${exercicioId}/dica`);
      if (typeof response.data === 'string') {
        return response.data;
      }
      if (response.data && typeof response.data === 'object') {
        if ('dica' in response.data && typeof response.data.dica === 'string') {
          return response.data.dica;
        }
        if ('pista' in response.data && typeof response.data.pista === 'string') {
          return response.data.pista;
        }
        if ('mensagem' in response.data && typeof response.data.mensagem === 'string') {
          return response.data.mensagem;
        }
        const values = Object.values(response.data);
        const firstString = values.find(v => typeof v === 'string');
        if (firstString) return firstString as string;
      }
      return '';
    } catch (error) {
      console.error('Erro ao obter dica do exercício', error);
      return '';
    }
  },

  async concluirLicao(licaoId: string | number): Promise<void> {
    try {
      await api.post(`/licoes/${licaoId}/concluir`);
    } catch (e) {
      console.error('Erro ao concluir lição', e);
    }
  }
};
