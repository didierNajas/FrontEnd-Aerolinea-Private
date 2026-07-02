import { renderPasajerosView } from '../views/pasajerosView.js';
import { renderVuelosView } from '../views/vuelosView.js';
import { renderReservasView } from '../views/reservasView.js';
import { renderNoticiasView } from '../views/noticiasView.js';
import { pasajerosService } from '../services/pasajerosService.js';
import { vuelosService } from '../services/vuelosService.js';
import { auth } from '../auth.js';

const state = {
  currentView: 'pasajeros',
  activeForm: null,
  pasajeroEditId: null,
  vueloEditId: null,
};

const elements = {
  viewTitle: document.getElementById('viewTitle'),
  viewBreadcrumb: document.getElementById('viewBreadcrumb'),
  viewContainer: document.getElementById('viewContainer'),
  overviewGrid: document.getElementById('overviewGrid'),
  navButtons: Array.from(document.querySelectorAll('.nav-btn')),
  refreshButton: document.getElementById('refreshBtn'),
  logoutButton: document.getElementById('logoutBtn'),
};

function setActiveNav(view) {
  elements.navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
}

function showOverview(pasajerosCount, vuelosCount) {
  elements.overviewGrid.innerHTML = `
    <article class="overview-card">
      <span class="overview-label">Pasajeros</span>
      <strong>${pasajerosCount}</strong>
      <small>registrados</small>
    </article>
    <article class="overview-card">
      <span class="overview-label">Vuelos</span>
      <strong>${vuelosCount}</strong>
      <small>programados</small>
    </article>
    <article class="overview-card">
      <span class="overview-label">Estado</span>
      <strong class="status-ok">En línea</strong>
      <small>API operativa</small>
    </article>
  `;
}

function showOverviewError(errorMessage) {
  elements.overviewGrid.innerHTML = `
    <article class="overview-card warning">
      <span class="overview-label">Conexión</span>
      <strong>Sin conexión</strong>
      <small>${errorMessage}</small>
    </article>
  `;
}

async function loadOverview() {
  try {
    const [pasajeros, vuelos] = await Promise.all([
      pasajerosService.listar(),
      vuelosService.listar(),
    ]);
    showOverview(pasajeros.length, vuelos.length);
  } catch (error) {
    showOverviewError(error.message);
  }
}

async function renderCurrentView() {
  elements.viewContainer.innerHTML = '<div class="empty-state">Cargando contenido...</div>';
  await loadOverview();

  switch (state.currentView) {
    case 'pasajeros':
      elements.viewTitle.textContent = 'Pasajeros';
      if (elements.viewBreadcrumb) elements.viewBreadcrumb.textContent = 'Panel · Gestión';
      await renderPasajerosView(elements.viewContainer, state);
      break;
    case 'vuelos':
      elements.viewTitle.textContent = 'Vuelos';
      if (elements.viewBreadcrumb) elements.viewBreadcrumb.textContent = 'Panel · Gestión';
      await renderVuelosView(elements.viewContainer, state);
      break;
    case 'reservas':
      elements.viewTitle.textContent = 'Reservas';
      if (elements.viewBreadcrumb) elements.viewBreadcrumb.textContent = 'Panel · Gestión';
      await renderReservasView(elements.viewContainer, state);
      break;
    case 'noticias':
      elements.viewTitle.textContent = 'Comunicaciones';
      if (elements.viewBreadcrumb) elements.viewBreadcrumb.textContent = 'Panel · Configuración';
      await renderNoticiasView(elements.viewContainer, state);
      break;
    default:
      elements.viewTitle.textContent = 'Pasajeros';
      if (elements.viewBreadcrumb) elements.viewBreadcrumb.textContent = 'Panel · Gestión';
      await renderPasajerosView(elements.viewContainer, state);
  }
}

function switchView(viewName) {
  state.currentView = viewName;
  state.activeForm = null;
  state.pasajeroEditId = null;
  state.vueloEditId = null;
  setActiveNav(viewName);
  renderCurrentView();
}

function initNavigation() {
  elements.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      switchView(button.dataset.view);
    });
  });
}

function initActions() {
  elements.refreshButton.addEventListener('click', renderCurrentView);

  if (!elements.logoutButton) {
    return;
  }

  elements.logoutButton.addEventListener('click', () => {
    auth.logout();
    window.location.href = 'login.html';
  });
}

function init() {
  setActiveNav(state.currentView);
  initNavigation();
  initActions();
  renderCurrentView();
}

init();

export { init };
