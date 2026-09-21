export interface Usuario {
  id: string | number;
  nome: string;
  email: string;
  xp: number;
  sequenciaAtual: number;
  perfil: string;
  fotoPerfil?: string;
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
}

export interface PerfilPublico extends Amigo {
  totalAmigos: number;
  isAmigo: boolean;
}
