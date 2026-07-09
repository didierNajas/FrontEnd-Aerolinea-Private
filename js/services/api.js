import { API_BASE_URL } from '../config.js';

const UNCONFIGURED_API_MARKERS = ['TU_SERVICIO.onrender.com', 'TU_BACKEND_PUBLICO_AQUI'];

async function request(path, options = {}) {
  try {
    if (UNCONFIGURED_API_MARKERS.some((marker) => API_BASE_URL.includes(marker))) {
      throw new Error(
        'Configura la URL de Render en js/config.js (PRODUCTION_API_BASE_URL) antes de usar GitHub Pages.'
      );
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`No se pudo conectar con la API en ${API_BASE_URL}. Verifica que el backend esté corriendo, desplegado con HTTPS y con CORS habilitado.`);
    }

    throw error;
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
