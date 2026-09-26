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

// Interceptor de Response para tratamento de erros genéricos e retentativas
api.interceptors.response.use(
  (response) => response,
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
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
