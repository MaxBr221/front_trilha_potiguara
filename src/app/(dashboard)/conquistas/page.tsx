'use client';

import { useEffect, useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Lock,
  Loader2,
  Target,
  CheckCircle2,
  Award,
  Sparkles,
  Flame,
  Search,
  X,
  Info,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Calendar
} from 'lucide-react';
import Confetti from 'react-confetti';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import { servicoDashboard, DashboardData } from '@/services/servicoDashboard';
import {
  enriquecerConquistas,
  ConquistaEnriquecida
} from '@/utils/conquistasCatalogo';
import {
  FogueiraIcon,
  MachadoIcon,
  PenaIcon,
  CocarIcon,
  OcaIcon,
  ArcoFlechaIcon,
  TriboIcon,
  GuerreiroIcon,
  MaracaIcon
} from '@/components/icons/IndigenousIcons';

type TabStatus = 'todas' | 'desbloqueadas' | 'bloqueadas';
type CategoriaFiltro = 'todas' | 'xp' | 'ofensiva' | 'licoes' | 'maestria';

// Mapeamento explícito de ícones indígenas
const indigenousIconsMap: Record<string, React.ElementType> = {
  FogueiraIcon,
  MachadoIcon,
  PenaIcon,
  CocarIcon,
  OcaIcon,
  ArcoFlechaIcon,
  TriboIcon,
  GuerreiroIcon,
  MaracaIcon
};

// Paleta consistente com Tailwind CSS para evitar classes dinâmicas quebradas
const COLOR_MAP: Record<
  string,
  {
    bgIcon: string;
    textIcon: string;
    borderGlow: string;
    badgeBg: string;
    badgeText: string;
    barColor: string;
  }
> = {
  emerald: {
    bgIcon: 'bg-emerald-100 dark:bg-emerald-950/60',
    textIcon: 'text-emerald-600 dark:text-emerald-400',
    borderGlow: 'hover:border-emerald-400 dark:hover:border-emerald-600 border-emerald-200 dark:border-emerald-800/80',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    barColor: 'bg-emerald-500'
  },
  amber: {
    bgIcon: 'bg-amber-100 dark:bg-amber-950/60',
    textIcon: 'text-amber-600 dark:text-amber-400',
    borderGlow: 'hover:border-amber-400 dark:hover:border-amber-600 border-amber-200 dark:border-amber-800/80',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    barColor: 'bg-amber-500'
  },
  blue: {
    bgIcon: 'bg-blue-100 dark:bg-blue-950/60',
    textIcon: 'text-blue-600 dark:text-blue-400',
    borderGlow: 'hover:border-blue-400 dark:hover:border-blue-600 border-blue-200 dark:border-blue-800/80',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    barColor: 'bg-blue-500'
  },
  purple: {
    bgIcon: 'bg-purple-100 dark:bg-purple-950/60',
    textIcon: 'text-purple-600 dark:text-purple-400',
    borderGlow: 'hover:border-purple-400 dark:hover:border-purple-600 border-purple-200 dark:border-purple-800/80',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    barColor: 'bg-purple-500'
  },
  orange: {
    bgIcon: 'bg-orange-100 dark:bg-orange-950/60',
    textIcon: 'text-orange-600 dark:text-orange-400',
    borderGlow: 'hover:border-orange-400 dark:hover:border-orange-600 border-orange-200 dark:border-orange-800/80',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    barColor: 'bg-orange-500'
  },
  indigo: {
    bgIcon: 'bg-indigo-100 dark:bg-indigo-950/60',
    textIcon: 'text-indigo-600 dark:text-indigo-400',
    borderGlow: 'hover:border-indigo-400 dark:hover:border-indigo-600 border-indigo-200 dark:border-indigo-800/80',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    barColor: 'bg-indigo-500'
  },
  rose: {
    bgIcon: 'bg-rose-100 dark:bg-rose-950/60',
    textIcon: 'text-rose-600 dark:text-rose-400',
    borderGlow: 'hover:border-rose-400 dark:hover:border-rose-600 border-rose-200 dark:border-rose-800/80',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    barColor: 'bg-rose-500'
  },
  teal: {
    bgIcon: 'bg-teal-100 dark:bg-teal-950/60',
    textIcon: 'text-teal-600 dark:text-teal-400',
    borderGlow: 'hover:border-teal-400 dark:hover:border-teal-600 border-teal-200 dark:border-teal-800/80',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-300',
    barColor: 'bg-teal-500'
  }
};

const RARIDADE_STYLE: Record<
  string,
  { label: string; badge: string; border: string; glow: string }
> = {
  Lendária: {
    label: 'Lendária',
    badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm',
    border: 'border-amber-400/80 dark:border-amber-500/80 shadow-amber-500/10',
    glow: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  Épica: {
    label: 'Épica',
    badge: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm',
    border: 'border-purple-300 dark:border-purple-700 shadow-purple-500/10',
    glow: 'from-purple-500/15 via-indigo-500/10 to-transparent'
  },
  Rara: {
    label: 'Rara',
    badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800 shadow-blue-500/5',
    glow: 'from-blue-500/10 via-transparent to-transparent'
  },
  Comum: {
    label: 'Comum',
    badge: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300',
    border: 'border-stone-200 dark:border-stone-800',
    glow: 'from-stone-500/5 via-transparent to-transparent'
  }
};

export default function ConquistasPage() {
  const { usuario } = useAutenticacao();
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<TabStatus>('todas');
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaFiltro>('todas');
  const [busca, setBusca] = useState('');
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [conquistaModal, setConquistaModal] = useState<ConquistaEnriquecida | null>(null);
  const [dimensoes, setDimensoes] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensoes({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const fetchDados = async () => {
      try {
        const data = await servicoDashboard.obterDadosDashboard();
        setDados(data);

        // Confete inteligente: celebra caso tenha conquistas desbloqueadas
        const temDesbloqueada = data.conquistas.some((c) => c.desbloqueada);
        if (temDesbloqueada && !sessionStorage.getItem('confeteMostradoNestaSessao')) {
          setMostrarConfete(true);
          sessionStorage.setItem('confeteMostradoNestaSessao', 'true');
          setTimeout(() => setMostrarConfete(false), 4500);
        }
      } catch (error) {
        console.error('Erro ao buscar conquistas', error);
      } finally {
        setCarregando(false);
      }
    };

    fetchDados();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Métricas combinadas (API + Usuário autenticado)
  const metricas = useMemo(() => {
    return {
      xp: Math.max(dados?.xp ?? 0, usuario?.xp ?? 0),
      diasOfensiva: Math.max(dados?.diasOfensiva ?? 0, usuario?.sequenciaAtual ?? 0),
      licoesConcluidas: dados?.licoesConcluidas ?? 0,
      taxaAcerto: dados?.taxaAcerto ?? 0
    };
  }, [dados, usuario]);

  // Lista enriquecida de conquistas (sempre completas e realistas, sem misteriosas vazias)
  const conquistas = useMemo(() => {
    return enriquecerConquistas(dados?.conquistas, metricas);
  }, [dados?.conquistas, metricas]);

  const desbloqueadas = useMemo(() => conquistas.filter((c) => c.desbloqueada), [conquistas]);
  const bloqueadas = useMemo(() => conquistas.filter((c) => !c.desbloqueada), [conquistas]);

  // Filtragem combinada por status, categoria e busca textual
  const conquistasExibidas = useMemo(() => {
    return conquistas.filter((c) => {
      // Filtro de status
      if (abaAtiva === 'desbloqueadas' && !c.desbloqueada) return false;
      if (abaAtiva === 'bloqueadas' && c.desbloqueada) return false;

      // Filtro de categoria
      if (categoriaAtiva !== 'todas' && c.categoria !== categoriaAtiva) return false;

      // Filtro de busca
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const matchTitulo = c.titulo.toLowerCase().includes(termo);
        const matchDescricao = c.descricao.toLowerCase().includes(termo);
        const matchRaridade = c.raridade.toLowerCase().includes(termo);
        return matchTitulo || matchDescricao || matchRaridade;
      }

      return true;
    });
  }, [conquistas, abaAtiva, categoriaAtiva, busca]);

  const porcentagemGeral = conquistas.length > 0 
    ? Math.round((desbloqueadas.length / conquistas.length) * 100) 
    : 0;

  const renderIcon = (iconeName: string, className = 'w-7 h-7') => {
    // 1. Verifica se é ícone indígena
    if (indigenousIconsMap[iconeName]) {
      const IndigenousComp = indigenousIconsMap[iconeName];
      return <IndigenousComp className={className} />;
    }

    // 2. Verifica se é URL de imagem
    if (iconeName && (iconeName.startsWith('http://') || iconeName.startsWith('https://') || iconeName.startsWith('/'))) {
      return <img src={iconeName} alt="Ícone de conquista" className={`${className} object-contain`} />;
    }

    // 3. Verifica se é Lucide Icon
    const LucideComp = ((LucideIcons as Record<string, unknown>)[iconeName] as React.ElementType) || LucideIcons.Trophy;
    return <LucideComp className={className} />;
  };

  const getColorTheme = (corBase?: string) => {
    return COLOR_MAP[corBase || 'emerald'] || COLOR_MAP.emerald;
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-stone-500 dark:text-stone-400 font-medium text-sm">Carregando suas conquistas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 max-w-7xl mx-auto">
      {mostrarConfete && (
        <Confetti
          width={dimensoes.width}
          height={dimensoes.height}
          recycle={false}
          numberOfPieces={350}
          gravity={0.18}
        />
      )}

      {/* Hero Banner Gamificado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-emerald-700 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-amber-500/10">
        {/* Grafismos de fundo sutis */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-950/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left flex-1">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <CocarIcon className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-md" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Trilha de Conquistas
                </span>
                <span className="bg-emerald-400/30 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {desbloqueadas.length} / {conquistas.length} Concluídas
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Suas Conquistas</h1>
              <p className="text-white/90 max-w-xl text-sm sm:text-base leading-relaxed">
                Acompanhe suas metas de XP, sequência de ofensiva e progresso nas lições em Tupi. Conquiste cada marco para platinar seu perfil cultural!
              </p>
            </div>
          </div>

          {/* Card de Progresso Geral da Conta */}
          <div className="w-full lg:w-80 bg-stone-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-5 space-y-4 shrink-0 shadow-lg">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-white/90">Progresso Geral</span>
              <span className="text-white font-extrabold text-base">{porcentagemGeral}%</span>
            </div>

            {/* Barra de Progresso com animação */}
            <div className="w-full bg-white/20 rounded-full h-3.5 p-0.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-300 to-emerald-300 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${porcentagemGeral}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/15 text-xs">
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <span className="block text-white/70 text-[11px]">XP Acumulado</span>
                <span className="font-extrabold text-white text-sm">{metricas.xp.toLocaleString('pt-BR')} XP</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <span className="block text-white/70 text-[11px]">Ofensiva Atual</span>
                <span className="font-extrabold text-white text-sm">{metricas.diasOfensiva} dias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Categorias e Pesquisa */}
      <div className="space-y-4">
        {/* Linha superior: Abas de Status e Caixa de Busca */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Abas por Status */}
          <div className="inline-flex p-1.5 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 gap-1 overflow-x-auto hide-scrollbar">
            <button
              id="tab-todas"
              onClick={() => setAbaAtiva('todas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                abaAtiva === 'todas'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Todas</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700">
                {conquistas.length}
              </span>
            </button>

            <button
              id="tab-desbloqueadas"
              onClick={() => setAbaAtiva('desbloqueadas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                abaAtiva === 'desbloqueadas'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Desbloqueadas</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${abaAtiva === 'desbloqueadas' ? 'bg-emerald-700 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}>
                {desbloqueadas.length}
              </span>
            </button>

            <button
              id="tab-bloqueadas"
              onClick={() => setAbaAtiva('bloqueadas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                abaAtiva === 'bloqueadas'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Em Progresso</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${abaAtiva === 'bloqueadas' ? 'bg-amber-700 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}>
                {bloqueadas.length}
              </span>
            </button>
          </div>

          {/* Input de Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="busca-conquista"
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, 2000 XP, lições..."
              className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Linha inferior: Filtros de Categoria (XP, Ofensiva, Lições, etc) */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            Categorias:
          </span>

          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaAtiva === 'todas'
                ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            Todas as Categorias
          </button>

          <button
            onClick={() => setCategoriaAtiva('xp')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaAtiva === 'xp'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Metas de XP (2000 XP, etc.)
          </button>

          <button
            onClick={() => setCategoriaAtiva('ofensiva')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaAtiva === 'ofensiva'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Ofensiva Diária (Dias)
          </button>

          <button
            onClick={() => setCategoriaAtiva('licoes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaAtiva === 'licoes'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Lições & Conhecimento
          </button>

          <button
            onClick={() => setCategoriaAtiva('maestria')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaAtiva === 'maestria'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Maestria & Trilhas
          </button>
        </div>
      </div>

      {/* Grid de Conquistas */}
      {conquistasExibidas.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
          <Award className="w-14 h-14 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-stone-700 dark:text-stone-300 mb-1">
            Nenhuma conquista encontrada
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm max-w-sm mx-auto mb-6">
            Não encontramos conquistas com os filtros ou termo de busca atuais.
          </p>
          <button
            onClick={() => {
              setAbaAtiva('todas');
              setCategoriaAtiva('todas');
              setBusca('');
            }}
            className="px-5 py-2.5 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {conquistasExibidas.map((conquista) => {
            const theme = getColorTheme(conquista.corBase);
            const raridade = RARIDADE_STYLE[conquista.raridade] || RARIDADE_STYLE.Comum;

            // --- Card Desbloqueada ---
            if (conquista.desbloqueada) {
              return (
                <div
                  key={conquista.id}
                  onClick={() => setConquistaModal(conquista)}
                  className={`cursor-pointer group relative bg-white dark:bg-stone-900 rounded-3xl p-6 border-2 ${raridade.border} shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden`}
                >
                  {/* Gradiente sutil no topo do card */}
                  <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${raridade.glow} pointer-events-none`} />

                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${theme.bgIcon} ${theme.textIcon} shadow-sm`}
                    >
                      {renderIcon(conquista.icone, 'w-7 h-7')}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${raridade.badge}`}>
                        {raridade.label}
                      </span>
                    </div>
                  </div>

                  {/* Título e Descrição Reais */}
                  <div className="space-y-1 mb-4 flex-grow relative z-10">
                    <h3 className="font-extrabold text-xl text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {conquista.titulo}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                      {conquista.descricao}
                    </p>
                  </div>

                  {/* Recompensa */}
                  {conquista.recompensa && (
                    <div className="mb-4 relative z-10">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <Sparkles className="w-3 h-3" />
                        {conquista.recompensa}
                      </span>
                    </div>
                  )}

                  {/* Rodapé com data e selo de desbloqueada */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold relative z-10 mt-auto">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Desbloqueada
                    </span>

                    <span className="text-stone-400 dark:text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {conquista.dataDesbloqueio
                        ? new Date(conquista.dataDesbloqueio).toLocaleDateString('pt-BR')
                        : 'Conquistada'}
                    </span>
                  </div>
                </div>
              );
            }

            // --- Card Em Progresso (Bloqueada) ---
            // NUNCA mais oculta com "Misteriosa"! Mostra meta real, progresso exato e números!
            return (
              <div
                key={conquista.id}
                onClick={() => setConquistaModal(conquista)}
                className="cursor-pointer group relative bg-stone-50/80 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-900 rounded-3xl p-6 border-2 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
              >
                {/* Cabeçalho com Ícone e Cadeado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-stone-200/80 dark:bg-stone-800 text-stone-400 dark:text-stone-500 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-stone-200 dark:group-hover:bg-stone-700">
                      {renderIcon(conquista.icone, 'w-7 h-7 opacity-75')}
                    </div>
                    {/* Badge do Cadeado */}
                    <div className="absolute -top-1 -right-1 bg-stone-700 dark:bg-stone-800 text-stone-200 p-1 rounded-full border border-stone-300 dark:border-stone-600 shadow-sm">
                      <Lock className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${raridade.badge}`}>
                      {raridade.label}
                    </span>
                  </div>
                </div>

                {/* Título Real e Descrição Real */}
                <div className="space-y-1 mb-4 flex-grow">
                  <h3 className="font-bold text-xl text-stone-700 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                    {conquista.titulo}
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
                    {conquista.descricao}
                  </p>
                </div>

                {/* Barra de Progresso Realista */}
                <div className="space-y-2 pt-2 mt-auto">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-stone-600 dark:text-stone-300">
                      {conquista.progressoTexto}
                    </span>
                    <span className="text-stone-400 dark:text-stone-500">
                      {conquista.progresso}%
                    </span>
                  </div>

                  <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full ${theme.barColor} transition-all duration-500`}
                      style={{ width: `${Math.max(5, conquista.progresso)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-stone-400" />
                      {conquista.faltamTexto}
                    </span>

                    <span className="text-[11px] font-semibold text-primary dark:text-emerald-400 group-hover:underline">
                      Ver detalhes
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes da Conquista */}
      {conquistaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setConquistaModal(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-md ${
                  conquistaModal.desbloqueada
                    ? `${getColorTheme(conquistaModal.corBase).bgIcon} ${getColorTheme(conquistaModal.corBase).textIcon}`
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                {renderIcon(conquistaModal.icone, 'w-10 h-10')}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      RARIDADE_STYLE[conquistaModal.raridade]?.badge || 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Raridade {conquistaModal.raridade}
                  </span>

                  {conquistaModal.desbloqueada ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Conquistada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      <Lock className="w-3 h-3" /> Em Progresso
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-extrabold text-stone-800 dark:text-stone-100">
                  {conquistaModal.titulo}
                </h3>
              </div>
            </div>

            {/* Descrição e Como Conquistar */}
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 border border-stone-100 dark:border-stone-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Objetivo do Marco
              </h4>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200 leading-relaxed">
                {conquistaModal.descricao}
              </p>
            </div>

            {/* Informações de Progresso Numérico Real */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-stone-600 dark:text-stone-300">
                  Progresso Atual
                </span>
                <span className="text-stone-800 dark:text-stone-100">
                  {conquistaModal.progressoTexto} ({conquistaModal.progresso}%)
                </span>
              </div>

              <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full ${getColorTheme(conquistaModal.corBase).barColor}`}
                  style={{ width: `${Math.max(5, conquistaModal.progresso)}%` }}
                />
              </div>

              {!conquistaModal.desbloqueada && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold pt-1">
                  {conquistaModal.faltamTexto}
                </p>
              )}
            </div>

            {/* Dica de Aprendizado Cultural */}
            {conquistaModal.dica && (
              <div className="flex items-start gap-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4 text-xs">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                    Dica de Aprendizado:
                  </span>
                  <span className="text-amber-800 dark:text-amber-300">
                    {conquistaModal.dica}
                  </span>
                </div>
              </div>
            )}

            {/* Recompensa */}
            {conquistaModal.recompensa && (
              <div className="flex items-center justify-between bg-stone-100/70 dark:bg-stone-800 rounded-2xl p-3.5 text-xs">
                <span className="font-bold text-stone-600 dark:text-stone-300">
                  Recompensa ao completar:
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {conquistaModal.recompensa}
                </span>
              </div>
            )}

            {/* Botão de Fechar */}
            <button
              onClick={() => setConquistaModal(null)}
              className="w-full py-3 bg-primary text-white font-bold rounded-2xl text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
