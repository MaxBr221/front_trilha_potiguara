import { api } from './api';

export interface ConteudoLinguistico {
  id: string;
  palavraTupi: string;
  traducaoPtBr: string;
  fonetica: string;
  tipo: string;
  imageUrl?: string;
}

export const servicoDicionario = {
  async listarTodos(): Promise<ConteudoLinguistico[]> {
    const response = await api.get<ConteudoLinguistico[]>('/conteudos');
    return response.data;
  },
  
  async obterPorLicao(licaoId: string | number): Promise<ConteudoLinguistico[]> {
    try {
      const response = await api.get<ConteudoLinguistico[]>(`/conteudos/licoes/${licaoId}`);
      return response.data;
    } catch (e) {
      console.error('Erro ao buscar vocabulário da lição', e);
      return [];
    }
  }
};
