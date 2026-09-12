export interface Licao {
  id: number;
  title: string;
  estaConcluida: boolean;
  type: 'learning' | 'exercise';
}

export interface Modulo {
  id: number;
  title: string;
  description: string;
  lessons: Licao[];
  estaBloqueada: boolean;
}

export const modulosFalsos: Record<number, Modulo[]> = {
  1: [ // Módulos da Trilha 1
    {
      id: 101,
      title: 'Primeiras palavras',
      description: 'Aprenda o vocabulário básico de introdução.',
      estaBloqueada: false,
      lessons: [
        { id: 1001, title: 'Saudações iniciais', estaConcluida: true, type: 'learning' },
        { id: 1002, title: 'Quiz: Saudações', estaConcluida: true, type: 'exercise' },
        { id: 1003, title: 'Apresentação pessoal', estaConcluida: false, type: 'learning' },
        { id: 1004, title: 'Prática de apresentação', estaConcluida: false, type: 'exercise' },
      ]
    },
    {
      id: 102,
      title: 'Números de 1 a 5',
      description: 'Como contar e usar quantidades no dia a dia.',
      estaBloqueada: true,
      lessons: [
        { id: 1005, title: 'Conhecendo os números', estaConcluida: false, type: 'learning' },
        { id: 1006, title: 'Prática de contagem', estaConcluida: false, type: 'exercise' },
      ]
    }
  ]
};
