export interface LicaoResponseDTO {
  id: string | number;
  title: string;
  estaConcluida: boolean;
  type: 'learning' | 'exercise';
}

export interface ModuloResponseDTO {
  id: string | number;
  title: string;
  description: string;
  lessons: LicaoResponseDTO[];
  estaBloqueada: boolean;
}

export interface TrilhaResponseDTO {
  id: string | number;
  title: string;
  description: string;
  progresso: number;
  nivel: number;
  quantidadeModulos: number;
  icon: string;
  corBase: string;
  estaBloqueada?: boolean;
}
