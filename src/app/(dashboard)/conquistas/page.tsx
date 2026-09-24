'use client';

import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Lock, Loader2, Target, CheckCircle2, Award } from 'lucide-react';
import { servicoDashboard, DashboardData } from '@/services/servicoDashboard';
import Confetti from 'react-confetti';

type TabType = 'todas' | 'desbloqueadas' | 'bloqueadas';

export default function ConquistasPage() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<TabType>('todas');
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [dimensoes, setDimensoes] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Para o react-confetti não dar erro de hidratação e pegar o tamanho certo
    const timeout = setTimeout(() => {
      setDimensoes({ width: window.innerWidth, height: window.innerHeight });
    }, 0);

    const fetchDados = async () => {
      try {
        const data = await servicoDashboard.obterDadosDashboard();
        setDados(data);

        // Dispara o confete se houver conquistas desbloqueadas (ideal salvar no localStorage pra não disparar sempre)
        const temDesbloqueada = data.conquistas.some(c => c.desbloqueada);
        if (temDesbloqueada && !localStorage.getItem('confeteMostrado')) {
          setMostrarConfete(true);
          localStorage.setItem('confeteMostrado', 'true');
          setTimeout(() => setMostrarConfete(false), 5000);
        }

      } catch (error) {
        console.error('Erro ao buscar conquistas', error);
      } finally {
        setCarregando(false);
      }
    };
    fetchDados();

    return () => clearTimeout(timeout);
  }, []);

  if (carregando || !dados) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const conquistasDesbloqueadas = dados.conquistas.filter(c => c.desbloqueada);
  const conquistasBloqueadas = dados.conquistas.filter(c => !c.desbloqueada);

  const getConquistasExibidas = () => {
    if (abaAtiva === 'desbloqueadas') return conquistasDesbloqueadas;
    if (abaAtiva === 'bloqueadas') return conquistasBloqueadas;
    return dados.conquistas;
  };

  const conquistasExibidas = getConquistasExibidas();

  const renderIcon = (iconeName: string) => {
    const IconComponent = ((LucideIcons as Record<string, unknown>)[iconeName] as React.ElementType) || LucideIcons.Trophy;
    return <IconComponent className="w-7 h-7" />;
  };

  const getRaridade = (progressoTotal: number) => {
    if (progressoTotal > 80) return { label: 'Lendária', cor: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700' };
    if (progressoTotal > 50) return { label: 'Épica', cor: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700' };
    if (progressoTotal > 20) return { label: 'Rara', cor: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' };
    return { label: 'Comum', cor: 'text-stone-500 dark:text-stone-400', bg: 'bg-stone-100 dark:bg-stone-800', border: 'border-stone-300 dark:border-stone-700' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {mostrarConfete && <Confetti width={dimensoes.width} height={dimensoes.height} recycle={false} numberOfPieces={300} />}

      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-10 text-white shadow-lg flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
          <LucideIcons.Trophy className="w-12 h-12 text-white" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Suas Conquistas</h1>
          <p className="text-white/90 max-w-2xl text-lg">
            Você já desbloqueou {conquistasDesbloqueadas.length} de {dados.conquistas.length} conquistas disponíveis. Continue aprendendo para platinar seu perfil!
          </p>
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setAbaAtiva('todas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${abaAtiva === 'todas' ? 'bg-primary text-white' : 'bg-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
        >
          <Target className="w-4 h-4" />
          Todas
        </button>
        <button 
          onClick={() => setAbaAtiva('desbloqueadas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${abaAtiva === 'desbloqueadas' ? 'bg-primary text-white' : 'bg-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Desbloqueadas
        </button>
        <button 
          onClick={() => setAbaAtiva('bloqueadas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${abaAtiva === 'bloqueadas' ? 'bg-primary text-white' : 'bg-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
        >
          <Lock className="w-4 h-4" />
          Em Progresso
        </button>
      </div>

      {/* Lista de Conquistas */}
      {conquistasExibidas.length === 0 ? (
        <div className="text-center py-10 bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <Award className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <p className="text-stone-500 dark:text-stone-400 font-medium">Nenhuma conquista encontrada nessa categoria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conquistasExibidas.map((conquista) => {
            const raridade = getRaridade(conquista.progresso || 100);
            
            if (!conquista.desbloqueada) {
              return (
                <div key={conquista.id} className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 opacity-80 hover:opacity-100 transition-opacity flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 rounded-2xl flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${raridade.bg} ${raridade.cor}`}>
                      {raridade.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-stone-700 dark:text-stone-300 mb-2">Misteriosa</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mb-6 leading-relaxed flex-grow">Continue progredindo nas trilhas para descobrir e desbloquear esta conquista.</p>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-xs font-bold text-stone-500 dark:text-stone-400">
                      <span>Progresso</span>
                      <span>{Math.round(conquista.progresso)}%</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${conquista.corBase}-400 dark:bg-${conquista.corBase}-600`} 
                        style={{ width: `${conquista.progresso}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={conquista.id} className={`bg-white dark:bg-stone-900 p-6 rounded-2xl border-2 ${raridade.border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col h-full`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-${conquista.corBase}-100 dark:bg-${conquista.corBase}-900/30 text-${conquista.corBase}-600 dark:text-${conquista.corBase}-400`}>
                    {renderIcon(conquista.icone)}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${raridade.bg} ${raridade.cor}`}>
                    {raridade.label}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-1">{conquista.titulo}</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6 flex-grow">{conquista.descricao}</p>
                
                <div className="flex justify-between items-center text-xs font-bold text-stone-400 dark:text-stone-500 mt-auto pt-4 border-t border-stone-100 dark:border-stone-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Desbloqueada
                  </span>
                  <span>{conquista.dataDesbloqueio ? new Date(conquista.dataDesbloqueio).toLocaleDateString('pt-BR') : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
