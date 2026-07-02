/**
 * publicDataService.js
 * Proporciona datos de pasajeros y vuelos para las páginas públicas.
 * Intenta obtenerlos de la API REST; si falla, usa el localStorage como caché/fallback.
 */

import { pasajerosService } from './pasajerosService.js';
import { vuelosService }    from './vuelosService.js';
import { readStorage, writeStorage } from '../core/utils.js';

// ── Claves de caché ───────────────────────────────────────────────

const CACHE_KEYS = {
  pasajeros: 'aerolinea-pasajeros',
  vuelos:    'aerolinea-vuelos',
};

// ── Datos de semilla (fallback sin API ni caché) ──────────────────

const SEED_PASAJEROS = [
  { id: 1, nombre: 'María',  apellido: 'López',    documento: '12345678', email: 'maria.lopez@ejemplo.com'   },
  { id: 2, nombre: 'Carlos', apellido: 'González', documento: '87654321', email: 'carlos.gonzalez@ejemplo.com' },
];

const SEED_VUELOS = [
  { id: 1, origen: 'Buenos Aires', destino: 'Madrid',    fechaHora: '2026-08-15 08:30', estado: 'PROGRAMADO' },
  { id: 2, origen: 'Lima',         destino: 'Miami',     fechaHora: '2026-08-17 13:45', estado: 'PROGRAMADO' },
  { id: 3, origen: 'Santiago',     destino: 'Sao Paulo', fechaHora: '2026-08-18 10:00', estado: 'ATERRIZADO'  },
];

// ── Helpers privados ──────────────────────────────────────────────

async function fetchWithFallback(serviceFn, cacheKey, seed) {
  try {
    const data = await serviceFn();
    if (Array.isArray(data) && data.length) {
      writeStorage(cacheKey, data);
      return data;
    }
  } catch {
    // API no disponible → continúa con caché o semilla
  }
  return readStorage(cacheKey, seed);
}

// ── API pública ───────────────────────────────────────────────────

export const publicDataService = {
  /** Devuelve pasajeros (API → caché → semilla). */
  obtenerPasajeros: () =>
    fetchWithFallback(pasajerosService.listar, CACHE_KEYS.pasajeros, SEED_PASAJEROS),

  /** Devuelve vuelos (API → caché → semilla). */
  obtenerVuelos: () =>
    fetchWithFallback(vuelosService.listar, CACHE_KEYS.vuelos, SEED_VUELOS),

  /** Devuelve ambos en paralelo. */
  obtenerResumen: async () => {
    const [pasajeros, vuelos] = await Promise.all([
      publicDataService.obtenerPasajeros(),
      publicDataService.obtenerVuelos(),
    ]);
    return { pasajeros, vuelos };
  },

  /** Cuenta los mensajes almacenados en el formulario de contacto. */
  contarMensajesContacto: () => {
    const inbox = readStorage('aerolinea-contactos', []);
    return Array.isArray(inbox) ? inbox.length : 0;
  },
};
