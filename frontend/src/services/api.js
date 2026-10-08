import axios from 'axios';
import { getAuth } from 'firebase/auth';

/**
 * Cliente Axios configurado para interactuar con los microservicios
 * Backend Core (Spring Boot) y Backend IA/PDF (FastAPI).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_CORE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Interceptor de Solicitud:
 * Inyecta el JWT Bearer Token de Firebase Auth en el header Authorization
 * garantizando el cumplimiento de autenticación estricta.
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        // getIdToken(false) usa el token en caché o lo refresca si expira
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('No se pudo adjuntar el token de Firebase Auth a la petición:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuesta:
 * Centraliza el manejo de expiración de sesión (401), permisos denegados (403)
 * y errores del servidor.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.error('Sesión no autorizada o token caducado.');
        // Aquí se puede emitir un evento global o redirigir al login
      } else if (status === 403) {
        console.error('Acceso denegado: rol o permisos insuficientes.');
      }
    } else if (error.request) {
      console.error('Sin respuesta del servidor clínico:', error.request);
    }
    return Promise.reject(error);
  }
);

export default api;
