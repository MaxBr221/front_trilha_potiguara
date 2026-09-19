'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { servicoAutenticacao } from '@/services/servicoAutenticacao';

export default function RedefinirSenhaPage() {
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const lidarComEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await servicoAutenticacao.redefinirSenha(token, novaSenha);
      setSucesso(true);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        setErro('Token inválido ou expirado. Solicite um novo na página de esqueci a senha.');
      } else {
        setErro('Ocorreu um erro ao redefinir a senha. Verifique o token e tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-3xl mb-6">
          <Leaf className="w-8 h-8 text-primary" />
          <span>Tupi Digital</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          Nova Senha
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600 px-4">
          Digite o token recebido por e-mail e sua nova senha segura.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-200 sm:rounded-3xl sm:px-10">
          
          {sucesso ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-800">Senha Redefinida!</h3>
              <p className="text-stone-600 text-sm">
                Sua senha foi alterada com sucesso. Você já pode fazer login.
              </p>
              <Link href="/login" className="block w-full">
                <Button className="w-full text-lg py-6">
                  Fazer Login
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={lidarComEnvio}>
              <Input
                label="Token de Recuperação"
                id="token"
                name="token"
                type="text"
                required
                value={token}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                placeholder="Insira o código UUID aqui"
              />

              <Input
                label="Nova Senha"
                id="novaSenha"
                name="novaSenha"
                type="password"
                required
                value={novaSenha}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaSenha(e.target.value)}
                placeholder="********"
              />

              {erro && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {erro}
                </div>
              )}

              <Button
                type="submit"
                isLoading={carregando}
                className="w-full text-lg py-6"
              >
                {!carregando && <Lock className="w-5 h-5 mr-2" />}
                Salvar Nova Senha
              </Button>
            </form>
          )}

          {!sucesso && (
             <div className="mt-6 text-center">
              <Link href="/login" className="text-sm font-medium text-stone-500 hover:text-stone-700">
                Lembrei minha senha! Cancelar.
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
