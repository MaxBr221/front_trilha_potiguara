'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { servicoAutenticacao } from '@/services/servicoAutenticacao';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const lidarComEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await servicoAutenticacao.esqueciSenha(email);
      setSucesso(true);
    } catch (err) {
      setErro('Ocorreu um erro ao processar sua solicitação. Verifique o e-mail ou tente novamente.');
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
          Recuperar Senha
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600 px-4">
          Digite seu e-mail abaixo e enviaremos um token de recuperação para você.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-200 sm:rounded-3xl sm:px-10">
          
          {sucesso ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-800">E-mail enviado!</h3>
              <p className="text-stone-600 text-sm">
                Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um token para redefinir sua senha em instantes.
              </p>
              <Link href="/redefinir-senha" className="block w-full">
                <Button className="w-full text-lg py-6">
                  Já tenho o Token
                </Button>
              </Link>
            </div>
          ) : (
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
                {!carregando && <Mail className="w-5 h-5 mr-2" />}
                Enviar Recuperação
              </Button>
            </form>
          )}

          {!sucesso && (
             <div className="mt-6 text-center">
              <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80">
                Lembrei minha senha! Voltar ao login.
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
