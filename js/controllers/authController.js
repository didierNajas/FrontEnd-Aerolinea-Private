import { auth } from '../auth.js';

function showMessage(container, message, type = 'success') {
  container.innerHTML = `<div class="alert ${type}">${message}</div>`;
}

function validEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const alertBox = document.getElementById('loginAlert');
  const { email, password } = Object.fromEntries(new FormData(form));

  showMessage(alertBox, '');

  if (!email.trim() || !password.trim()) {
    showMessage(alertBox, 'Por favor completa todos los campos.', 'error');
    return;
  }

  if (!validEmail(email)) {
    showMessage(alertBox, 'Ingresa un email válido.', 'error');
    return;
  }

  try {
    auth.login({ email, password });
    showMessage(alertBox, 'Has iniciado sesión correctamente. Redirigiendo...', 'success');
    window.setTimeout(() => {
      window.location.href = 'index.html';
    }, 900);
  } catch (error) {
    showMessage(alertBox, error.message, 'error');
  }
}

function handleRegisterSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const alertBox = document.getElementById('registerAlert');
  const values = Object.fromEntries(new FormData(form));

  showMessage(alertBox, '');

  if (!values.name.trim() || !values.email.trim() || !values.password.trim() || !values.confirmPassword.trim()) {
    showMessage(alertBox, 'Rellena todos los campos.', 'error');
    return;
  }

  if (!validEmail(values.email)) {
    showMessage(alertBox, 'Ingresa un email válido.', 'error');
    return;
  }

  if (values.password !== values.confirmPassword) {
    showMessage(alertBox, 'Las contraseñas deben coincidir.', 'error');
    return;
  }

  try {
    auth.register({ name: values.name, email: values.email, password: values.password });
    showMessage(alertBox, 'Cuenta creada con éxito. Redirigiendo a la página principal...', 'success');
    window.setTimeout(() => {
      window.location.href = 'index.html';
    }, 900);
  } catch (error) {
    showMessage(alertBox, error.message, 'error');
  }
}

function init() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }
}

init();

export { init };
