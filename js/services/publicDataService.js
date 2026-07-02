import { pasajerosService } from './pasajerosService.js';
import { vuelosService } from './vuelosService.js';

const STORAGE_KEYS = {
  pasajeros: 'aerolinea-pasajeros',
  vuelos: 'aerolinea-vuelos',
};

const defaultPasajeros = [
  { id: 1, nombre: 'María', apellido: 'López', documento: '12345678', email: 'maria.lopez@ejemplo.com' },
  { id: 2, nombre: 'Carlos', apellido: 'González', documento: '87654321', email: 'carlos.gonzalez@ejemplo.com' },
];

const defaultVuelos = [
  { id: 1, origen: 'Buenos Aires', destino: 'Madrid', fechaHora: '2026-08-15 08:30', estado: 'PROGRAMADO' },
  { id: 2, origen: 'Lima', destino: 'Miami', fechaHora: '2026-08-17 13:45', estado: 'PROGRAMADO' },
  { id: 3, origen: 'Santiago', destino: 'Sao Paulo', fechaHora: '2026-08-18 10:00', estado: 'ATERRIZADO' },
];

function parseStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function saveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

async function obtenerPasajeros() {
  try {
    const pasajeros = await pasajerosService.listar();
    if (Array.isArray(pasajeros) && pasajeros.length) {
      saveStorage(STORAGE_KEYS.pasajeros, pasajeros);
      return pasajeros;
    }
  } catch {
    // fallback below
  }
  return parseStorage(STORAGE_KEYS.pasajeros, defaultPasajeros);
}

async function obtenerVuelos() {
  try {
    const vuelos = await vuelosService.listar();
    if (Array.isArray(vuelos) && vuelos.length) {
      saveStorage(STORAGE_KEYS.vuelos, vuelos);
      return vuelos;
    }
  } catch {
    // fallback below
  }
  return parseStorage(STORAGE_KEYS.vuelos, defaultVuelos);
}

export const publicDataService = {
  obtenerResumen: async () => {
    const [pasajeros, vuelos] = await Promise.all([obtenerPasajeros(), obtenerVuelos()]);
    return { pasajeros, vuelos };
  },

  obtenerPasajeros,
  obtenerVuelos,

  contarMensajesContacto: () => {
    try {
      const inbox = JSON.parse(localStorage.getItem('aerolinea-contactos') || '[]');
      return Array.isArray(inbox) ? inbox.length : 0;
    } catch {
      return 0;
    }
  },
};
