const ADMIN_NOTICE_KEY = 'aerolinea-admin-notice';

function getTopNavigation() {
  return document.querySelector('.topnav');
}

function createAdminBanner(message) {
  const banner = document.createElement('section');
  banner.className = 'admin-banner';
  banner.innerHTML = `
    <div class="banner-content">
      <span class="banner-pill">Aviso del administrador</span>
      <p>${message}</p>
    </div>
  `;
  return banner;
}

function createMessage(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert ${type === 'error' ? 'error' : 'success'} page-action-notice`;
  alert.innerHTML = message;
  return alert;
}

function showPageNotice(message, type = 'success') {
  const header = getTopNavigation();
  if (!header) {
    return;
  }

  const previousNotice = document.querySelector('.page-action-notice');
  if (previousNotice) {
    previousNotice.remove();
  }

  const notice = createMessage(message, type);
  header.insertAdjacentElement('afterend', notice);

  window.setTimeout(() => {
    notice.remove();
  }, 6000);
}

function createCardDetailsPanel(card, title, description) {
  let detailsPanel = card.querySelector('.card-details');
  if (!detailsPanel) {
    detailsPanel = document.createElement('div');
    detailsPanel.className = 'card-details';
    card.appendChild(detailsPanel);
  }

  detailsPanel.innerHTML = `
    <div class="alert success">
      <strong>Detalles de ${title}</strong>
      <p>${description}</p>
      <p>Contacta con nosotros en <a href="contacto.html">Contacto</a> para completar tu solicitud.</p>
    </div>
  `;

  detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createActionFeedback(card, message) {
  let feedbackPanel = card.querySelector('.card-feedback');
  if (!feedbackPanel) {
    feedbackPanel = document.createElement('div');
    feedbackPanel.className = 'card-feedback';
    card.appendChild(feedbackPanel);
  }

  feedbackPanel.innerHTML = `<div class="alert success">${message}</div>`;
  feedbackPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function getSearchableCards() {
  return Array.from(document.querySelectorAll('.sample-card, .overview-card, .card, .hero-panel'));
}

function resetSearchResults() {
  getSearchableCards().forEach((card) => {
    card.style.display = '';
  });
}

function buildSearchPanel() {
  const existingPanel = document.querySelector('.search-panel');
  if (existingPanel) {
    return existingPanel;
  }

  const header = getTopNavigation();
  if (!header) {
    return null;
  }

  const panel = document.createElement('section');
  panel.className = 'search-panel';
  panel.innerHTML = `
    <div class="search-panel-inner">
      <input id="globalSearchInput" type="search" placeholder="Busca por destinos, servicios o palabras clave..." />
      <div class="search-panel-actions">
        <button id="searchClearBtn" class="secondary-btn">Limpiar</button>
        <button id="searchCloseBtn" class="ghost-btn">Cerrar</button>
      </div>
    </div>
  `;

  header.insertAdjacentElement('afterend', panel);

  const searchInput = panel.querySelector('#globalSearchInput');
  const closeButton = panel.querySelector('#searchCloseBtn');
  const clearButton = panel.querySelector('#searchClearBtn');

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      performSearch(searchInput.value);
    }
  });

  closeButton.addEventListener('click', () => {
    panel.classList.remove('active');
    resetSearchResults();
  });

  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    resetSearchResults();
    showPageNotice('Búsqueda reiniciada.', 'success');
  });

  return panel;
}

function openSearchPanel() {
  const panel = buildSearchPanel();
  if (!panel) {
    return;
  }

  panel.classList.add('active');
  const searchInput = panel.querySelector('#globalSearchInput');
  searchInput.value = '';
  searchInput.focus();
}

function performSearch(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const cards = getSearchableCards();

  if (!normalizedQuery) {
    showPageNotice('Ingresa un término para buscar.', 'error');
    return;
  }

  let matchCount = 0;

  cards.forEach((card) => {
    const content = card.textContent.toLowerCase();
    const matched = content.includes(normalizedQuery);
    card.style.display = matched ? '' : 'none';

    if (matched) {
      matchCount += 1;
    }
  });

  if (matchCount > 0) {
    showPageNotice(`Resultados encontrados: ${matchCount}`, 'success');
  } else {
    showPageNotice('No se encontraron resultados. Intenta otro término.', 'success');
  }
}

function normalizeLabel(button) {
  return button.textContent.trim().toLowerCase();
}

function removeInlineAlertHandler(button) {
  const existingHandler = button.getAttribute('onclick');
  if (existingHandler && existingHandler.includes('alert(')) {
    button.removeAttribute('onclick');
  }
}

function isContactButton(label) {
  return /contacto|contactar|atención|seguridad/.test(label);
}

function isDetailsButton(label) {
  return /detalle|detalles|info|ver detalles|más información/.test(label);
}

function isPolicyButton(label) {
  return /términos|política|seguridad/.test(label);
}

function isSearchButton(label) {
  return /^buscar$|buscar actividades|buscar traslados|buscar vuelos|buscar paquetes|buscar ofertas|ver paquetes|ver circuitos/.test(label);
}

function isActionButton(label) {
  return /reservar|agendar|solicitar|seleccionar|crear paquete|coordinando|añadir|marcar prioridad|solicitud|buscar traslados/.test(label);
}

function bindButtonAction(button) {
  if (button.dataset.publicActionBound) {
    return;
  }

  button.dataset.publicActionBound = 'true';
  removeInlineAlertHandler(button);

  const label = normalizeLabel(button);
  const card = button.closest('.sample-card') || button.closest('.hero-panel') || document.body;
  const title = card.querySelector('h3')?.textContent.trim() || card.querySelector('h1')?.textContent.trim() || 'esta acción';
  const description = card.querySelector('p')?.textContent.trim() || 'Más información disponible en la página de contacto.';

  if (isContactButton(label) && !button.closest('nav')) {
    button.addEventListener('click', () => {
      window.location.href = 'contacto.html';
    });
    return;
  }

  if (isDetailsButton(label)) {
    button.addEventListener('click', () => {
      createCardDetailsPanel(card, title, description);
    });
    return;
  }

  if (isPolicyButton(label)) {
    button.addEventListener('click', () => {
      showPageNotice('Consulta nuestra política en la página de <a href="contacto.html">Contacto</a>.', 'success');
    });
    return;
  }

  if (isSearchButton(label)) {
    button.addEventListener('click', () => {
      openSearchPanel();
      showPageNotice(`Abriendo barra de búsqueda para <strong>${button.textContent.trim()}</strong>.`, 'success');
    });
    return;
  }

  if (isActionButton(label)) {
    button.addEventListener('click', () => {
      createActionFeedback(card, `Hemos registrado tu solicitud para <strong>${title}</strong>. Nuestro equipo te contactará pronto.`);
    });
    return;
  }

  button.addEventListener('click', () => {
    showPageNotice(`Acción ejecutada: <strong>${button.textContent.trim()}</strong>`, 'success');
  });
}

function collectPublicButtons() {
  const buttons = Array.from(document.querySelectorAll('button:not([type="submit"]):not([type="reset"])'));
  const anchors = Array.from(document.querySelectorAll('a.primary-btn, a.secondary-btn, a.ghost-btn, a.small-btn'));
  const legacyButtons = Array.from(document.querySelectorAll('[onclick*="alert("]'));
  return [...buttons, ...anchors, ...legacyButtons].filter((item, index, arr) => arr.indexOf(item) === index);
}

function attachPublicButtonActions() {
  collectPublicButtons().forEach((button) => {
    if (button.closest('form') && !button.closest('.sample-card')) {
      return;
    }

    if (button.id === 'contactClear') {
      return;
    }

    bindButtonAction(button);
  });
}

export function initPublicUI() {
  const header = getTopNavigation();
  if (!header) {
    return;
  }

  const adminNotice = localStorage.getItem(ADMIN_NOTICE_KEY);
  if (adminNotice) {
    header.insertAdjacentElement('afterend', createAdminBanner(adminNotice));
  }

  attachPublicButtonActions();
}
