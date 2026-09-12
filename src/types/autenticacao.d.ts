export interface Usuario {
  id: number;
  nome: string;
  email: string;
  xp: number;
  sequenciaAtual: number;
  perfil: string;
}

export interface RespostaAutenticacao {
  token: string;
  usuario?: Usuario; // Temporário para o mock
}
