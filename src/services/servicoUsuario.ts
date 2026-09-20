import { api } from './api';
import { Usuario } from '@/types/autenticacao';

export const servicoUsuario = {
  async atualizarPerfil(dados: { fotoPerfil?: string; nome?: string }): Promise<Usuario> {
    const response = await api.put<Usuario>('/usuarios/me', dados);
    return response.data;
  },
  async obterPerfil(): Promise<Usuario> {
    const response = await api.get<Usuario>('/usuarios/me');
    return response.data;
  }
};
