export interface Usuario {
  id: string | number;
  nome: string;
  email: string;
  xp: number;
  sequenciaAtual: number;
  perfil: string;
  fotoPerfil?: string;
  fotoPerfilPosicao?: string;
  createdAt?: string;
}

export interface RespostaAutenticacao {
  token: string;
  usuario?: Usuario; // Temporário para o mock
}

export interface Amigo {
  id: string;
  nome: string;
  xp: number;
  sequenciaAtual: number;
  fotoPerfil?: string;
  fotoPerfilPosicao?: string;
}

export interface PerfilPublico extends Amigo {
  totalAmigos: number;
  isAmigo: boolean;
}
