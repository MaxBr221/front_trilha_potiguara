import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
});

// Interceptor de Request para injetar o Token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    // Não enviar token para rotas de login/registro para evitar erros 403 / UUID inválido no back-end
    const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    
    if (token && config.headers && !isAuthRoute) {
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

// Interceptor de Response para tratamento de erros genéricos e retentativas
api.interceptors.response.use(
  (response) => {
    response.data = corrigirImagensBase64(response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Lógica de retentativa para erros de rede (Render spin down, conexão perdida)
    if (originalRequest) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      
      const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.response.status >= 500;
      
      if (isNetworkError && originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;
        // Espera progressivamente: 1.5s, 3s, 4.5s
        await new Promise(resolve => setTimeout(resolve, originalRequest._retryCount * 1500));
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      // TODO: Lógica para deslogar usuário caso o token expire
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        const publicPaths = ['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha', '/'];
        const isLicaoRoute = window.location.pathname.startsWith('/licoes/');
        if (!publicPaths.includes(window.location.pathname) && !isLicaoRoute) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
