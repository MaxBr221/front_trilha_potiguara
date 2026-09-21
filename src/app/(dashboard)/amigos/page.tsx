'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Loader2, Trophy, Flame } from 'lucide-react';
import { servicoUsuario } from '@/services/servicoUsuario';
import { Amigo, Usuario } from '@/types/autenticacao';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';

export default function AmigosPage() {
  const [ranking, setRanking] = useState<Amigo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const { usuario } = useAutenticacao();

  useEffect(() => {
    const carregarRanking = async () => {
      try {
        setCarregando(true);
        setErro(null);
        
        const amigosList = await servicoUsuario.listarAmigos();
        
        let perfilAtual = usuario;
        if (!perfilAtual) {
          perfilAtual = await servicoUsuario.obterPerfil();
        }

        // Criar objeto do tipo Amigo a partir do Usuario atual
        const euComoAmigo: Amigo = {
          id: String(perfilAtual.id),
          nome: perfilAtual.nome,
          xp: perfilAtual.xp,
          sequenciaAtual: perfilAtual.sequenciaAtual,
          fotoPerfil: perfilAtual.fotoPerfil
        };

        // Mesclar e remover duplicatas caso o back-end já retorne o próprio usuário
        const todos = [...amigosList];
        if (!todos.find(a => String(a.id) === String(euComoAmigo.id))) {
          todos.push(euComoAmigo);
        }

        // Ordenar pelo XP em ordem decrescente
        todos.sort((a, b) => b.xp - a.xp);
        
        setRanking(todos);
      } catch (err) {
        console.error('Erro ao carregar ranking:', err);
        setErro('Não foi possível carregar o ranking de amigos no momento.');
      } finally {
        setCarregando(false);
      }
    };

    carregarRanking();
  }, [usuario]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Ranking de Amigos</h1>
          <p className="text-stone-500">Veja quem está dominando o Tupi Digital</p>
        </div>
      </div>

      {erro && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {erro}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-stone-50 border-b border-stone-200 text-sm font-semibold text-stone-500 flex justify-between px-6">
          <span>Posição / Amigo</span>
          <span>Pontuação</span>
        </div>
        <ul className="divide-y divide-stone-100">
          {ranking.map((amigo, index) => {
            const isMe = String(amigo.id) === String(usuario?.id);
            const posicao = index + 1;
            
            // Estilos para os top 3
            let medalColor = 'text-stone-400 font-bold';
            let bgStyle = 'bg-white';
            
            if (posicao === 1) medalColor = 'text-yellow-500 font-black text-xl';
            else if (posicao === 2) medalColor = 'text-stone-400 font-bold text-lg';
            else if (posicao === 3) medalColor = 'text-amber-600 font-bold text-lg';

            if (isMe) bgStyle = 'bg-primary/5';

            return (
              <motion.li 
                key={amigo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  href={`/perfil/${amigo.id}`}
                  className={`flex items-center justify-between p-4 px-6 hover:bg-stone-50 transition-colors cursor-pointer ${bgStyle}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-6 text-center ${medalColor}`}>
                      {posicao}
                    </span>
                    
                    <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                      {amigo.fotoPerfil ? (
                        <img 
                          src={amigo.fotoPerfil} 
                          alt={`Foto de ${amigo.nome}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                          {amigo.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className={`font-bold text-stone-800 ${isMe ? 'text-primary' : ''}`}>
                        {amigo.nome} {isMe && '(Você)'}
                      </h3>
                      {amigo.sequenciaAtual > 0 && (
                        <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                          <Flame className="w-4 h-4" />
                          <span>{amigo.sequenciaAtual} dias</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="font-bold text-stone-700">
                    {amigo.xp} XP
                  </div>
                </Link>
              </motion.li>
            );
          })}
          
          {ranking.length === 0 && !erro && (
            <div className="p-8 text-center text-stone-500">
              <Users className="w-12 h-12 mx-auto text-stone-300 mb-4" />
              <p>Você ainda não tem amigos e seu perfil não pôde ser carregado.</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
