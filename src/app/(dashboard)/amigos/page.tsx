'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Loader2, Trophy, Flame, Search, Bell, UserPlus } from 'lucide-react';
import { servicoUsuario } from '@/services/servicoUsuario';
import { Amigo } from '@/types/autenticacao';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';

type Aba = 'ranking' | 'busca' | 'notificacoes';

export default function AmigosPage() {
  const [abaAtual, setAbaAtual] = useState<Aba>('ranking');
  
  // Estado Aba Ranking
  const [ranking, setRanking] = useState<Amigo[]>([]);
  const [carregandoRanking, setCarregandoRanking] = useState(true);
  
  // Estado Aba Busca
  const [busca, setBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<Amigo[]>([]);
  const [buscando, setBuscando] = useState(false);
  
  const [erro, setErro] = useState<string | null>(null);
  
  // Estado Aba Notificações (Mock, pois o backend não suporta notificações ainda)
  const [notificacoesMock] = useState([
    { id: '1', nome: 'João Pedro', texto: 'começou a seguir você.', lida: false, tempo: '2 horas atrás' },
    { id: '2', nome: 'Maria Clara', texto: 'começou a seguir você.', lida: true, tempo: '1 dia atrás' },
    { id: '3', nome: 'Ana', texto: 'começou a seguir você.', lida: true, tempo: '3 dias atrás' }
  ]);
  const { usuario } = useAutenticacao();

  // Carregar Ranking
  useEffect(() => {
    if (abaAtual !== 'ranking') return;
    
    const carregarRanking = async () => {
      try {
        setCarregandoRanking(true);
        setErro(null);
        
        const amigosList = await servicoUsuario.listarAmigos();
        
        let perfilAtual = usuario;
        if (!perfilAtual) {
          perfilAtual = await servicoUsuario.obterPerfil();
        }

        const euComoAmigo: Amigo = {
          id: String(perfilAtual.id),
          nome: perfilAtual.nome,
          xp: perfilAtual.xp,
          sequenciaAtual: perfilAtual.sequenciaAtual,
          fotoPerfil: perfilAtual.fotoPerfil
        };

        const todos = [...amigosList];
        if (!todos.find(a => String(a.id) === String(euComoAmigo.id))) {
          todos.push(euComoAmigo);
        }

        todos.sort((a, b) => b.xp - a.xp);
        setRanking(todos);
      } catch (err) {
        console.error('Erro ao carregar ranking:', err);
        setErro('Não foi possível carregar o ranking de amigos no momento.');
      } finally {
        setCarregandoRanking(false);
      }
    };

    carregarRanking();
  }, [abaAtual, usuario]);

  // Carregar Busca (com debounce simples ou acionado pelo form)
  useEffect(() => {
    if (abaAtual !== 'busca') return;
    
    const realizarBusca = async () => {
      try {
        setBuscando(true);
        setErro(null);
        const resultados = await servicoUsuario.buscarUsuarios(busca.trim() || undefined);
        setResultadosBusca(resultados);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setErro('Ocorreu um erro ao buscar usuários.');
      } finally {
        setBuscando(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      realizarBusca();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [busca, abaAtual]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Ranking de Amigos</h1>
          <p className="text-stone-500">Veja quem está dominando o Tupi Digital</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-stone-200/50 rounded-2xl w-full mb-6">
        <button
          onClick={() => setAbaAtual('ranking')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            abaAtual === 'ranking' 
              ? 'bg-white text-stone-800 shadow-sm' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Trophy className="w-4 h-4 hidden sm:block" />
          Meu Ranking
        </button>
        <button
          onClick={() => setAbaAtual('busca')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            abaAtual === 'busca' 
              ? 'bg-white text-stone-800 shadow-sm' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Search className="w-4 h-4 hidden sm:block" />
          Procurar Pessoas
        </button>
        <button
          onClick={() => setAbaAtual('notificacoes')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative ${
            abaAtual === 'notificacoes' 
              ? 'bg-white text-stone-800 shadow-sm' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Bell className="w-4 h-4 hidden sm:block" />
          <span>Notificações</span>
          {notificacoesMock.some(n => !n.lida) && (
            <span className="absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {erro && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {erro}
        </div>
      )}

      {/* Aba: Meu Ranking */}
      {abaAtual === 'ranking' && (
        carregandoRanking ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 bg-stone-50 border-b border-stone-200 text-sm font-semibold text-stone-500 flex justify-between px-6">
              <span>Posição / Amigo</span>
              <span>Pontuação</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {ranking.map((amigo, index) => {
                const isMe = String(amigo.id) === String(usuario?.id);
                const posicao = index + 1;
                
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
            </ul>
          </div>
        )
      )}

      {/* Aba: Procurar Pessoas */}
      {abaAtual === 'busca' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-medium"
            />
          </div>

          {buscando && resultadosBusca.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-stone-50 border-b border-stone-200 text-sm font-semibold text-stone-500 px-6">
                {busca.trim() ? 'Resultados da busca' : 'Sugestões de amigos'}
              </div>
              <ul className="divide-y divide-stone-100">
                {resultadosBusca.map((amigo, index) => {
                  const isMe = String(amigo.id) === String(usuario?.id);
                  if (isMe && !busca.trim()) return null; // Não sugerir a si mesmo se não buscou nome exato

                  return (
                    <motion.li 
                      key={amigo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link 
                        href={`/perfil/${amigo.id}`}
                        className="flex items-center justify-between p-4 px-6 hover:bg-stone-50 transition-colors cursor-pointer bg-white"
                      >
                        <div className="flex items-center gap-4">
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
                            <h3 className="font-bold text-stone-800">
                              {amigo.nome} {isMe && '(Você)'}
                            </h3>
                            <div className="text-stone-500 text-sm font-medium">
                              {amigo.xp} XP globais
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-sm transition-colors">
                          Ver Perfil
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}

                {resultadosBusca.length === 0 && !buscando && !erro && (
                  <div className="p-8 text-center text-stone-500">
                    <Users className="w-12 h-12 mx-auto text-stone-300 mb-4" />
                    <p>Nenhum usuário encontrado com esse nome.</p>
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Aba: Notificações */}
      {abaAtual === 'notificacoes' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-sm font-semibold text-stone-500 flex justify-between px-6">
            <span>Avisos Recentes (Demonstração)</span>
          </div>
          <ul className="divide-y divide-stone-100">
            {notificacoesMock.map((notificacao) => (
              <li 
                key={notificacao.id}
                className={`p-4 px-6 transition-colors flex items-center justify-between ${
                  notificacao.lida ? 'bg-white hover:bg-stone-50' : 'bg-primary/5 hover:bg-primary/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-stone-800">
                      <span className="font-bold">{notificacao.nome}</span> {notificacao.texto}
                    </p>
                    <p className="text-sm text-stone-500 mt-1">{notificacao.tempo}</p>
                  </div>
                </div>
                {!notificacao.lida && (
                  <div className="w-3 h-3 bg-primary rounded-full" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
