const LOCAL_API_BASE_URL = 'http://localhost:8080';
const PRODUCTION_API_BASE_URL = 'https://proyectovuelosspringboot.onrender.com';

function resolveApiBaseUrl() {
  if (window.AEROLINEA_API_BASE_URL) {
    return window.AEROLINEA_API_BASE_URL;
  }

  const stored = localStorage.getItem('aerolinea-api-base-url');
  if (stored) {
    return stored;
  }

  const { hostname, port } = window.location;
  const isLocalHost = ['localhost', '127.0.0.1'].includes(hostname);

  // Frontend servido desde el mismo puerto que la API (sin CORS).
  if (isLocalHost && port === '8080') {
    return LOCAL_API_BASE_URL;
  }

  // Preview del IDE (ej. :63342), Live Server, etc.
  // Render ya permite CORS desde cualquier localhost.
  if (isLocalHost) {
    return PRODUCTION_API_BASE_URL;
  }

  return PRODUCTION_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/$/, '');
