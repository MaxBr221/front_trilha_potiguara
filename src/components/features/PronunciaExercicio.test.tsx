import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PronunciaExercicio } from './PronunciaExercicio';
import { Exercicio } from '@/services/servicoExercicio';

const exercicioMock: Exercicio = {
  id: 101,
  tipo: 'PRONUNCIA',
  enunciado: "Fale no microfone a saudação de bom dia: Tîa nde Ko'ema",
  respostaCorreta: "Tîa nde Ko'ema",
  pontuacaoXp: 15,
  ordemIndex: 1,
};

describe('PronunciaExercicio Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o enunciado e a palavra alvo em destaque', () => {
    render(
      <PronunciaExercicio
        exercicio={exercicioMock}
        onValidated={vi.fn()}
      />
    );

    expect(screen.getByText("Fale no microfone a saudação de bom dia: Tîa nde Ko'ema")).toBeInTheDocument();
    expect(screen.getAllByText(/Tîa nde Ko'ema/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText('Gravar áudio da pronúncia')).toBeInTheDocument();
  });

  it('deve permitir clicar em "Não posso falar agora" acionando onSkip', () => {
    const onSkipMock = vi.fn();
    render(
      <PronunciaExercicio
        exercicio={exercicioMock}
        onValidated={vi.fn()}
        onSkip={onSkipMock}
      />
    );

    const botaoPular = screen.getByRole('button', { name: /Não posso falar agora/i });
    expect(botaoPular).toBeInTheDocument();

    fireEvent.click(botaoPular);
    expect(onSkipMock).toHaveBeenCalledTimes(1);
  });

  it('deve exibir indicador de erro quando o navegador não suportar gravação', async () => {
    // Simula ambiente sem getUserMedia
    const originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(
      <PronunciaExercicio
        exercicio={exercicioMock}
        onValidated={vi.fn()}
      />
    );

    const micButton = screen.getByLabelText('Gravar áudio da pronúncia');
    fireEvent.click(micButton);

    expect(await screen.findByText(/Seu navegador não suporta gravação de áudio/i)).toBeInTheDocument();

    // Restaura mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      value: originalMediaDevices,
      configurable: true,
      writable: true,
    });
  });

  it('deve exibir precisão e transcrição aproximada quando houver resultado de validação', () => {
    const validacaoMock = {
      correta: true,
      precisao: 92,
      xpGanho: 15,
      respostaCorreta: "Tîa nde Ko'ema",
      transcricaoAproximada: "Tia nde Ko'ema",
      feedbackPedagogico: "Excelente pronúncia!",
    };

    render(
      <PronunciaExercicio
        exercicio={exercicioMock}
        onValidated={vi.fn()}
        isAnswered={true}
        validationResult={validacaoMock}
      />
    );

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText(/Tia nde Ko'ema/i)).toBeInTheDocument();
    expect(screen.getByText('Gravação avaliada!')).toBeInTheDocument();
  });
});
