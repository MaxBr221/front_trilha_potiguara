import { ConquistaDTO, DashboardData } from '@/services/servicoDashboard';

export interface ConquistaCatalogoItem {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  corBase: string;
  categoria: 'xp' | 'ofensiva' | 'licoes' | 'maestria';
  raridade: 'Comum' | 'Rara' | 'Épica' | 'Lendária';
  metaTipo: 'xp' | 'ofensiva' | 'licoes' | 'taxa' | 'trilha';
  metaValor: number;
  unidade: string;
  recompensa: string;
  dica: string;
}

export const CATALOGO_CONQUISTAS: ConquistaCatalogoItem[] = [
  // --- Metas de XP ---
  {
    id: 'conq-xp-500',
    titulo: 'Despertar Tupi',
    descricao: 'Acumule seus primeiros 500 XP na jornada de aprendizado.',
    icone: 'Zap',
    corBase: 'emerald',
    categoria: 'xp',
    raridade: 'Comum',
    metaTipo: 'xp',
    metaValor: 500,
    unidade: 'XP',
    recompensa: '+50 XP bônus',
    dica: 'Conclua suas primeiras lições e exercícios para somar XP rapidamente.'
  },
  {
    id: 'conq-xp-1000',
    titulo: 'Guerreiro Tupi',
    descricao: 'Acumule 1.000 XP praticando a língua e os costumes ancestrais.',
    icone: 'ArcoFlechaIcon',
    corBase: 'blue',
    categoria: 'xp',
    raridade: 'Rara',
    metaTipo: 'xp',
    metaValor: 1000,
    unidade: 'XP',
    recompensa: '+100 XP bônus',
    dica: 'Mantenha a frequência diária para acumular mais experiência.'
  },
  {
    id: 'conq-xp-2000',
    titulo: 'Sábio da Aldeia',
    descricao: 'Alcance a marca de 2.000 XP acumulados em lições e desafios.',
    icone: 'CocarIcon',
    corBase: 'amber',
    categoria: 'xp',
    raridade: 'Épica',
    metaTipo: 'xp',
    metaValor: 2000,
    unidade: 'XP',
    recompensa: '+200 XP bônus',
    dica: 'Pratique exercícios de escrita e desafios de vocabulário para avançar.'
  },
  {
    id: 'conq-xp-5000',
    titulo: 'Guardião Tupi',
    descricao: 'Alcance a marca incrível de 5.000 XP e proteja o saber tradicional.',
    icone: 'MachadoIcon',
    corBase: 'indigo',
    categoria: 'xp',
    raridade: 'Épica',
    metaTipo: 'xp',
    metaValor: 5000,
    unidade: 'XP',
    recompensa: '+500 XP bônus',
    dica: 'Conclua módulos completos e revise lições anteriores regularmente.'
  },
  {
    id: 'conq-xp-10000',
    titulo: 'Espírito Ancestral',
    descricao: 'Alcance a marca lendária de 10.000 XP e torne-se um mestre.',
    icone: 'TriboIcon',
    corBase: 'rose',
    categoria: 'xp',
    raridade: 'Lendária',
    metaTipo: 'xp',
    metaValor: 10000,
    unidade: 'XP',
    recompensa: '+1.000 XP bônus e Emblema Dourado',
    dica: 'Apenas os estudantes mais dedicados alcançam este patamar histórico.'
  },

  // --- Metas de Ofensiva (Dias Seguidos) ---
  {
    id: 'conq-of-3',
    titulo: 'Centelha Viva',
    descricao: 'Mantenha uma ofensiva de 3 dias seguidos estudando Tupi.',
    icone: 'Flame',
    corBase: 'amber',
    categoria: 'ofensiva',
    raridade: 'Comum',
    metaTipo: 'ofensiva',
    metaValor: 3,
    unidade: 'dias',
    recompensa: '+30 XP bônus',
    dica: 'Estude pelo menos 5 minutos por dia para não perder a sequência.'
  },
  {
    id: 'conq-of-7',
    titulo: 'Semana Perfeita',
    descricao: 'Mantenha o fogo aceso por 7 dias seguidos sem falhar.',
    icone: 'FogueiraIcon',
    corBase: 'orange',
    categoria: 'ofensiva',
    raridade: 'Rara',
    metaTipo: 'ofensiva',
    metaValor: 7,
    unidade: 'dias',
    recompensa: '+80 XP bônus',
    dica: 'Defina um horário fixo no seu dia para completar uma lição.'
  },
  {
    id: 'conq-of-14',
    titulo: 'Fogueira Firme',
    descricao: 'Mantenha uma ofensiva ininterrupta de 14 dias seguidos.',
    icone: 'FogueiraIcon',
    corBase: 'orange',
    categoria: 'ofensiva',
    raridade: 'Épica',
    metaTipo: 'ofensiva',
    metaValor: 14,
    unidade: 'dias',
    recompensa: '+150 XP bônus',
    dica: 'A consistência diária é o segredo para a fixação do vocabulário.'
  },
  {
    id: 'conq-of-30',
    titulo: 'Mês de Fogo',
    descricao: 'Mantenha uma ofensiva de 30 dias consecutivos no Tupi Digital.',
    icone: 'Flame',
    corBase: 'rose',
    categoria: 'ofensiva',
    raridade: 'Lendária',
    metaTipo: 'ofensiva',
    metaValor: 30,
    unidade: 'dias',
    recompensa: '+300 XP bônus e Troféu de Chamas',
    dica: 'Um mês inteiro de dedicação contínua à valorização cultural.'
  },

  // --- Metas de Lições ---
  {
    id: 'conq-lic-1',
    titulo: 'Primeiro Passo',
    descricao: 'Conclua a sua primeira lição na plataforma.',
    icone: 'PenaIcon',
    corBase: 'emerald',
    categoria: 'licoes',
    raridade: 'Comum',
    metaTipo: 'licoes',
    metaValor: 1,
    unidade: 'lição',
    recompensa: '+20 XP bônus',
    dica: 'Inicie pela Trilha Potiguara Básica na seção de Trilhas.'
  },
  {
    id: 'conq-lic-10',
    titulo: 'Explorador da Trilha',
    descricao: 'Conclua 10 lições de aprendizado com sucesso.',
    icone: 'Compass',
    corBase: 'blue',
    categoria: 'licoes',
    raridade: 'Comum',
    metaTipo: 'licoes',
    metaValor: 10,
    unidade: 'lições',
    recompensa: '+60 XP bônus',
    dica: 'Avance pelos primeiros módulos da trilha inicial.'
  },
  {
    id: 'conq-lic-25',
    titulo: 'Caçador do Saber',
    descricao: 'Conclua 25 lições e expanda seu conhecimento cultural.',
    icone: 'Target',
    corBase: 'teal',
    categoria: 'licoes',
    raridade: 'Rara',
    metaTipo: 'licoes',
    metaValor: 25,
    unidade: 'lições',
    recompensa: '+120 XP bônus',
    dica: 'Participe das lições práticas e complete os exercícios.'
  },
  {
    id: 'conq-lic-50',
    titulo: 'Poliglota',
    descricao: 'Conclua 50 lições e amplie fortemente seu vocabulário.',
    icone: 'MaracaIcon',
    corBase: 'purple',
    categoria: 'licoes',
    raridade: 'Épica',
    metaTipo: 'licoes',
    metaValor: 50,
    unidade: 'lições',
    recompensa: '+250 XP bônus',
    dica: 'Explore as trilhas de Vocabulário do Dia a Dia e Natureza.'
  },
  {
    id: 'conq-lic-100',
    titulo: 'Mestre da Fala',
    descricao: 'Conclua 100 lições de Tupi e domine as estruturas essenciais.',
    icone: 'Crown',
    corBase: 'amber',
    categoria: 'licoes',
    raridade: 'Lendária',
    metaTipo: 'licoes',
    metaValor: 100,
    unidade: 'lições',
    recompensa: '+500 XP bônus e Selo de Mestre',
    dica: 'Complete todas as trilhas disponíveis na plataforma.'
  },

  // --- Maestria / Qualidade ---
  {
    id: 'conq-prec-85',
    titulo: 'Mente Afiada',
    descricao: 'Mantenha uma taxa de acerto de 85% ou mais em seus exercícios.',
    icone: 'Award',
    corBase: 'teal',
    categoria: 'maestria',
    raridade: 'Rara',
    metaTipo: 'taxa',
    metaValor: 85,
    unidade: '%',
    recompensa: '+100 XP bônus',
    dica: 'Leia atentamente as explicações e revise antes de responder.'
  },
  {
    id: 'conq-trilha-1',
    titulo: 'Trilheiro Nato',
    descricao: 'Complete 100% de uma trilha de aprendizado inteira.',
    icone: 'OcaIcon',
    corBase: 'emerald',
    categoria: 'maestria',
    raridade: 'Épica',
    metaTipo: 'trilha',
    metaValor: 1,
    unidade: 'trilha',
    recompensa: '+200 XP bônus',
    dica: 'Conclua todos os módulos e lições de uma trilha completa.'
  }
];

export interface ConquistaEnriquecida extends ConquistaDTO {
  categoria: 'xp' | 'ofensiva' | 'licoes' | 'maestria';
  raridade: 'Comum' | 'Rara' | 'Épica' | 'Lendária';
  progressoAtual: number;
  metaValor: number;
  unidade: string;
  progressoTexto: string;
  faltamTexto: string;
  recompensa: string;
  dica: string;
}

/**
 * Normaliza e enriquece conquistas vindas da API ou produz fallback completo
 * garantindo que nenhuma conquista fique genérica ("Misteriosa") e que
 * números reais (ex: 2.000 XP) e progressos concretos sejam sempre exibidos.
 */
export function enriquecerConquistas(
  conquistasApi: ConquistaDTO[] | undefined,
  metricas: { xp: number; diasOfensiva: number; licoesConcluidas: number; taxaAcerto: number }
): ConquistaEnriquecida[] {
  const xp = metricas.xp || 0;
  const ofensiva = metricas.diasOfensiva || 0;
  const licoes = metricas.licoesConcluidas || 0;
  const taxa = Math.round(metricas.taxaAcerto || 0);

  // Mapa de itens do backend por título normalizado ou ID
  const mapApi = new Map<string, ConquistaDTO>();
  if (conquistasApi && conquistasApi.length > 0) {
    for (const c of conquistasApi) {
      if (c.id) mapApi.set(c.id.toLowerCase(), c);
      if (c.titulo) mapApi.set(normalizar(c.titulo), c);
    }
  }

  const resultado: ConquistaEnriquecida[] = [];

  for (const item of CATALOGO_CONQUISTAS) {
    // Tenta encontrar correspondente da API
    const matchApi = mapApi.get(normalizar(item.titulo)) || mapApi.get(item.id.toLowerCase());

    // Se a API marcou como desbloqueada, ou se o usuário já atingiu a meta localmente:
    let progressoAtual = 0;
    if (item.metaTipo === 'xp') progressoAtual = xp;
    else if (item.metaTipo === 'ofensiva') progressoAtual = ofensiva;
    else if (item.metaTipo === 'licoes') progressoAtual = licoes;
    else if (item.metaTipo === 'taxa') progressoAtual = taxa;
    else if (item.metaTipo === 'trilha') progressoAtual = licoes >= 15 ? 1 : 0;

    const atingiuLocal = progressoAtual >= item.metaValor;
    const desbloqueada = matchApi ? (matchApi.desbloqueada || atingiuLocal) : atingiuLocal;

    const progressoPercent = desbloqueada
      ? 100
      : Math.min(99, Math.round((progressoAtual / item.metaValor) * 100));

    const progressoTexto = desbloqueada
      ? `${item.metaValor.toLocaleString('pt-BR')} / ${item.metaValor.toLocaleString('pt-BR')} ${item.unidade}`
      : `${Math.min(progressoAtual, item.metaValor).toLocaleString('pt-BR')} / ${item.metaValor.toLocaleString('pt-BR')} ${item.unidade}`;

    const restante = Math.max(0, item.metaValor - progressoAtual);
    const faltamTexto = desbloqueada
      ? 'Concluída!'
      : restante === 1 && item.unidade === 'lições'
      ? 'Falta 1 lição'
      : restante === 1 && item.unidade === 'dias'
      ? 'Falta 1 dia'
      : `Faltam ${restante.toLocaleString('pt-BR')} ${item.unidade}`;

    resultado.push({
      id: matchApi?.id || item.id,
      titulo: item.titulo,
      descricao: item.descricao,
      icone: matchApi?.icone && !matchApi.icone.startsWith('http') ? matchApi.icone : item.icone,
      corBase: matchApi?.corBase || item.corBase,
      desbloqueada,
      progresso: progressoPercent,
      dataDesbloqueio: matchApi?.dataDesbloqueio || (desbloqueada ? new Date().toISOString() : null),
      categoria: item.categoria,
      raridade: item.raridade,
      progressoAtual,
      metaValor: item.metaValor,
      unidade: item.unidade,
      progressoTexto,
      faltamTexto,
      recompensa: item.recompensa,
      dica: item.dica
    });
  }

  // Se a API trouxer conquistas extras que não estão no catálogo estático, nós as adicionamos
  if (conquistasApi) {
    for (const c of conquistasApi) {
      const jaExiste = resultado.some(
        r => r.id === c.id || normalizar(r.titulo) === normalizar(c.titulo)
      );

      if (!jaExiste) {
        // Se o título for literalmente "Misteriosa", tenta deduzir algo ou exibir como segredo
        const isMisteriosa = normalizar(c.titulo) === 'misteriosa';
        const tituloReal = isMisteriosa ? 'Conquista Secreta' : c.titulo;
        const descReal = isMisteriosa
          ? 'Descubra este segredo ancestral completando desafios nas trilhas.'
          : c.descricao;

        resultado.push({
          id: c.id,
          titulo: tituloReal,
          descricao: descReal,
          icone: c.icone || 'Trophy',
          corBase: c.corBase || 'amber',
          desbloqueada: c.desbloqueada,
          progresso: c.progresso,
          dataDesbloqueio: c.dataDesbloqueio,
          categoria: 'geral' as unknown as 'xp',
          raridade: 'Rara',
          progressoAtual: c.progresso,
          metaValor: 100,
          unidade: '%',
          progressoTexto: `${Math.round(c.progresso)}%`,
          faltamTexto: c.desbloqueada ? 'Concluída!' : `${100 - Math.round(c.progresso)}% restante`,
          recompensa: '+50 XP bônus',
          dica: 'Continue avançando nas suas lições e trilhas.'
        });
      }
    }
  }

  return resultado;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
