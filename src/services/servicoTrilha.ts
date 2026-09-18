import { api } from './api';
import { TrilhaResponseDTO, ModuloResponseDTO } from '@/types/dtos';

export const servicoTrilha = {
  async obterTrilhas(): Promise<TrilhaResponseDTO[]> {
    const response = await api.get<TrilhaResponseDTO[]>('/trilhas');
    return response.data;
  },

  async obterTrilhaPorId(id: string | number): Promise<TrilhaResponseDTO | undefined> {
    const response = await api.get<TrilhaResponseDTO[]>('/trilhas');
    return response.data.find((t) => String(t.id) === String(id));
  },

  async obterModulosPorIdTrilha(trailId: string | number): Promise<ModuloResponseDTO[]> {
    const response = await api.get<ModuloResponseDTO[]>(`/trilhas/${trailId}/modulos`);
    return response.data;
  }
};
