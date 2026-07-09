const LOCAL_API_BASE_URL = 'http://localhost:8080';
const PRODUCTION_API_BASE_URL = 'https://proyectovuelosspringboot.onrender.com';
const STORAGE_KEY = 'aerolinea-api-base-url';

function isLocalFrontend() {
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function isLoopbackApiUrl(url) {
  try {
    const { hostname } = new URL(url);
    return ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
}

function sanitizeApiUrl(url) {
  if (!url) {
    return null;
  }

  // En sitios publicos (GitHub Pages) nunca usar localhost: el navegador lo bloquea.
  if (!isLocalFrontend() && isLoopbackApiUrl(url)) {
    return null;
  }

  return url.replace(/\/$/, '');
}

function resolveApiBaseUrl() {
  const candidates = [
    window.AEROLINEA_API_BASE_URL,
    localStorage.getItem(STORAGE_KEY),
  ];

  for (const candidate of candidates) {
    const sanitized = sanitizeApiUrl(candidate);
    if (sanitized) {
      return sanitized;
    }
  }

  // Limpia override invalido guardado en produccion.
  if (!isLocalFrontend() && localStorage.getItem(STORAGE_KEY)) {
    localStorage.removeItem(STORAGE_KEY);
  }

  if (isLocalFrontend()) {
    // Mismo puerto que la API → sin CORS.
    if (window.location.port === '8080') {
      return LOCAL_API_BASE_URL;
    }

    // Preview del IDE, Live Server, etc. → Render.
    return PRODUCTION_API_BASE_URL;
  }

  return PRODUCTION_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/$/, '');
