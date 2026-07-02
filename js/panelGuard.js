/**
 * panelGuard.js
 * Guarda de ruta para el panel administrativo.
 *
 * Redirige a login.html si:
 *   - No hay sesión activa, o
 *   - El usuario activo no tiene rol 'admin'.
 *
 * Debe ser el primer script que se ejecuta en panel.html.
 */

import { auth } from './auth.js';

auth.initialize();

const currentUser = auth.getCurrentUser();

if (!currentUser || currentUser.role !== 'admin') {
  // Guardar la URL de destino para redirigir tras el login (mejora futura)
  sessionStorage.setItem('aerolinea-redirect', 'panel.html');
  window.location.replace('login.html');
}
 