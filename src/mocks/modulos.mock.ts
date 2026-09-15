export interface Licao {
  id: string | number;
  title: string;
  estaConcluida: boolean;
  type: 'learning' | 'exercise';
}

export interface Modulo {
  id: string | number;
  title: string;
  description: string;
  lessons: Licao[];
  estaBloqueada: boolean;
}

export const modulosFalsos: Record<number, Modulo[]> = {
  1: [ // Módulos da Trilha 1
    {
      id: "m1",
      title: 'Primeiras palavras',
      description: 'Aprenda o vocabulário básico de introdução.',
      estaBloqueada: false,
      lessons: [
        { id: "l1", title: 'Saudações iniciais', estaConcluida: true, type: 'learning' },
        { id: "l2", title: 'Quiz: Saudações', estaConcluida: true, type: 'exercise' },
        { id: "l3", title: 'Apresentação pessoal', estaConcluida: false, type: 'learning' },
        { id: "l4", title: 'Prática de apresentação', estaConcluida: false, type: 'exercise' },
      ]
    },
    {
      id: "m2",
      title: 'Números de 1 a 5',
      description: 'Como contar e usar quantidades no dia a dia.',
      estaBloqueada: true,
      lessons: [
        { id: "l5", title: 'Conhecendo os números', estaConcluida: false, type: 'learning' },
        { id: "l6", title: 'Prática de contagem', estaConcluida: false, type: 'exercise' },
      ]
    }
  ]
};
