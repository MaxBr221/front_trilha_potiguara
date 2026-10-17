import { api } from './api';

export interface ConquistaDTO {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  corBase: string;
  desbloqueada: boolean;
  progresso: number;
  dataDesbloqueio: string | null;
}

export interface DashboardData {
  xp: number;
  diasOfensiva: number;
  licoesConcluidas: number;
  taxaAcerto: number;
  conquistas: ConquistaDTO[];
}

export const servicoDashboard = {
  async obterDadosDashboard(): Promise<DashboardData> {
    try {
      const response = await api.get<DashboardData>('/usuarios/me/dashboard');
      return response.data;
    } catch (error) {
      console.warn('Não foi possível obter dados do dashboard da API, gerando fallback seguro:', error);
      return {
        xp: 0,
        diasOfensiva: 0,
        licoesConcluidas: 0,
        taxaAcerto: 0,
        conquistas: []
      };
    }
  }
};
