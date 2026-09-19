'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, LogIn, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { servicoAutenticacao } from '@/services/servicoAutenticacao';
import { usarAutenticacao } from '@/contexts/ContextoAutenticacao';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = usarAutenticacao();
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
    } catch (err: any) {
      let mensagem = 'Ocorreu um erro inesperado. Tente novamente.';
      
      // Tratamento de erros comuns da API
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          mensagem = 'E-mail ou senha incorretos.';
        } else if (err.response.status === 404) {
          mensagem = 'Usuário não encontrado. Crie uma conta.';
        } else if (err.response.data && err.response.data.message) {
          mensagem = err.response.data.message;
        }
      } else if (err.message) {
        mensagem = err.message;
      }

      setErro(mensagem);
      mostrarToast(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      {/* Toast Notification (Canto superior direito) */}
      {toastErro && (
        <div className="fixed top-10 right-8 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-top-4">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span className="font-bold">{toastErro}</span>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-3xl mb-6">
          <Leaf className="w-8 h-8 text-primary" />
          <span>Tupi Digital</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          Acesse sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Ou{' '}
          <Link href="/cadastro" className="font-medium text-primary hover:text-primary/80">
            crie sua conta gratuitamente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-200 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={lidarComEnvio}>
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
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {erro && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
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
        </div>
      </div>
    </div>
  );
}
