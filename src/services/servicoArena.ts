import { api } from './api';

export interface ModuloArenaDTO {
  id: string;
  titulo: string;
  descricao: string;
  totalQuestoes: number;
}

export interface TrilhaArenaDTO {
  id: string;
  nome: string;
  icon: string;
  corBase: string;
  modulos: ModuloArenaDTO[];
}

export interface CriarArenaRequestDTO {
  moduloIds: string[];
  quantidadeQuestoes?: number;
  tempoPorPergunta?: number;
  titulo?: string;
}

export interface CriarArenaResponseDTO {
  salaId: string;
  codigoPin: string;
  titulo: string;
  totalQuestoes: number;
  tempoPorPergunta: number;
  status: string;
}

export interface EntrarArenaRequestDTO {
  codigoPin: string;
  apelido: string;
}

export interface EntrarArenaResponseDTO {
  salaId: string;
  participanteId: string;
  codigoPin: string;
  apelido: string;
  statusSala: string;
}

export interface ResponderArenaRequestDTO {
  participanteId: string;
  opcaoEscolhida: string;
  tempoRespostaMs: number;
}

export interface ParticipanteRankingDTO {
  id: string;
  apelido: string;
  pontuacaoTotal: number;
  acertos: number;
  posicao: number;
}

export interface ParticipanteStatusDTO {
  id: string;
  apelido: string;
  pontuacaoTotal: number;
  acertos: number;
  posicao: number;
  jaRespondeuEstaQuestao: boolean;
  acertouQuestaoAnterior: boolean | null;
  pontosGanhosQuestaoAnterior: number | null;
}

export interface EstadoArenaResponseDTO {
  salaId: string;
  codigoPin: string;
  titulo: string;
  status: 'LOBBY' | 'PERGUNTA_ATIVA' | 'REVELACAO' | 'PLACAR' | 'FINALIZADA';
  totalQuestoes: number;
  perguntaAtualIndex: number;
  tempoPerguntaSegundos: number;
  tempoRestanteSegundos: number | null;
  enunciado: string | null;
  opcoes: string[] | null;
  respostaCorreta: string | null;
  contagemRespostasPorOpcao: Record<string, number> | null;
  fonetica: string | null;
  traducaoPtBr: string | null;
  totalParticipantes: number;
  totalRespostasRecebidas: number;
  ranking: ParticipanteRankingDTO[];
  meuStatus: ParticipanteStatusDTO | null;
}

export const servicoArena = {
  async obterModulosDisponiveis(): Promise<TrilhaArenaDTO[]> {
    const res = await api.get<TrilhaArenaDTO[]>('/arena/modulos-disponiveis');
    return res.data;
  },

  async criarSala(dados: CriarArenaRequestDTO): Promise<CriarArenaResponseDTO> {
    const res = await api.post<CriarArenaResponseDTO>('/arena/criar', dados);
    return res.data;
  },

  async entrarSala(dados: EntrarArenaRequestDTO): Promise<EntrarArenaResponseDTO> {
    const res = await api.post<EntrarArenaResponseDTO>('/arena/entrar', dados);
    return res.data;
  },

  async obterEstado(pin: string, participanteId?: string): Promise<EstadoArenaResponseDTO> {
    const res = await api.get<EstadoArenaResponseDTO>(`/arena/${pin}/estado`, {
      params: participanteId ? { participanteId } : {}
    });
    return res.data;
  },

  async avancarEtapa(pin: string): Promise<EstadoArenaResponseDTO> {
    const res = await api.post<EstadoArenaResponseDTO>(`/arena/${pin}/avancar`);
    return res.data;
  },

  async pularParaProximaQuestao(pin: string): Promise<EstadoArenaResponseDTO> {
    try {
      const res = await api.post<EstadoArenaResponseDTO>(`/arena/${pin}/pular-para-proxima`);
      return res.data;
    } catch {
      // Fallback gracioso caso o backend em deploy ainda não tenha a nova rota
      const res = await api.post<EstadoArenaResponseDTO>(`/arena/${pin}/avancar`);
      return res.data;
    }
  },

  async responder(pin: string, dados: ResponderArenaRequestDTO): Promise<{ registrado: boolean; totalRespostasNestaQuestao: number }> {
    const res = await api.post(`/arena/${pin}/responder`, dados);
    return res.data;
  },

  async encerrar(pin: string): Promise<EstadoArenaResponseDTO> {
    const res = await api.post<EstadoArenaResponseDTO>(`/arena/${pin}/encerrar`);
    return res.data;
  }
};

