'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Usuario } from '@/types/autenticacao';
import { servicoUsuario } from '@/services/servicoUsuario';

interface ContextoAutenticacaoType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, userData: Usuario) => void;
  logout: () => void;
  atualizarUsuario: (userData: Partial<Usuario>) => void;
  carregando: boolean;
}

const ContextoAutenticacao = createContext<ContextoAutenticacaoType>({} as ContextoAutenticacaoType);

export const ProvedorAutenticacao = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUser] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Inicialização da sessão
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    const timeoutId = setTimeout(async () => {
      if (token) {
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        try {
          const freshUser = await servicoUsuario.obterPerfil();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          console.error("Erro ao obter perfil atualizado:", error);
        }
      }
      setCarregando(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const login = useCallback((token: string, userData: Usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const atualizarUsuario = useCallback((novosDados: Partial<Usuario>) => {
    setUser(prevUsuario => {
      if (!prevUsuario) return null;
      const usuarioAtualizado = { ...prevUsuario, ...novosDados };
      localStorage.setItem('user', JSON.stringify(usuarioAtualizado));
      return usuarioAtualizado;
    });
  }, []);

  return (
    <ContextoAutenticacao.Provider value={{ usuario, isAuthenticated: !!usuario, login, logout, atualizarUsuario, carregando }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
};

export const useAutenticacao = () => useContext(ContextoAutenticacao);
