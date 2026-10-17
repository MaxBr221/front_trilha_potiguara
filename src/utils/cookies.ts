/**
 * Utilitários para sincronização do token JWT em cookies e localStorage.
 * Garante compatibilidade com o Next.js, rotas e evita concorrência com tokens expirados.
 */

export function definirCookieAuth(token: string): void {
  if (typeof document !== 'undefined') {
    // 4 horas de expiração (14.400 segundos), condizente com o JWT do backend
    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=14400; SameSite=Lax`;
  }
}

export function limparCookieAuth(): void {
  if (typeof document !== 'undefined') {
    document.cookie = 'token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
}

export function obterCookieAuth(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function limparSessaoCompleta(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('usuario');
      limparCookieAuth();
    } catch (e) {
      console.warn('Erro ao limpar sessão local:', e);
    }
  }
}
