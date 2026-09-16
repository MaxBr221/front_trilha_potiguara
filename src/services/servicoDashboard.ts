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
    const response = await api.get<DashboardData>('/usuarios/me/dashboard');
    return response.data;
  }
};