/**
 * auth.js
 * Gestión de autenticación local con localStorage.
 * Expone el objeto `auth` con los métodos: initialize, login, register, logout, getCurrentUser, isAdmin.
 */

import { normalizeEmail, readStorage, writeStorage } from './core/utils.js';

// ── Claves de almacenamiento ──────────────────────────────────────

const STORAGE_USERS        = 'aerolinea-users';
const STORAGE_CURRENT_USER = 'aerolinea-current-user';

// ── Usuarios por defecto (semilla) ───────────────────────────────

const DEFAULT_USERS = [
  {
    name: 'Administrador Aerolínea',
    email: 'admin@aerolinea.com',
    password: 'Admin1234',
    role: 'admin',
    registeredAt: new Date().toISOString(),
  },
  {
    name: 'Cliente Ejemplo',
    email: 'cliente@aerolinea.com',
    password: 'Cliente1234',
    role: 'user',
    registeredAt: new Date().toISOString(),
  },
];

// ── Helpers privados ──────────────────────────────────────────────

function loadUsers() {
  return readStorage(STORAGE_USERS, null);
}

function saveUsers(users) {
  writeStorage(STORAGE_USERS, users);
}

/** Garantiza que exista al menos un usuario registrado. */
function ensureUsers() {
  const users = loadUsers();
  if (!Array.isArray(users) || users.length === 0) {
    saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  return users;
}

function loadCurrentUser() {
  return readStorage(STORAGE_CURRENT_USER, null);
}

function saveCurrentUser(user) {
  if (user) {
    writeStorage(STORAGE_CURRENT_USER, user);
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER);
  }
}

// ── API pública ───────────────────────────────────────────────────

export const auth = {
  /** Inicializa los datos por defecto si no existen. */
  initialize() {
    ensureUsers();
  },

  /**
   * Autentica a un usuario por email y contraseña.
   * @throws {Error} si las credenciales son incorrectas.
   */
  login({ email, password }) {
    const users          = ensureUsers();
    const normalizedEmail = normalizeEmail(email);
    const user            = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!user) throw new Error('Email o contraseña incorrectos.');

    const session = {
      name:       user.name,
      email:      user.email,
      role:       user.role,
      loggedInAt: new Date().toISOString(),
    };

    saveCurrentUser(session);
    return loadCurrentUser();
  },

  /**
   * Registra un nuevo usuario con rol 'user'.
   * @throws {Error} si el email ya está en uso.
   */
  register({ name, email, password }) {
    const users           = ensureUsers();
    const normalizedEmail = normalizeEmail(email);
    const exists          = users.some((u) => u.email.toLowerCase() === normalizedEmail);

    if (exists) throw new Error('Este email ya está registrado.');

    const newUser = {
      name:         name.trim(),
      email:        normalizedEmail,
      password,
      role:         'user',
      registeredAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const session = {
      name:       newUser.name,
      email:      newUser.email,
      role:       newUser.role,
      loggedInAt: new Date().toISOString(),
    };

    saveCurrentUser(session);
    return loadCurrentUser();
  },

  /** Cierra la sesión activa. */
  logout() {
    saveCurrentUser(null);
  },

  /** Devuelve el usuario de la sesión activa, o null si no hay sesión. */
  getCurrentUser: loadCurrentUser,

  /** Comprueba si el usuario dado tiene rol admin. */
  isAdmin(user) {
    return Boolean(user && user.role === 'admin');
  },
};
