'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Loader2, Trophy, Flame, Search, Bell, UserPlus } from 'lucide-react';
import { servicoUsuario } from '@/services/servicoUsuario';
import { api } from '@/services/api';
import { Amigo } from '@/types/autenticacao';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';

type Aba = 'ranking' | 'busca' | 'notificacoes';

interface NotificacaoDTO {
  id: string;
  remetente: {
    nome: string;
    fotoPerfil: string | null;
    fotoPerfilPosicao?: string;
  };
  tipo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
}

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
  const [seguidos, setSeguidos] = useState<Set<string>>(new Set());
  
  // Estado Aba Notificações
  const [notificacoes, setNotificacoes] = useState<NotificacaoDTO[]>([]);
  const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(false);
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

        // Pre-popular lista de seguidos
        const idsSeguidos = new Set(amigosList.map(a => String(a.id)));
        idsSeguidos.delete(String(perfilAtual.id));
        setSeguidos(idsSeguidos);

        const euComoAmigo: Amigo = {
          id: String(perfilAtual.id),
          nome: perfilAtual.nome,
          xp: perfilAtual.xp,
          sequenciaAtual: perfilAtual.sequenciaAtual,
          fotoPerfil: perfilAtual.fotoPerfil,
          fotoPerfilPosicao: perfilAtual.fotoPerfilPosicao
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

  // Carregar Notificações
  useEffect(() => {
    if (abaAtual !== 'notificacoes') return;
    
    const carregarNotificacoes = async () => {
      try {
        setCarregandoNotificacoes(true);
        const response = await api.get<NotificacaoDTO[]>('/usuarios/notificacoes');
        setNotificacoes(response.data);
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
      } finally {
        setCarregandoNotificacoes(false);
      }
    };

    carregarNotificacoes();
  }, [abaAtual]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Ranking de Amigos</h1>
          <p className="text-stone-500 dark:text-stone-400">Veja quem está dominando o Tupi Digital</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-stone-200/50 dark:bg-stone-800/50 rounded-2xl w-full mb-6">
        <button
          onClick={() => setAbaAtual('ranking')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            abaAtual === 'ranking' 
              ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-white shadow-sm' 
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Trophy className="w-4 h-4 hidden sm:block" />
          Meu Ranking
        </button>
        <button
          onClick={() => setAbaAtual('busca')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            abaAtual === 'busca' 
              ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-white shadow-sm' 
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Search className="w-4 h-4 hidden sm:block" />
          Procurar Pessoas
        </button>
        <button
          onClick={() => setAbaAtual('notificacoes')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative ${
            abaAtual === 'notificacoes' 
              ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-white shadow-sm' 
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Bell className="w-4 h-4 hidden sm:block" />
          <span>Notificações</span>
          {notificacoes.some(n => !n.lida) && (
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
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 text-sm font-semibold text-stone-500 dark:text-stone-400 flex justify-between px-6">
              <span>Posição / Amigo</span>
              <span>Pontuação</span>
            </div>
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {ranking.map((amigo, index) => {
                const isMe = String(amigo.id) === String(usuario?.id);
                const posicao = index + 1;
                
                let medalColor = 'text-stone-400 font-bold';
                let bgStyle = 'bg-white dark:bg-stone-900';
                
                if (posicao === 1) medalColor = 'text-yellow-500 font-black text-xl';
                else if (posicao === 2) medalColor = 'text-stone-400 font-bold text-lg';
                else if (posicao === 3) medalColor = 'text-amber-600 font-bold text-lg';

                if (isMe) bgStyle = 'bg-primary/5 dark:bg-primary/10';

                return (
                  <motion.li 
                    key={amigo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link 
                      href={`/perfil/${amigo.id}`}
                      className={`flex items-center justify-between p-4 px-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer ${bgStyle}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-6 text-center ${medalColor}`}>
                          {posicao}
                        </span>
                        
                        <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden flex-shrink-0 border-2 border-white dark:border-stone-900 shadow-sm">
                          {amigo.fotoPerfil ? (
                            <img 
                              src={amigo.fotoPerfil} 
                              alt={`Foto de ${amigo.nome}`} 
                              className="w-full h-full object-cover"
                              style={{ objectPosition: amigo.fotoPerfilPosicao || 'center' }}
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                              {amigo.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className={`font-bold text-stone-800 dark:text-stone-100 ${isMe ? 'text-primary dark:text-primary-400' : ''}`}>
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
                      
                      <div className="font-bold text-stone-700 dark:text-stone-300">
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-medium"
            />
          </div>

          {buscando && resultadosBusca.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
              <div className="p-4 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 text-sm font-semibold text-stone-500 dark:text-stone-400 px-6">
                {busca.trim() ? 'Resultados da busca' : 'Sugestões de amigos'}
              </div>
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {resultadosBusca.map((amigo, index) => {
                  const isMe = String(amigo.id) === String(usuario?.id);
                  if (isMe && !busca.trim()) return null;

                  return (
                    <motion.li 
                      key={amigo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors bg-white dark:bg-stone-900 gap-4 sm:gap-0">
                        <Link href={`/perfil/${amigo.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden flex-shrink-0 border-2 border-white dark:border-stone-900 shadow-sm">
                            {amigo.fotoPerfil ? (
                              <img 
                                src={amigo.fotoPerfil} 
                                alt={`Foto de ${amigo.nome}`} 
                                className="w-full h-full object-cover"
                                style={{ objectPosition: amigo.fotoPerfilPosicao || 'center' }}
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                {amigo.nome.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <h3 className="font-bold text-stone-800 dark:text-stone-100 truncate">
                              {amigo.nome} {isMe && '(Você)'}
                            </h3>
                            <div className="text-stone-500 dark:text-stone-400 text-sm font-medium">
                              {amigo.xp} XP globais
                            </div>
                          </div>
                        </Link>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          {!isMe && (
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                const btn = e.currentTarget;
                                const jaSeguindo = seguidos.has(String(amigo.id));
                                try {
                                  btn.disabled = true;
                                  if (jaSeguindo) {
                                    await servicoUsuario.deixarDeSeguirUsuario(String(amigo.id));
                                    setSeguidos(prev => { const next = new Set(prev); next.delete(String(amigo.id)); return next; });
                                  } else {
                                    await servicoUsuario.seguirUsuario(String(amigo.id));
                                    setSeguidos(prev => new Set(prev).add(String(amigo.id)));
                                  }
                                } catch (err) {
                                  console.error('Erro ao seguir/deixar de seguir:', err);
                                } finally {
                                  btn.disabled = false;
                                }
                              }}
                              className={`flex-1 sm:flex-none px-4 py-2 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 ${
                                seguidos.has(String(amigo.id))
                                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                  : 'bg-primary text-white hover:bg-primary/90'
                              }`}
                            >
                              <UserPlus className="w-4 h-4" />
                              {seguidos.has(String(amigo.id)) ? 'Seguindo' : 'Seguir'}
                            </button>
                          )}
                          <Link
                            href={`/perfil/${amigo.id}`}
                            className="flex-1 sm:flex-none text-center px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-sm transition-colors"
                          >
                            Ver Perfil
                          </Link>
                        </div>
                      </div>
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
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 text-sm font-semibold text-stone-500 dark:text-stone-400 flex justify-between px-6">
            <span>Notificações</span>
          </div>
          {carregandoNotificacoes ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-8 text-center text-stone-500">Nenhuma notificação no momento.</div>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {notificacoes.map((notificacao) => (
                <li 
                  key={notificacao.id}
                  className={`p-4 px-6 transition-colors flex items-center justify-between ${
                    notificacao.lida ? 'bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/50' : 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0 flex items-center justify-center text-stone-500 dark:text-stone-400 border-2 border-white dark:border-stone-900 shadow-sm">
                      {notificacao.remetente.fotoPerfil ? (
                        <img src={notificacao.remetente.fotoPerfil} alt={`Foto de ${notificacao.remetente.nome}`} className="w-full h-full object-cover" style={{ objectPosition: notificacao.remetente.fotoPerfilPosicao || 'center' }} />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-stone-800 dark:text-stone-200">
                        <span className="font-bold">{notificacao.remetente.nome}</span> {notificacao.mensagem}
                      </p>
                      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                        {new Date(notificacao.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  {!notificacao.lida && (
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" title="Não lida" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
