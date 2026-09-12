export interface Trilha {
  id: number;
  title: string;
  description: string;
  progresso: number;
  nivel: number;
  quantidadeModulos: number;
  icon: string;
  corBase: string;
  estaBloqueada?: boolean;
}

export const trilhasFalsas: Trilha[] = [
  {
    id: 1,
    title: 'Tupi Básico',
    description: 'Aprenda saudações, números e palavras do dia a dia.',
    progresso: 60,
    nivel: 1,
    quantidadeModulos: 5,
    icon: '🌱',
    corBase: 'emerald'
  },
  {
    id: 2,
    title: 'Natureza',
    description: 'Vocabulário sobre animais, plantas e elementos naturais.',
    progresso: 20,
    nivel: 2,
    quantidadeModulos: 4,
    icon: '🌿',
    corBase: 'amber'
  },
  {
    id: 3,
    title: 'Família e Sociedade',
    description: 'Termos de parentesco e organização social.',
    progresso: 0,
    nivel: 3,
    quantidadeModulos: 3,
    icon: '👥',
    corBase: 'indigo',
    estaBloqueada: true
  },
  {
    id: 4,
    title: 'Ações e Verbos',
    description: 'Verbos essenciais e formação de frases simples.',
    progresso: 0,
    nivel: 4,
    quantidadeModulos: 6,
    icon: '⚡',
    corBase: 'rose',
    estaBloqueada: true
  }
];
