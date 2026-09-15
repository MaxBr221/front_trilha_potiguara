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

const mockExercicios: Exercicio[] = [
  {
    id: 'mock-1',
    enunciado: 'Como se diz "Bom dia" em Tupi?',
    tipo: 'múltipla-escolha',
    opcoes: ['Coema', 'Katu', 'Ita', 'Oca'],
    pontuacaoXp: 10,
    ordemIndex: 0
  },
  {
    id: 'mock-2',
    enunciado: 'O que significa a palavra "Ita"?',
    tipo: 'múltipla-escolha',
    opcoes: ['Água', 'Pedra', 'Fogo', 'Vento'],
    pontuacaoXp: 10,
    ordemIndex: 1
  }
];

export const servicoExercicio = {
  async obterExerciciosPorLicao(licaoId: string | number): Promise<Exercicio[]> {
    try {
      const response = await api.get<Exercicio[]>(`/licoes/${licaoId}/exercicios`);
      if (response.data && response.data.length > 0) return response.data;
      return mockExercicios; // Fallback
    } catch {
      return mockExercicios; // Fallback
    }
  },

  async validarExercicio(exercicioId: string | number, respostaUsuario: string): Promise<ValidacaoRespostaResponse> {
    try {
      const response = await api.post<ValidacaoRespostaResponse>(`/exercicios/${exercicioId}/validar`, { respostaUsuario });
      return response.data;
    } catch {
      // Fallback mock validation
      const isCorreta = respostaUsuario === 'Coema' || respostaUsuario === 'Pedra';
      return {
        correta: isCorreta,
        xpGanho: isCorreta ? 10 : 0,
        respostaCorreta: exercicioId === 'mock-1' ? 'Coema' : 'Pedra'
      };
    }
  }
};
