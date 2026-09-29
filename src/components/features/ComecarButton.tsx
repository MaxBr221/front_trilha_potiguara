'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { servicoTrilha } from '@/services/servicoTrilha';

export function ComecarButton() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  const handleClick = async () => {
    setCarregando(true);
    try {
      const trilhas = await servicoTrilha.obterTrilhas();
      if (trilhas && trilhas.length > 0) {
        // Pega a primeira trilha que não está bloqueada, ou apenas a primeira
        const primeiraTrilha = trilhas.find(t => !t.estaBloqueada) || trilhas[0];
        const modulos = await servicoTrilha.obterModulosPorIdTrilha(primeiraTrilha.id);
        
        if (modulos && modulos.length > 0 && modulos[0].lessons && modulos[0].lessons.length > 0) {
          const primeiraLicaoId = modulos[0].lessons[0].id;
          router.push(`/licoes/${primeiraLicaoId}`);
          return;
        }
      }
      // Fallback
      router.push('/dashboard');
    } catch (e) {
      console.error('Erro ao buscar a primeira lição', e);
      router.push('/dashboard');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={carregando}
      className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-80"
    >
      {carregando ? (
        <>
          Carregando...
          <Loader2 className="w-5 h-5 animate-spin" />
        </>
      ) : (
        <>
          Começar a aprender
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  );
}
