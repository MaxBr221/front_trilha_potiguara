'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '@/types/autenticacao';

interface ContextoAutenticacaoType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, userData: Usuario) => void;
  logout: () => void;
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
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setCarregando(false);
  }, []);

  const login = (token: string, userData: Usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <ContextoAutenticacao.Provider value={{ usuario, isAuthenticated: !!usuario, login, logout, carregando }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
};

export const usarAutenticacao = () => useContext(ContextoAutenticacao);
