import { api } from './api';
import { Usuario, Amigo, PerfilPublico } from '@/types/autenticacao';

export const servicoUsuario = {
  async atualizarPerfil(dados: { fotoPerfil?: string; fotoPerfilPosicao?: string; nome?: string }): Promise<Usuario> {
    const response = await api.put<Usuario>('/usuarios/me', dados);
    return response.data;
  },
  async obterPerfil(): Promise<Usuario> {
    const response = await api.get<Usuario>('/usuarios/me');
    return response.data;
  },
  async listarAmigos(): Promise<Amigo[]> {
    const response = await api.get<Amigo[]>('/usuarios/amigos');
    return response.data;
  },
  async obterPerfilPublico(id: string): Promise<PerfilPublico> {
    const response = await api.get<PerfilPublico>(`/usuarios/perfil/${id}`);
    return response.data;
  },
  async seguirUsuario(id: string): Promise<void> {
    await api.post(`/usuarios/amigos/${id}`);
  },
  async deixarDeSeguirUsuario(id: string): Promise<void> {
    await api.delete(`/usuarios/amigos/${id}`);
  },
  async buscarUsuarios(nome?: string): Promise<Amigo[]> {
    const params = nome ? { nome } : {};
    const response = await api.get<Amigo[]>('/usuarios/busca', { params });
    return response.data;
  }
};
