import React from 'react';

export interface OpcaoTema {
  index: number;
  letra: string;
  simbolo: string;
  nomeSimbolo: string;
  corBg: string;
  corBorder: string;
  corHover: string;
  corTexto: string;
  corBadge: string;
  icone: string;
}

export const OPCOES_TEMA: OpcaoTema[] = [
  {
    index: 0,
    letra: 'A',
    simbolo: '🍃',
    nomeSimbolo: 'Folha',
    corBg: 'bg-emerald-600',
    corBorder: 'border-emerald-700',
    corHover: 'hover:bg-emerald-500',
    corTexto: 'text-white',
    corBadge: 'bg-emerald-700/80 text-emerald-100',
    icone: 'leaf'
  },
  {
    index: 1,
    letra: 'B',
    simbolo: '🔥',
    nomeSimbolo: 'Fogo',
    corBg: 'bg-rose-600',
    corBorder: 'border-rose-700',
    corHover: 'hover:bg-rose-500',
    corTexto: 'text-white',
    corBadge: 'bg-rose-700/80 text-rose-100',
    icone: 'flame'
  },
  {
    index: 2,
    letra: 'C',
    simbolo: '☀️',
    nomeSimbolo: 'Sol',
    corBg: 'bg-amber-500',
    corBorder: 'border-amber-600',
    corHover: 'hover:bg-amber-400',
    corTexto: 'text-stone-900',
    corBadge: 'bg-amber-600/80 text-amber-950 font-bold',
    icone: 'sun'
  },
  {
    index: 3,
    letra: 'D',
    simbolo: '💧',
    nomeSimbolo: 'Água',
    corBg: 'bg-sky-600',
    corBorder: 'border-sky-700',
    corHover: 'hover:bg-sky-500',
    corTexto: 'text-white',
    corBadge: 'bg-sky-700/80 text-sky-100',
    icone: 'droplet'
  }
];

export const TITULOS_PODIO = [
  {
    posicao: 1,
    titulo: 'Sábio da Aldeia',
    icone: '🪶',
    cor: 'from-amber-400 to-yellow-500',
    borda: 'border-yellow-400',
    badge: '1º Lugar',
  },
  {
    posicao: 2,
    titulo: 'Guerreiro da Trilha',
    icone: '🏹',
    cor: 'from-slate-300 to-stone-400',
    borda: 'border-stone-300',
    badge: '2º Lugar',
  },
  {
    posicao: 3,
    titulo: 'Guardião dos Saberes',
    icone: '🌿',
    cor: 'from-amber-700 to-amber-800',
    borda: 'border-amber-700',
    badge: '3º Lugar',
  }
];

export interface TermosQuestao {
  termoTupi: string;
  traducaoPt: string;
}

/**
 * Extrai de forma inteligente o termo em Tupi e a tradução em português,
 * tratando tanto perguntas do tipo "Como se diz 'olho' em Tupi?" quanto
 * "O que significa a palavra 'gûaîbĩ' em português?".
 */
export function extrairTermosQuestao(
  enunciado: string | null | undefined,
  respostaCorreta: string | null | undefined,
  fonetica: string | null | undefined,
  traducaoPtBr: string | null | undefined
): TermosQuestao {
  const textoEnunciado = enunciado || '';
  const resposta = respostaCorreta || '';
  const foneticaLimpa = fonetica ? fonetica.replace(/[\[\]]/g, '').trim() : '';
  const traducao = traducaoPtBr || '';

  // Procura por termos entre aspas no enunciado respeitando os pares de aspas, para não truncar
  // palavras que contêm apóstrofos/oclusivas glotais (ex: "t'ereiur!", "nhe'eng", "'y", etc.)
  const matchAspas = textoEnunciado.match(/"([^"]+)"|“([^”]+)”|«([^»]+)»|'([^']+)'|‘([^’]+)’/);
  const termoEntreAspas = matchAspas
    ? (matchAspas[1] || matchAspas[2] || matchAspas[3] || matchAspas[4] || matchAspas[5]).trim()
    : '';

  // Detecta se a pergunta pede a tradução em português de uma palavra Tupi
  const ehPerguntaTupiParaPt =
    /em português|em portugues|o que significa|qual o significado|qual a tradução/i.test(textoEnunciado);

  let termoTupi = '';
  let traducaoPt = '';

  if (ehPerguntaTupiParaPt && termoEntreAspas) {
    // Ex: O que significa a palavra "gûaîbĩ" em português?
    // A palavra indígena em Tupi está nas aspas do enunciado!
    termoTupi = termoEntreAspas;
    traducaoPt = resposta || traducao;
  } else {
    // Ex: Como se diz "olho" em Tupi?
    // A palavra em Tupi é a resposta correta escolhida
    termoTupi = foneticaLimpa || resposta;
    traducaoPt = termoEntreAspas || traducao;
  }

  // Se a fonética tem caracteres distintivos do Tupi, ela é muito confiável
  if (foneticaLimpa && /[\^~ïĩẽũỹîûñx]/i.test(foneticaLimpa)) {
    termoTupi = foneticaLimpa;
  }

  // Fallbacks de segurança
  if (!termoTupi) {
    termoTupi = termoEntreAspas || foneticaLimpa || resposta;
  }
  if (!traducaoPt) {
    traducaoPt = traducao || (ehPerguntaTupiParaPt ? resposta : termoEntreAspas);
  }

  return { termoTupi, traducaoPt };
}
