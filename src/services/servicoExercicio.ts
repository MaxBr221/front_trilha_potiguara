import { api } from './api';

export interface Exercicio {
  id: string | number;
  enunciado: string;
  tipo: string;
  opcoes: string[];
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

  async concluirLicao(licaoId: string | number): Promise<void> {
    try {
      await api.post(`/licoes/${licaoId}/concluir`);
    } catch (e) {
      console.error('Erro ao concluir lição', e);
    }
  }
};
