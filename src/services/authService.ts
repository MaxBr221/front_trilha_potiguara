import { api } from './api';
import { AuthResponse } from '@/types/auth';

export const authService = {
  async login(email: string, senha: string):Promise<AuthResponse> {
    // MOCK (Será substituído pela chamada real post /auth/login)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'teste@tupi.com' && senha === '123') {
          resolve({
            token: 'mock-jwt-token-123456',
            user: {
              id: 1,
              nome: 'Maxsuel',
              email: 'teste@tupi.com',
              xp: 850,
              sequenciaAtual: 7,
              perfil: 'USER'
            }
          });
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 800);
    });
  },

  async register(nome: string, email: string, senha: string): Promise<void> {
    // MOCK (Será substituído pela chamada real post /auth/register)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 800);
    });
  }
};
