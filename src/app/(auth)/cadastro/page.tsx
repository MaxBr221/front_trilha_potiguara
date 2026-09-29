'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, UserPlus, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { servicoAutenticacao } from '@/services/servicoAutenticacao';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';

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

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    // Validações de segurança e consistência de dados
    if (!nomeLimpo || nomeLimpo.length < 3) {
      setErro('O nome deve ter pelo menos 3 caracteres.');
      return;
    }

    const nomeRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!nomeRegex.test(nomeLimpo)) {
      setErro('O nome deve conter apenas letras e espaços, sem caracteres especiais.');
      return;
    }

    if (!emailLimpo) {
      setErro('O campo de e-mail é obrigatório.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpo)) {
      setErro('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (!senha) {
      setErro('O campo de senha é obrigatório.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres para sua segurança.');
      return;
    }

    setCarregando(true);

    try {
      const pendingLessonId = localStorage.getItem('pendingLessonCompletion') || undefined;
      const pendingLessonXP = localStorage.getItem('pendingLessonXP') ? Number(localStorage.getItem('pendingLessonXP')) : undefined;

      await servicoAutenticacao.register(nomeLimpo, emailLimpo, senha, pendingLessonXP, pendingLessonId);
      
      // Limpa os dados temporários após o cadastro
      if (pendingLessonId) {
        localStorage.removeItem('pendingLessonCompletion');
        localStorage.removeItem('pendingLessonXP');
      }

      setSucesso(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const error = err as any;
      let mensagem = 'Erro ao realizar cadastro. Tente novamente.';
      
      if (error.response) {
        if (error.response.status === 409 || error.response.status === 400) {
          mensagem = error.response.data?.message || 'O e-mail informado já está em uso ou os dados são inválidos.';
        } else if (error.response.data && error.response.data.message) {
          mensagem = error.response.data.message;
        }
      } else if (error.message) {
        mensagem = error.message;
      }

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col justify-center py-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary/20 dark:bg-primary/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-pulse pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-amber-400/20 dark:bg-amber-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-pulse pointer-events-none" style={{ animationDelay: '4s' }} />

      <div className="mt-2 sm:mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl py-6 sm:py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white dark:border-stone-700/50 sm:rounded-[2rem] sm:px-10 transition-all flex flex-col items-center">
          
          <Link href="/" className="flex flex-col items-center gap-3 mb-6 group w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors" />
              <Image 
                src="/images/logo-potiguara.jpg" 
                alt="Logo Tupi Digital" 
                width={80} 
                height={80} 
                className="w-20 h-20 rounded-full shadow-lg border-4 border-white dark:border-stone-800 object-cover relative z-10 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="font-black text-2xl text-stone-800 dark:text-stone-100 tracking-tight">Tupi Digital</span>
          </Link>

          <div className="w-full text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
              Crie sua conta
            </h2>
            <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">
              Já possui conta?{' '}
              <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Faça login aqui
              </Link>
            </p>
          </div>

          {sucesso ? (
            <div className="text-center py-4 w-full">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Image src="/images/logo-potiguara.jpg" alt="Logo" width={48} height={48} className="w-12 h-12 rounded-full shadow-sm object-cover" />
              </div>
              <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mb-2">Cadastro concluído!</h3>
              <p className="text-stone-600 dark:text-stone-400">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <form className="space-y-5 w-full" onSubmit={lidarComEnvio}>
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
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-900/50 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-bold">{erro}</span>
                      <span className="text-red-500 dark:text-red-300 text-xs mt-1">Por favor, verifique os dados informados e tente novamente.</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={carregando}
                  className="w-full text-lg py-5 mt-2"
                >
                  {!carregando && <UserPlus className="w-5 h-5 mr-2" />}
                  Criar conta
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
