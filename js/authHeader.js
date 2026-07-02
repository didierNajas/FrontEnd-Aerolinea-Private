/**
 * authHeader.js
 * Inyecta los controles de sesión (login/logout/panel) en `.topnav-actions`.
 *
 * Compatible con:
 *   - Páginas donde navbar.js inyecta el topnav dinámicamente.
 *   - Páginas con topnav estático en el HTML (index.html).
 *
 * Se ejecuta después de que navbar.js haya corrido (ambos son módulos,
 * el orden de importación en cada página determina el orden de ejecución).
 */

import { auth } from './auth.js';

// ── Helpers privados ──────────────────────────────────────────────

/** Elimina los links de login/registro estáticos del HTML original. */
function removeStaticAuthLinks(container) {
  container
    .querySelectorAll('a[href="login.html"], a[href="registro.html"]')
    .forEach((link) => link.remove());
}

/** Construye y monta los botones de sesión dentro de `.topnav-actions`. */
function buildHeaderActions() {
  const topnavActions = document.querySelector('.topnav-actions');
  if (!topnavActions) return;

  removeStaticAuthLinks(topnavActions);

  // Obtener o crear el contenedor de acciones de auth
  let authActions = topnavActions.querySelector('.auth-actions');
  if (!authActions) {
    authActions = document.createElement('div');
    authActions.className = 'auth-actions';
    topnavActions.appendChild(authActions);
  }

  authActions.innerHTML = '';

  const user = auth.getCurrentUser();

  if (user) {
    // Chip con el nombre del usuario
    const chip = document.createElement('span');
    chip.className = 'user-chip';
    chip.textContent = `${user.name} · ${user.role === 'admin' ? 'Admin' : 'Usuario'}`;
    authActions.appendChild(chip);

    // Enlace al panel solo para admins
    if (user.role === 'admin') {
      const adminLink = document.createElement('a');
      adminLink.className = 'secondary-btn';
      adminLink.href = 'panel.html';
      adminLink.textContent = 'Panel admin';
      authActions.appendChild(adminLink);
    }

    // Botón de cierre de sesión
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'ghost-btn';
    logoutBtn.textContent = 'Cerrar sesión';
    logoutBtn.addEventListener('click', () => {
      auth.logout();
      window.location.reload();
    });
    authActions.appendChild(logoutBtn);

    return;
  }

  // Usuario no autenticado: mostrar login y registro
  const loginLink = document.createElement('a');
  loginLink.href = 'login.html';
  loginLink.className = 'ghost-btn';
  loginLink.textContent = 'Iniciar sesión';

  const registerLink = document.createElement('a');
  registerLink.href = 'registro.html';
  registerLink.className = 'secondary-btn';
  registerLink.textContent = 'Registrarse';

  authActions.appendChild(loginLink);
  authActions.appendChild(registerLink);
}

// ── Inicialización ────────────────────────────────────────────────

auth.initialize();
buildHeaderActions();
