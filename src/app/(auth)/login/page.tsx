'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, senha);
      if (response.user) {
        login(response.token, response.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Endereço de E-mail"
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teste@tupi.com"
            />

            <Input
              label="Senha"
              id="senha"
              name="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="********"
            />

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              {!loading && <LogIn className="w-5 h-5 mr-2" />}
              Entrar
            </Button>
            
            <div className="text-center text-xs text-stone-500 mt-4">
              <p>Dica para testes: E-mail: <b>teste@tupi.com</b> / Senha: <b>123</b></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
