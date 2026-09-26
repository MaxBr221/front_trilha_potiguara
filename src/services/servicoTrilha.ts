import { api } from './api';
import { TrilhaResponseDTO, ModuloResponseDTO } from '@/types/dtos';

export const servicoTrilha = {
  async obterTrilhas(): Promise<TrilhaResponseDTO[]> {
    const response = await api.get<TrilhaResponseDTO[]>('/trilhas');
    const trilhas = response.data;
    
    // Calcula o progresso dinamicamente com base nas lições concluídas
    const trilhasCalculadas = await Promise.all(trilhas.map(async (trilha) => {
      try {
        const modulos = await api.get<ModuloResponseDTO[]>(`/trilhas/${trilha.id}/modulos`).then(res => res.data);
        let totalLessons = 0;
        let completedLessons = 0;
        
        modulos.forEach(mod => {
          if (mod.lessons && mod.lessons.length > 0) {
            totalLessons += mod.lessons.length;
            completedLessons += mod.lessons.filter(l => l.estaConcluida).length;
          }
        });
        
        if (totalLessons > 0) {
          trilha.progresso = Math.round((completedLessons / totalLessons) * 100);
        }
      } catch (e) {
        console.error(`Erro ao calcular progresso da trilha ${trilha.id}`, e);
      }
      return trilha;
    }));
    
    return trilhasCalculadas;
  },

  async obterTrilhaPorId(id: string | number): Promise<TrilhaResponseDTO | undefined> {
    const trilhas = await this.obterTrilhas();
    return trilhas.find((t) => String(t.id) === String(id));
  },

  async obterModulosPorIdTrilha(trailId: string | number): Promise<ModuloResponseDTO[]> {
    const response = await api.get<ModuloResponseDTO[]>(`/trilhas/${trailId}/modulos`);
    return response.data;
  }
};
