/**
 * navbar.js
 * Navbar público compartido: inyecta el markup HTML y activa comportamientos.
 *
 *   injectNavbar(activeHref) → llama renderNavbar() + initNavToggle() + initScrollReveal()
 *
 * Exporta `injectNavbar` para que cada página lo llame pasando su propio href activo.
 * Se importa como módulo desde cada página pública junto a authHeader.js y publicController.js.
 * No tiene dependencias externas.
 */

// ── Datos de navegación ───────────────────────────────────────────

/** Entradas del menú principal. Orden canónico de izquierda a derecha. */
const NAV_LINKS = [
  { href: 'alojamientos.html', label: 'Alojamientos' },
  { href: 'vuelos.html',       label: 'Vuelos'        },
  { href: 'paquetes.html',     label: 'Paquetes'      },
  { href: 'ofertas.html',      label: 'Ofertas'       },
  { href: 'circuitos.html',    label: 'Circuitos'     },
  { href: 'actividades.html',  label: 'Actividades'   },
  { href: 'traslados.html',    label: 'Traslados'     },
  { href: 'asistencias.html',  label: 'Asistencias'   },
  { href: 'contacto.html',     label: 'Contacto'      },
];

// ── Renderizado del navbar ────────────────────────────────────────

/**
 * Construye el elemento `<header class="topnav">` e inserta al principio de `.app-shell`.
 * @param {string} activeHref - Nombre de archivo de la página activa (ej. 'vuelos.html').
 */
function renderNavbar(activeHref) {
  const shell = document.querySelector('.app-shell');
  if (!shell) return;

  // No inyectar si ya existe un topnav en el HTML estático
  if (shell.querySelector('.topnav')) return;

  const linksHTML = NAV_LINKS.map(({ href, label }) => {
    const isActive = href === activeHref ? ' active' : '';
    return `<a href="${href}" class="nav-pill${isActive}">${label}</a>`;
  }).join('\n          ');

  const header = document.createElement('header');
  header.className = 'topnav';
  header.innerHTML = `
    <a class="brand" href="index.html" aria-label="Inicio">
      <div class="brand-icon">✈</div>
      <div>
        <h1>Aerolínea</h1>
        <p>Viajes y servicios profesionales</p>
      </div>
    </a>

    <nav class="topnav-links" id="mainNav" aria-label="Navegación principal">
      ${linksHTML}
    </nav>

    <div class="topnav-actions" id="topnavActions">
      <!-- authHeader.js inyecta aquí los botones de sesión -->
    </div>

    <button
      class="nav-toggle"
      id="navToggle"
      aria-label="Abrir menú"
      aria-expanded="false"
      aria-controls="mainNav">
      ☰
    </button>
  `;

  shell.insertAdjacentElement('afterbegin', header);
}

// ── Hamburger toggle ──────────────────────────────────────────────

/**
 * Activa el botón hamburger para mostrar/ocultar los nav-links en mobile.
 * Requiere:
 *   #navToggle → botón hamburger
 *   #mainNav   → <nav> con los links
 */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('mainNav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? '✕' : '☰';
  });
}

// ── Scroll reveal ─────────────────────────────────────────────────

/**
 * Observa las tarjetas (.sample-card) y añade la clase `visible`
 * cuando entran al viewport, activando la transición CSS de animations.css.
 * Las tarjetas aparecen de forma escalonada según su posición en el DOM.
 */
function initScrollReveal() {
  const cards = document.querySelectorAll('.sample-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const index = Array.from(cards).indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), index * 120);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  cards.forEach((card) => observer.observe(card));
}

// ── API pública ───────────────────────────────────────────────────

/**
 * Punto de entrada principal.
 * Renderiza el navbar, activa el toggle mobile y el scroll reveal.
 *
 * @param {string} [activeHref=''] - href de la página activa (ej. 'vuelos.html').
 *
 * @example
 * // En cada página pública:
 * import { injectNavbar } from './core/navbar.js';
 * injectNavbar('vuelos.html');
 */
export function injectNavbar(activeHref = '') {
  renderNavbar(activeHref);
  initNavToggle();
  initScrollReveal();
}
