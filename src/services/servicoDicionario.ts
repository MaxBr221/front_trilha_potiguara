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
      let dados = response.data;
      
      // Filtro temporário para remover "Onça" e adicionar "Boa noite"
      dados = dados.filter(v => v.traducaoPtBr.toLowerCase() !== 'onça' && v.palavraTupi.toLowerCase() !== 'onça');
      if (!dados.some(v => v.traducaoPtBr.toLowerCase() === 'boa noite')) {
        dados.push({
          id: 'mock-boa-noite',
          palavraTupi: 'Pituna porang',
          traducaoPtBr: 'Boa noite',
          fonetica: 'pi-tu-na po-rang',
          tipo: 'EXPRESSAO'
        });
      }
      
      return dados;
    } catch (e) {
      console.error('Erro ao buscar vocabulário da lição', e);
      return [];
    }
  }
};
