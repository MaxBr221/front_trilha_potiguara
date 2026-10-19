import { describe, it, expect } from 'vitest';
import { formatarMembroDesde } from './data';

describe('formatarMembroDesde', () => {
  it('deve retornar "Recentemente" quando data for undefined ou vazia', () => {
    expect(formatarMembroDesde(undefined)).toBe('Recentemente');
    expect(formatarMembroDesde('')).toBe('Recentemente');
  });

  it('deve retornar "Recentemente" para data inválida', () => {
    expect(formatarMembroDesde('data-invalida')).toBe('Recentemente');
  });

  it('deve formatar data ISO válida em pt-BR com dia, mês por extenso e ano', () => {
    const formatada = formatarMembroDesde('2026-09-19T10:00:00Z');
    expect(formatada).toContain('2026');
    expect(formatada.toLowerCase()).toContain('setembro');
  });
});
