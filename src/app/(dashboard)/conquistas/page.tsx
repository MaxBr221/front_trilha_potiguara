
'use client';

import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Lock, Loader2 } from 'lucide-react';
import { servicoDashboard, DashboardData } from '@/services/servicoDashboard';

export default function ConquistasPage() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const data = await servicoDashboard.obterDadosDashboard();
        setDados(data);
      } catch (error) {
        console.error('Erro ao buscar conquistas', error);
      } finally {
        setCarregando(false);
      }
    };
    fetchDados();
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

  const renderIcon = (iconeName: string) => {
    const IconComponent = (LucideIcons as any)[iconeName] || LucideIcons.Trophy;
    return <IconComponent className="w-7 h-7" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
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

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-stone-800">Conquistas Desbloqueadas</h2>
        {conquistasDesbloqueadas.length === 0 ? (
          <p className="text-stone-500">Nenhuma conquista desbloqueada ainda.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conquistasDesbloqueadas.map((conquista) => (
              <div key={conquista.id} className="bg-white p-6 rounded-2xl border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-${conquista.corBase}-100 text-${conquista.corBase}-600`}>
                    {renderIcon(conquista.icone)}
                  </div>
                  <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                    {conquista.dataDesbloqueio ? new Date(conquista.dataDesbloqueio).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-stone-800 mb-2">{conquista.titulo}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{conquista.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-8 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-800">Em Progresso</h2>
          <span className="text-stone-500 text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Bloqueadas
          </span>
        </div>
        
        {conquistasBloqueadas.length === 0 ? (
          <p className="text-stone-500">Você desbloqueou todas as conquistas!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conquistasBloqueadas.map((conquista) => (
              <div key={conquista.id} className="bg-stone-50 p-6 rounded-2xl border border-stone-200 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-stone-200 text-stone-400 rounded-2xl flex items-center justify-center">
                    {renderIcon(conquista.icone)}
                  </div>
                  <Lock className="w-5 h-5 text-stone-300" />
                </div>
                <h3 className="font-bold text-xl text-stone-700 mb-2">{conquista.titulo}</h3>
                <p className="text-stone-500 text-sm mb-6 leading-relaxed">{conquista.descricao}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-500">
                    <span>Progresso</span>
                    <span>{Math.round(conquista.progresso)}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${conquista.corBase}-500`} 
                      style={{ width: `${conquista.progresso}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
