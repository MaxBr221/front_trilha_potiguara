'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { servicoAutenticacao } from '@/services/servicoAutenticacao';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const lidarComEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await servicoAutenticacao.register(nome, email, senha);
      setSucesso(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setErro((err as Error).message || 'Erro ao realizar cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-dvh bg-stone-50 flex flex-col justify-center pt-8 pb-32 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-3xl mb-6">
          <Leaf className="w-8 h-8 text-primary" />
          <span>Tupi Digital</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Já possui conta?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Faça login aqui
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-200 sm:rounded-2xl sm:px-10">
          {sucesso ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Cadastro concluído!</h3>
              <p className="text-stone-600">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <form className="space-y-6" onSubmit={lidarComEnvio}>
              <Input
                label="Nome"
                id="nome"
                name="nome"
                type="text"
                required
                value={nome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
                placeholder="Seu nome"
              />

              <Input
                label="Endereço de E-mail"
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="teste@tupi.com"
              />

              <Input
                label="Senha"
                id="senha"
                name="senha"
                type="password"
                required
                value={senha}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSenha(e.target.value)}
                placeholder="********"
              />

              {erro && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                  {erro}
                </div>
              )}

              <Button
                type="submit"
                isLoading={carregando}
                className="w-full"
              >
                {!carregando && <UserPlus className="w-5 h-5 mr-2" />}
                Criar conta
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-stone-500">Ou continue com</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');
                    window.location.href = `${baseUrl}/oauth2/authorization/google`;
                  }}
                  className="w-full flex justify-center items-center py-3 px-4 border border-stone-300 rounded-xl shadow-sm bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.28027 6.60998L5.27028 9.70498C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21538 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                  </svg>
                  Cadastrar com Google
                </button>

              </div>
            </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
