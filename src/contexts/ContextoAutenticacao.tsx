'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Usuario } from '@/types/autenticacao';
import { servicoUsuario } from '@/services/servicoUsuario';
import { api } from '@/services/api';
import { definirCookieAuth, limparCookieAuth, obterCookieAuth, limparSessaoCompleta } from '@/utils/cookies';

interface ContextoAutenticacaoType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, userData: Usuario) => Promise<void>;
  logout: () => void;
  atualizarUsuario: (userData: Partial<Usuario>) => void;
  carregando: boolean;
}

const ContextoAutenticacao = createContext<ContextoAutenticacaoType>({} as ContextoAutenticacaoType);

export const ProvedorAutenticacao = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUser] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // 1. Se estiver na tela de login/rotas públicas, limpa resquícios antigos para evitar chamadas fantasmas
    if (typeof window !== 'undefined') {
      const publicPaths = ['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha'];
      if (publicPaths.includes(window.location.pathname)) {
        limparSessaoCompleta();
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setCarregando(false);
        return;
      }
    }

    // 2. Inicialização segura da sessão em rotas protegidas
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || obterCookieAuth() : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (token) {
      // Sincroniza header do axios imediatamente
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }

      // Validação do perfil no backend em segundo plano
      servicoUsuario.obterPerfil()
        .then((freshUser) => {
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        })
        .catch((err) => {
          console.warn('Sessão inicial não pôde ser revalidada no backend:', err);
        })
        .finally(() => {
          setCarregando(false);
        });
    } else {
      setCarregando(false);
    }
  }, []);

  const login = useCallback(async (token: string, userData: Usuario) => {
    // 1. Atualização imediata e síncrona de cabeçalhos e storage
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    definirCookieAuth(token);
    setUser(userData);

    // 2. Busca dados complementares em segundo plano sem quebrar o login
    try {
      const freshUser = await servicoUsuario.obterPerfil();
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (e) {
      console.warn('Perfil mantido com os dados retornados no login:', e);
    }

    // 3. Processamento de lições pendentes se houver
    const pendingLessonId = localStorage.getItem('pendingLessonCompletion');
    if (pendingLessonId) {
      try {
        const { servicoExercicio } = await import('@/services/servicoExercicio');
        await servicoExercicio.concluirLicao(pendingLessonId);
        localStorage.removeItem('pendingLessonCompletion');
        localStorage.removeItem('pendingLessonXP');
      } catch (e) {
        console.error('Erro ao concluir lição pendente após login:', e);
      }
    }
  }, []);

  const logout = useCallback(() => {
    limparSessaoCompleta();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  }, []);

  const atualizarUsuario = useCallback((novosDados: Partial<Usuario>) => {
    setUser((prevUsuario) => {
      if (!prevUsuario) return null;
      const usuarioAtualizado = { ...prevUsuario, ...novosDados };
      localStorage.setItem('user', JSON.stringify(usuarioAtualizado));
      return usuarioAtualizado;
    });
  }, []);

  return (
    <ContextoAutenticacao.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        login,
        logout,
        atualizarUsuario,
        carregando
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
};

export const useAutenticacao = () => useContext(ContextoAutenticacao);
