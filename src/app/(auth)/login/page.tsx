'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, LogIn, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { servicoAutenticacao } from '@/services/servicoAutenticacao';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [toastErro, setToastErro] = useState('');

  const mostrarToast = (msg: string) => {
    setToastErro(msg);
    setTimeout(() => setToastErro(''), 5000);
  };

  const lidarComEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setToastErro('');
    setCarregando(true);

    try {
      const response = await servicoAutenticacao.login(email, senha);
      if (response.usuario) {
        login(response.token, response.usuario);
        router.push('/dashboard');
      }
    } catch (err) {
      const error = err as { response?: { status: number; data?: { message?: string } }; message?: string };
      let mensagem = 'Ocorreu um erro inesperado. Tente novamente.';
      
      // Tratamento de erros comuns da API
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          mensagem = 'E-mail ou senha incorretos.';
        } else if (error.response.status === 404) {
          mensagem = 'Usuário não encontrado. Crie uma conta.';
        } else if (error.response.data && error.response.data.message) {
          mensagem = error.response.data.message;
        }
      } else if (error.message) {
        if (error.message === 'Network Error') {
          // Quando o backend bloqueia o CORS em respostas 401/403, o Axios lança 'Network Error'
          mensagem = 'E-mail ou senha incorretos.';
        } else {
          mensagem = error.message;
        }
      }

      setErro(mensagem);
      mostrarToast(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col justify-center pt-8 pb-12 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary/20 dark:bg-primary/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-pulse pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-amber-400/20 dark:bg-amber-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-pulse pointer-events-none" style={{ animationDelay: '4s' }} />
      
      {/* Toast Notification (Canto superior direito) */}
      {toastErro && (
        <div className="fixed top-10 right-8 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-top-4">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span className="font-bold">{toastErro}</span>
        </div>
      )}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl py-10 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white dark:border-stone-700/50 sm:rounded-[2rem] sm:px-10 transition-all flex flex-col items-center">
          
          <Link href="/" className="flex flex-col items-center gap-4 mb-8 group w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors" />
              <Image 
                src="/images/logo-potiguara.jpg" 
                alt="Logo Tupi Digital" 
                width={112} 
                height={112} 
                className="w-28 h-28 rounded-full shadow-lg border-4 border-white dark:border-stone-800 object-cover relative z-10 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="font-black text-3xl text-stone-800 dark:text-stone-100 tracking-tight">Tupi Digital</span>
          </Link>

          <div className="w-full text-center mb-8">
            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
              Acesse sua conta
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Crie gratuitamente
              </Link>
            </p>
          </div>

          <form className="space-y-5 w-full" onSubmit={lidarComEnvio}>
            <Input
              label="Endereço de E-mail"
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />

            <div>
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
              <div className="flex justify-end mt-2">
                <Link 
                  href="/esqueci-senha"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {erro && (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {erro}
              </div>
            )}

            <Button
              type="submit"
              isLoading={carregando}
              className="w-full text-lg py-6"
            >
              {!carregando && <LogIn className="w-5 h-5 mr-2" />}
              Entrar
            </Button>
          </form>

          <div className="mt-6 w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300 dark:border-stone-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 font-medium">Ou continue com</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');
                  window.location.href = `${baseUrl}/oauth2/authorization/google`;
                }}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-stone-300 dark:border-stone-600 rounded-xl shadow-sm bg-white dark:bg-stone-800 text-sm font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <svg className="h-5 w-5 mr-3" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.28027 6.60998L5.27028 9.70498C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21538 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                </svg>
                Continuar com Google
              </button>
            </div>
          </div>
        </div>

        {/* Developer Links */}
        <div className="mt-8 flex flex-col items-center">
          <p className="text-xs font-bold text-stone-500/70 dark:text-stone-400/70 mb-4 uppercase tracking-wider">Desenvolvido por</p>
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <a 
              href="https://www.instagram.com/_maxsueel?stkn=MW9vbHFkbWh5dWEzdw==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-[#E1306C] dark:hover:text-[#E1306C] transition-all bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border border-white/50 dark:border-stone-700/50 px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              @_maxsueel
            </a>
            <a 
              href="https://www.linkedin.com/in/maxsuel-lima-5a27a635b/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-[#0a66c2] dark:hover:text-[#60a5fa] transition-all bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border border-white/50 dark:border-stone-700/50 px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              Maxsuel Lima
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
