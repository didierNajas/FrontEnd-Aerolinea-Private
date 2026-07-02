import { auth } from './auth.js';

function removeStaticAuthLinks(container) {
  const staticAuthLinks = container.querySelectorAll('a[href="login.html"], a[href="registro.html"]');
  staticAuthLinks.forEach((link) => link.remove());
}

function buildHeaderActions() {
  const user = auth.getCurrentUser();
  const topnavActions = document.querySelector('.topnav-actions');
  if (!topnavActions) return;

  removeStaticAuthLinks(topnavActions);

  let authActions = topnavActions.querySelector('.auth-actions');
  if (!authActions) {
    authActions = document.createElement('div');
    authActions.className = 'auth-actions';
    topnavActions.appendChild(authActions);
  }

  authActions.innerHTML = '';

  if (user) {
    const profile = document.createElement('span');
    profile.className = 'user-chip';
    profile.textContent = `Bienvenido ${user.name} (${user.role === 'admin' ? 'Admin' : 'Usuario'})`;

    const logout = document.createElement('button');
    logout.className = 'ghost-btn';
    logout.textContent = 'Cerrar sesión';
    logout.addEventListener('click', () => {
      auth.logout();
      window.location.reload();
    });

    authActions.appendChild(profile);
    if (user.role === 'admin') {
      const adminLink = document.createElement('a');
      adminLink.className = 'secondary-btn';
      adminLink.href = 'panel.html';
      adminLink.textContent = 'Panel admin';
      authActions.appendChild(adminLink);
    }
    authActions.appendChild(logout);
    return;
  }

  const login = document.createElement('a');
  login.href = 'login.html';
  login.className = 'ghost-btn';
  login.textContent = 'Iniciar sesión';

  const register = document.createElement('a');
  register.href = 'registro.html';
  register.className = 'secondary-btn';
  register.textContent = 'Registrarse';

  authActions.appendChild(login);
  authActions.appendChild(register);
}

auth.initialize();
buildHeaderActions();
