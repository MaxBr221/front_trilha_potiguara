import { api } from './api';

export interface ConteudoLinguistico {
  id: string;
  palavraTupi: string;
  traducaoPtBr: string;
  fonetica: string;
  tipo: string;
}

export const servicoDicionario = {
  async listarTodos(): Promise<ConteudoLinguistico[]> {
    const response = await api.get<ConteudoLinguistico[]>('/conteudos');
    return response.data;
  }
};
