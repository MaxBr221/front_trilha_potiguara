import { api } from './api';
import { Trilha } from '@/mocks/trilhas.mock';
import { Modulo } from '@/mocks/modulos.mock';

export const servicoTrilha = {
  async obterTrilhas(): Promise<Trilha[]> {
    const response = await api.get<Trilha[]>('/trilhas');
    return response.data;
  },

  async obterTrilhaPorId(id: string | number): Promise<Trilha | undefined> {
    const response = await api.get<Trilha[]>('/trilhas');
    return response.data.find((t) => String(t.id) === String(id));
  },

  async obterModulosPorIdTrilha(trailId: string | number): Promise<Modulo[]> {
    const response = await api.get<Modulo[]>(`/trilhas/${trailId}/modulos`);
    return response.data;
  }
};
