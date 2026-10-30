import axios from 'axios';
import { limparSessaoCompleta, obterCookieAuth } from '@/utils/cookies';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
});

// Interceptor de Request: sempre lê o token mais recente e bloqueia envio para rotas de auth
api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAuthRoute =
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/esqueci-senha') ||
    url.includes('/auth/redefinir-senha');

  // Em rotas de autenticação, NUNCA envie header Authorization (evita 403 / UUID inválido no back-end)
  if (isAuthRoute) {
    if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
    delete api.defaults.headers.common['Authorization'];
    return config;
  }

  // Em qualquer outra rota protegida, lê diretamente o token mais fresco (evita closures e dados antigos)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || obterCookieAuth();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// O back-end está escapando HTML nas strings (ex.: "+" vira "&#43;", "=" vira "&#61;"),
// o que corrompe imagens Base64. Restauramos os caracteres em qualquer "data:image..." recebido.
const decodificarEntidades = (valor: string) =>
  valor
    .replace(/&#43;|&#x2B;|&plus;/gi, '+')
    .replace(/&#61;|&#x3D;|&equals;/gi, '=')
    .replace(/&#47;|&#x2F;/gi, '/');

const corrigirImagensBase64 = (dado: unknown): unknown => {
  if (typeof dado === 'string') {
    return dado.startsWith('data:image') && dado.includes('&') ? decodificarEntidades(dado) : dado;
  }
  if (Array.isArray(dado)) return dado.map(corrigirImagensBase64);
  if (dado && typeof dado === 'object') {
    for (const chave of Object.keys(dado)) {
      (dado as Record<string, unknown>)[chave] = corrigirImagensBase64((dado as Record<string, unknown>)[chave]);
    }
  }
  return dado;
};

// Interceptor de Response para tratamento de erros genéricos, 401 e retentativas seguras
api.interceptors.response.use(
  (response) => {
    response.data = corrigirImagensBase64(response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/esqueci-senha') ||
      requestUrl.includes('/auth/redefinir-senha');

    // Lógica de retentativa para erros de rede (Render spin down, conexão perdida), exceto rotas de auth
    if (originalRequest && !isAuthRoute) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.response.status >= 500;

      if (isNetworkError && originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;
        // Espera progressivamente: 1.5s, 3s, 4.5s
        await new Promise((resolve) => setTimeout(resolve, originalRequest._retryCount * 1500));
        return api(originalRequest);
      }
    }

    // Tratamento rigoroso de 401 Unauthorized para evitar ciclos de reload/loop
    if (error.response?.status === 401) {
      // 1. NUNCA redirecionar se a requisição que falhou for o endpoint de login ou rotas de auth
      if (isAuthRoute) {
        return Promise.reject(error);
      }

      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const publicPaths = ['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha'];

        // 2. NUNCA executar reload/redirecionamento se o usuário já estiver na rota de login ou pública
        if (publicPaths.includes(pathname)) {
          limparSessaoCompleta();
          delete api.defaults.headers.common['Authorization'];
          return Promise.reject(error);
        }

        const isLicaoRoute = pathname.startsWith('/licoes/');
        const isArenaRoute = pathname.startsWith('/arena');
        // 3. Quando for deslogar por 401 legítimo em rotas protegidas, limpe tudo antes de redirecionar
        if (!isLicaoRoute && !isArenaRoute) {
          limparSessaoCompleta();
          delete api.defaults.headers.common['Authorization'];
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);
