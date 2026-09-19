'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import { Leaf } from 'lucide-react';
import { Usuario } from '@/types/autenticacao';

function OAuth2RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAutenticacao();
  const [erro, setErro] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const erroUrl = searchParams.get('error');

    if (erroUrl) {
      const timeout = setTimeout(() => {
        setErro('Ocorreu um erro ao tentar fazer login com o provedor.');
        setTimeout(() => router.push('/login'), 3000);
      }, 0);
      return () => clearTimeout(timeout);
    }

    if (token) {
      try {
        // Tenta extrair dados básicos do JWT (assumindo formato padrão)
        let payload: Record<string, unknown> = {};
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          payload = JSON.parse(jsonPayload);
        } catch (e) {
          console.error("Falha ao decodificar token JWT", e);
        }

        const mockUser: Usuario = {
          id: String(payload.sub || payload.id || 'google-user'),
          nome: String(payload.name || payload.nome || 'Usuário Google'),
          email: String(payload.email || ''),
          xp: 0,
          sequenciaAtual: 0,
          perfil: (payload.roles as string[])?.[0] || 'USER'
        };

        login(token, mockUser);
        router.push('/dashboard');
      } catch (err) {
        setTimeout(() => {
          setErro('Falha ao processar a autenticação. Tente novamente.');
          setTimeout(() => router.push('/login'), 3000);
        }, 0);
      }
    } else {
      // Se não tem token nem erro, talvez ainda esteja carregando, mas caso falhe redireciona:
      setTimeout(() => {
        setErro('Token não encontrado na resposta.');
        setTimeout(() => router.push('/login'), 3000);
      }, 0);
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Leaf className="w-12 h-12 text-primary" />
      </div>
      
      {erro ? (
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro de Autenticação</h2>
          <p className="text-stone-600">{erro}</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-2">Autenticando...</h2>
          <p className="text-stone-600">Por favor, aguarde enquanto preparamos seu acesso.</p>
        </div>
      )}
    </div>
  );
}

export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <OAuth2RedirectContent />
    </Suspense>
  );
}
