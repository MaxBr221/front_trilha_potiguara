export interface User {
  id: number;
  nome: string;
  email: string;
  xp: number;
  sequenciaAtual: number;
  perfil: string;
}

export interface AuthResponse {
  token: string;
  user?: User; // Temporário para o mock
}
