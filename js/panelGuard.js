import { auth } from './auth.js';

auth.initialize();
const currentUser = auth.getCurrentUser();
if (!currentUser || currentUser.role !== 'admin') {
  alert('Debes iniciar sesión como administrador para acceder al panel.');
  window.location.href = 'login.html';
}
