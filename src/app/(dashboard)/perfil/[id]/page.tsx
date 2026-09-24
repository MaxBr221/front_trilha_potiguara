'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, UserPlus, UserMinus, Flame, Trophy, Users, X } from 'lucide-react';
import { servicoUsuario } from '@/services/servicoUsuario';
import { PerfilPublico } from '@/types/autenticacao';

export default function PerfilPublicoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processandoAcao, setProcessandoAcao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalFotoAberta, setModalFotoAberta] = useState(false);

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        setCarregando(true);
        setErro(null);
        if (id) {
          const dados = await servicoUsuario.obterPerfilPublico(id);
          setPerfil(dados);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil público:', err);
        setErro('Não foi possível carregar o perfil no momento.');
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [id]);

  const handleSeguirAlternar = async () => {
    if (!perfil) return;
    
    try {
      setProcessandoAcao(true);
      if (perfil.isAmigo) {
        await servicoUsuario.deixarDeSeguirUsuario(id);
        setPerfil({ ...perfil, isAmigo: false, totalAmigos: Math.max(0, perfil.totalAmigos - 1) });
      } else {
        await servicoUsuario.seguirUsuario(id);
        setPerfil({ ...perfil, isAmigo: true, totalAmigos: perfil.totalAmigos + 1 });
      }
    } catch (err) {
      console.error('Erro ao realizar ação:', err);
      alert('Não foi possível realizar a ação. Tente novamente mais tarde.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !perfil) {
    return (
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {erro || 'Perfil não encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm p-8 text-center"
      >
        <div 
          className="w-32 h-32 mx-auto rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden border-4 border-white dark:border-stone-900 shadow-lg mb-6 cursor-pointer hover:opacity-90 transition-opacity relative group"
          onClick={() => perfil.fotoPerfil && setModalFotoAberta(true)}
        >
          {perfil.fotoPerfil ? (
            <>
              <img 
                src={perfil.fotoPerfil} 
                alt={`Foto de ${perfil.nome}`} 
                className="w-full h-full object-cover"
                style={{ objectPosition: perfil.fotoPerfilPosicao || 'center' }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Ver Foto</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-bold text-5xl">
              {perfil.nome.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">{perfil.nome}</h1>
        
        <div className="flex flex-wrap justify-center gap-6 mt-8 mb-8">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="font-bold text-stone-800 dark:text-stone-100">{perfil.xp}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">XP Total</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 dark:text-orange-400">
              <Flame className="w-6 h-6" />
            </div>
            <span className="font-bold text-stone-800 dark:text-stone-100">{perfil.sequenciaAtual}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Dias Seguidos</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-bold text-stone-800 dark:text-stone-100">{perfil.totalAmigos}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Amigos</span>
          </div>
        </div>

        <button
          onClick={handleSeguirAlternar}
          disabled={processandoAcao}
          className={`w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
            perfil.isAmigo 
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700' 
              : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30'
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {processandoAcao ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : perfil.isAmigo ? (
            <>
              <UserMinus className="w-6 h-6" />
              <span>Deixar de seguir</span>
            </>
          ) : (
            <>
              <UserPlus className="w-6 h-6" />
              <span>Seguir {perfil.nome.split(' ')[0]}</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Modal para visualizar foto */}
      {modalFotoAberta && perfil?.fotoPerfil && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full flex justify-center">
            <button 
              onClick={() => setModalFotoAberta(false)} 
              className="absolute -top-12 right-0 text-white hover:text-stone-300 transition-colors bg-white/10 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={perfil.fotoPerfil} 
              alt={`Foto de ${perfil.nome}`} 
              className="w-full max-w-md h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
