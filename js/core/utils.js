/**
 * utils.js
 * Funciones utilitarias puras compartidas por todo el proyecto.
 * Sin dependencias externas ni efectos de lado.
 */

/**
 * Valida que una cadena tenga formato de email válido.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/**
 * Normaliza un email: recorta espacios y lo convierte a minúsculas.
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Convierte una fecha/hora con espacio ('2026-08-15 08:30') al formato ISO
 * que acepta el constructor Date ('2026-08-15T08:30').
 * @param {string} fechaHora
 * @returns {Date}
 */
export function parseDateTime(fechaHora) {
  const iso = fechaHora.includes('T') ? fechaHora : fechaHora.replace(' ', 'T');
  return new Date(iso);
}

/**
 * Formatea una fecha al string compacto que requiere Google Calendar
 * (ej. "20260815T083000Z").
 * @param {Date} date
 * @returns {string}
 */
export function toGoogleCalendarDate(date) {
  return date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
}

/**
 * Lee y parsea un valor de localStorage de forma segura.
 * Devuelve `fallback` si la clave no existe o el JSON es inválido.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Serializa un valor y lo guarda en localStorage de forma segura.
 * @param {string} key
 * @param {unknown} value
 */
export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cuota excedida u otros errores de storage → se ignoran silenciosamente.
  }
}
