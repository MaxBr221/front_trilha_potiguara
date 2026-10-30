'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  HelpCircle,
  Play,
  CheckSquare,
  Square,
  Sliders,
  AlertCircle,
  Loader2,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Flame,
  Check
} from 'lucide-react';
import { servicoArena, TrilhaArenaDTO, CriarArenaResponseDTO } from '@/services/servicoArena';
import { ArenaBatalhaIcon, CocarIcon } from '@/components/icons/IndigenousIcons';
import Link from 'next/link';

export default function CriarArenaPage() {
  const router = useRouter();

  // Estados de dados
  const [trilhas, setTrilhas] = useState<TrilhaArenaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados de seleção
  const [modulosSelecionados, setModulosSelecionados] = useState<Set<string>>(new Set());
  const [limiteQuestoesModo, setLimiteQuestoesModo] = useState<'todas' | '10' | '15' | '20' | 'custom'>('todas');
  const [questoesCustom, setQuestoesCustom] = useState<number>(10);
  const [tempoPorPergunta, setTempoPorPergunta] = useState<number>(20); // 20s padrão
  const [tituloSala, setTituloSala] = useState<string>('');
  const [criandoSala, setCriandoSala] = useState(false);

  // Carregar módulos disponíveis
  const carregarModulos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await servicoArena.obterModulosDisponiveis();
      setTrilhas(dados);

      // Pré-seleciona os módulos da primeira trilha por conveniência
      if (dados.length > 0 && dados[0].modulos.length > 0) {
        const primeiroModuloId = dados[0].modulos[0].id;
        setModulosSelecionados(new Set([primeiroModuloId]));
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar módulos da arena:', err);
      setErro('Não foi possível carregar os módulos disponíveis. Verifique sua conexão e tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarModulos();
  }, []);

  // Cálculo total de questões disponíveis nos módulos marcados
  const totalQuestoesDisponiveis = useMemo(() => {
    let total = 0;
    trilhas.forEach((trilha) => {
      trilha.modulos.forEach((modulo) => {
        if (modulosSelecionados.has(modulo.id)) {
          total += modulo.totalQuestoes || 0;
        }
      });
    });
    return total;
  }, [trilhas, modulosSelecionados]);

  // Quantidade final de questões configurada
  const quantidadeQuestoesFinal = useMemo(() => {
    if (limiteQuestoesModo === 'todas') {
      return totalQuestoesDisponiveis;
    }
    const valorAlvo =
      limiteQuestoesModo === '10'
        ? 10
        : limiteQuestoesModo === '15'
        ? 15
        : limiteQuestoesModo === '20'
        ? 20
        : questoesCustom;

    return Math.min(valorAlvo, totalQuestoesDisponiveis);
  }, [limiteQuestoesModo, questoesCustom, totalQuestoesDisponiveis]);

  // Tempo estimado da partida em minutos
  const tempoEstimadoMinutos = useMemo(() => {
    if (quantidadeQuestoesFinal === 0) return 0;
    // Cada questão: tempo de resposta + ~12s para transição e leitura da explicação/placar
    const segundosPorRodada = tempoPorPergunta + 12;
    const segundosTotais = quantidadeQuestoesFinal * segundosPorRodada;
    return Math.max(1, Math.ceil(segundosTotais / 60));
  }, [quantidadeQuestoesFinal, tempoPorPergunta]);

  // Alternar seleção de um módulo
  const toggleModulo = (moduloId: string) => {
    setModulosSelecionados((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(moduloId)) {
        proximo.delete(moduloId);
      } else {
        proximo.add(moduloId);
      }
      return proximo;
    });
  };

  // Alternar todos os módulos de uma trilha
  const toggleTrilha = (trilha: TrilhaArenaDTO) => {
    const todosIds = trilha.modulos.map((m) => m.id);
    const todosJaMarcados = todosIds.every((id) => modulosSelecionados.has(id));

    setModulosSelecionados((prev) => {
      const proximo = new Set(prev);
      if (todosJaMarcados) {
        todosIds.forEach((id) => proximo.delete(id));
      } else {
        todosIds.forEach((id) => proximo.add(id));
      }
      return proximo;
    });
  };

  // Submissão: Criar Sala
  const handleCriarSala = async () => {
    if (modulosSelecionados.size === 0) return;
    try {
      setCriandoSala(true);
      setErro(null);

      const dadosEnvio = {
        moduloIds: Array.from(modulosSelecionados),
        quantidadeQuestoes: limiteQuestoesModo === 'todas' ? undefined : quantidadeQuestoesFinal,
        tempoPorPergunta: tempoPorPergunta,
        titulo: tituloSala.trim() || undefined,
      };

      const resposta: CriarArenaResponseDTO = await servicoArena.criarSala(dadosEnvio);

      // Redireciona diretamente para a tela de Host (Projetor/Telão)
      router.push(`/arena/host/${resposta.codigoPin}`);
    } catch (err: unknown) {
      console.error('Erro ao criar sala:', err);
      setErro('Ocorreu um erro ao criar a sala da Arena. Tente novamente.');
      setCriandoSala(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Dashboard
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              <Sparkles className="w-3 h-3" /> Sala de Aula Ao Vivo
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-3">
            <span className="p-2 bg-emerald-600 text-white rounded-2xl shadow-md">
              <ArenaBatalhaIcon className="w-6 h-6" />
            </span>
            Criar Sala da Tupi Arena
          </h1>
          <p className="text-sm md:text-base text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Projete na lousa e desafie os alunos com uma batalha de conhecimentos indígenas em tempo real.
          </p>
        </div>

        {/* Card Dinâmico no Topo (Desktop / Mobile Sticky) */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-4 rounded-2xl shadow-lg border border-emerald-700/50 flex items-center justify-around sm:justify-center gap-4 sm:gap-6 w-full md:w-auto shrink-0">
          <div className="text-center px-2">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block">Questões</span>
            <span className="text-2xl md:text-3xl font-black text-amber-300">
              {quantidadeQuestoesFinal}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-emerald-700/80" />
          <div className="text-center px-2">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block">Duração Est.</span>
            <span className="text-2xl md:text-3xl font-black text-white flex items-center justify-center gap-1">
              ~{tempoEstimadoMinutos} <span className="text-xs font-normal text-emerald-300">min</span>
            </span>
          </div>
        </div>
      </div>

      {erro && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{erro}</span>
          <button
            onClick={carregarModulos}
            className="ml-auto text-xs underline font-bold hover:text-rose-800 dark:hover:text-rose-200"
          >
            Tentar recarregar
          </button>
        </div>
      )}

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-sm text-stone-500 font-medium">Carregando conteúdos da aldeia...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Coluna 1 & 2: Seleção de Conteúdos por Trilha */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  1. Escolha os Módulos da Batalha
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Selecione um ou mais módulos para compor as perguntas da partida
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg">
                {modulosSelecionados.size} {modulosSelecionados.size === 1 ? 'módulo selecionado' : 'módulos selecionados'}
              </span>
            </div>

            {trilhas.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                <p className="text-stone-500 text-sm">Nenhum módulo disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trilhas.map((trilha) => {
                  const todosMarcados =
                    trilha.modulos.length > 0 &&
                    trilha.modulos.every((m) => modulosSelecionados.has(m.id));
                  const algunsMarcados =
                    trilha.modulos.some((m) => modulosSelecionados.has(m.id)) && !todosMarcados;

                  return (
                    <div
                      key={trilha.id}
                      className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm transition-all"
                    >
                      {/* Topo da Trilha */}
                      <div className="p-4 md:p-5 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{trilha.icon || '🏹'}</span>
                          <div>
                            <h3 className="font-extrabold text-stone-800 dark:text-stone-100 text-base md:text-lg">
                              {trilha.nome}
                            </h3>
                            <span className="text-xs text-stone-500 dark:text-stone-400">
                              {trilha.modulos.length} módulos disponíveis
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleTrilha(trilha)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                            todosMarcados
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                          }`}
                        >
                          {todosMarcados ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Todos selecionados
                            </>
                          ) : algunsMarcados ? (
                            'Selecionar todos'
                          ) : (
                            'Selecionar trilha'
                          )}
                        </button>
                      </div>

                      {/* Lista de Módulos */}
                      <div className="p-4 md:p-5 divide-y divide-stone-100 dark:divide-stone-800/60">
                        {trilha.modulos.map((modulo) => {
                          const selecionado = modulosSelecionados.has(modulo.id);

                          return (
                            <div
                              key={modulo.id}
                              onClick={() => toggleModulo(modulo.id)}
                              className={`py-3.5 px-3 rounded-2xl flex items-start gap-3.5 cursor-pointer transition-all duration-150 ${
                                selecionado
                                  ? 'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100'
                                  : 'hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                                {selecionado ? (
                                  <CheckSquare className="w-5 h-5 fill-emerald-600 text-white dark:text-stone-900" />
                                ) : (
                                  <Square className="w-5 h-5 text-stone-400" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-bold text-sm md:text-base text-stone-800 dark:text-stone-100">
                                    {modulo.titulo}
                                  </h4>
                                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                                    {modulo.totalQuestoes} {modulo.totalQuestoes === 1 ? 'questão' : 'questões'}
                                  </span>
                                </div>
                                {modulo.descricao && (
                                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">
                                    {modulo.descricao}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna 3: Painel de Configurações da Sala */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-md space-y-6 sticky top-20">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <Sliders className="w-5 h-5 text-emerald-600" />
                2. Configurar Partida
              </h2>

              {/* Título opcional da Sala */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Nome da Sessão (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Revisão 6º Ano - Vocabulário"
                  value={tituloSala}
                  onChange={(e) => setTituloSala(e.target.value)}
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-stone-400"
                />
              </div>

              {/* Quantidade de Questões */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Quantidade de Perguntas
                  </label>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {quantidadeQuestoesFinal} de {totalQuestoesDisponiveis}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setLimiteQuestoesModo('todas')}
                    className={`py-2 px-1 text-xs font-extrabold rounded-xl border transition-all ${
                      limiteQuestoesModo === 'todas'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Todas
                  </button>

                  <button
                    type="button"
                    disabled={totalQuestoesDisponiveis < 10}
                    onClick={() => setLimiteQuestoesModo('10')}
                    className={`py-2 px-1 text-xs font-extrabold rounded-xl border transition-all ${
                      limiteQuestoesModo === '10'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    } ${totalQuestoesDisponiveis < 10 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    10
                  </button>

                  <button
                    type="button"
                    disabled={totalQuestoesDisponiveis < 15}
                    onClick={() => setLimiteQuestoesModo('15')}
                    className={`py-2 px-1 text-xs font-extrabold rounded-xl border transition-all ${
                      limiteQuestoesModo === '15'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    } ${totalQuestoesDisponiveis < 15 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    15
                  </button>

                  <button
                    type="button"
                    disabled={totalQuestoesDisponiveis < 20}
                    onClick={() => setLimiteQuestoesModo('20')}
                    className={`py-2 px-1 text-xs font-extrabold rounded-xl border transition-all ${
                      limiteQuestoesModo === '20'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    } ${totalQuestoesDisponiveis < 20 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    20
                  </button>
                </div>
              </div>

              {/* Tempo por Pergunta */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    Tempo por Pergunta
                  </label>
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                    {tempoPorPergunta} segundos
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[15, 20, 30].map((segundos) => (
                    <button
                      key={segundos}
                      type="button"
                      onClick={() => setTempoPorPergunta(segundos)}
                      className={`py-2 px-2 text-xs font-extrabold rounded-xl border transition-all ${
                        tempoPorPergunta === segundos
                          ? 'bg-amber-500 text-stone-900 border-amber-600 font-black shadow-sm'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {segundos}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo da Partida */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Módulos selecionados:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{modulosSelecionados.size}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Perguntas na rodada:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{quantidadeQuestoesFinal}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Ritmo estimado:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">~{tempoEstimadoMinutos} minutos</span>
                </div>
              </div>

              {/* Botão de Criação */}
              <button
                type="button"
                disabled={modulosSelecionados.size === 0 || quantidadeQuestoesFinal === 0 || criandoSala}
                onClick={handleCriarSala}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-extrabold text-base shadow-lg shadow-emerald-700/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transition-all border-b-4 border-emerald-800"
              >
                {criandoSala ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando Arena...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Criar Sala da Arena
                  </>
                )}
              </button>

              {modulosSelecionados.size === 0 && (
                <p className="text-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Selecione ao menos 1 módulo acima para criar a sala.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

