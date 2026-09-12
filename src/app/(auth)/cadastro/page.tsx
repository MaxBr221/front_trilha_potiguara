'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(nome, email, senha);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
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
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Cadastro concluído!</h3>
              <p className="text-stone-600">Redirecionando para o login...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Nome"
                id="nome"
                name="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
              />

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
                {!loading && <UserPlus className="w-5 h-5 mr-2" />}
                Criar conta
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
