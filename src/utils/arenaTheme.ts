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

