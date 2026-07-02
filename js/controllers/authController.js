/**
 * authController.js
 * Maneja el submit del formulario de login (login.html)
 * y del formulario de registro (registro.html).
 */

import { auth }           from '../auth.js';
import { isValidEmail }   from '../core/utils.js';

// ── Helpers de UI ─────────────────────────────────────────────────

/**
 * Muestra un mensaje de alerta dentro de `container`.
 * @param {HTMLElement} container
 * @param {string}      message   - Puede contener HTML.
 * @param {'success'|'error'} type
 */
function showMessage(container, message, type = 'success') {
  container.innerHTML = message
    ? `<div class="alert ${type}">${message}</div>`
    : '';
}

// ── Login ─────────────────────────────────────────────────────────

function handleLoginSubmit(event) {
  event.preventDefault();

  const form     = event.currentTarget;
  const alertBox = document.getElementById('loginAlert');
  const { email, password } = Object.fromEntries(new FormData(form));

  showMessage(alertBox, '');

  if (!email.trim() || !password.trim()) {
    showMessage(alertBox, 'Por favor completa todos los campos.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showMessage(alertBox, 'Ingresa un email válido.', 'error');
    return;
  }

  try {
    auth.login({ email, password });
    showMessage(alertBox, 'Sesión iniciada. Redirigiendo...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  } catch (error) {
    showMessage(alertBox, error.message, 'error');
  }
}

// ── Registro ──────────────────────────────────────────────────────

function handleRegisterSubmit(event) {
  event.preventDefault();

  const form     = event.currentTarget;
  const alertBox = document.getElementById('registerAlert');
  const values   = Object.fromEntries(new FormData(form));

  showMessage(alertBox, '');

  if (!values.name.trim() || !values.email.trim() || !values.password.trim() || !values.confirmPassword.trim()) {
    showMessage(alertBox, 'Rellena todos los campos.', 'error');
    return;
  }

  if (!isValidEmail(values.email)) {
    showMessage(alertBox, 'Ingresa un email válido.', 'error');
    return;
  }

  if (values.password !== values.confirmPassword) {
    showMessage(alertBox, 'Las contraseñas deben coincidir.', 'error');
    return;
  }

  try {
    auth.register({ name: values.name, email: values.email, password: values.password });
    showMessage(alertBox, 'Cuenta creada. Redirigiendo...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  } catch (error) {
    showMessage(alertBox, error.message, 'error');
  }
}

// ── Inicialización ────────────────────────────────────────────────

function init() {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm)    loginForm.addEventListener('submit', handleLoginSubmit);
  if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);
}

init();

export { init };
