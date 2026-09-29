import { api } from './api';
import { RespostaAutenticacao } from '@/types/autenticacao';

export const servicoAutenticacao = {
  async login(email: string, senha: string): Promise<RespostaAutenticacao> {
    const response = await api.post<RespostaAutenticacao>('/auth/login', { email, senha });
    return response.data;
  },

  async register(nome: string, email: string, senha: string, xpInicial?: number, licaoConcluidaId?: string | number): Promise<void> {
    const payload: any = { nome, email, senha, perfil: 'USER' };
    if (xpInicial !== undefined) payload.xpInicial = xpInicial;
    if (licaoConcluidaId !== undefined) payload.licaoConcluidaId = licaoConcluidaId;
    await api.post('/auth/register', payload);
  },

  async esqueciSenha(email: string): Promise<void> {
    await api.post('/auth/esqueci-senha', { email });
  },

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    await api.post('/auth/redefinir-senha', { token, novaSenha });
  }
};
