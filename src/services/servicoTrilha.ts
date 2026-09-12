import { api } from './api';
import { trilhasFalsas, Trilha } from '@/mocks/trilhas.mock';
import { modulosFalsos, Modulo } from '@/mocks/modulos.mock';

export const servicoTrilha = {
  async obterTrilhas(): Promise<Trilha[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(trilhasFalsas), 600);
    });
  },

  async obterTrilhaPorId(id: number): Promise<Trilha | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(trilhasFalsas.find(t => t.id === id)), 500);
    });
  },

  async obterModulosPorIdTrilha(trailId: number): Promise<Modulo[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(modulosFalsos[trailId] || []), 500);
    });
  }
};
