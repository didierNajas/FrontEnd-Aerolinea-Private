/**
 * reservasView.js
 * Vista del panel para crear reservas.
 * Incluye formulario reactivo con vista previa y enlaces a Google Calendar / Outlook.
 */

import { pasajerosService } from '../services/pasajerosService.js';
import { vuelosService }    from '../services/vuelosService.js';
import { reservasService }  from '../services/reservasService.js';
import { parseDateTime, toGoogleCalendarDate } from '../core/utils.js';

// ── Helpers de calendario ─────────────────────────────────────────

function buildGoogleCalendarUrl({ title, details, location, start, end }) {
  const params = new URLSearchParams({
    text:     title,
    details,
    location,
    dates: `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`,
  });
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params}`;
}

function buildOutlookCalendarUrl({ title, details, location, start, end }) {
  const params = new URLSearchParams({
    subject:  title,
    body:     details,
    location,
    startdt:  start.toISOString(),
    enddt:    end.toISOString(),
  });
  return `https://outlook.live.com/owa/?path=/calendar/action/compose&${params}`;
}

function renderCalendarLinks(container, pasajero, vuelo, claseAsiento) {
  const start    = parseDateTime(vuelo.fechaHora);
  const end      = new Date(start.getTime() + 1000 * 60 * 60 * 2);   // +2 h
  const title    = `Reserva Aerolínea: ${vuelo.origen} → ${vuelo.destino}`;
  const details  = `Pasajero: ${pasajero.nombre} ${pasajero.apellido}\nEmail: ${pasajero.email}\nClase: ${claseAsiento || 'N/A'}`;
  const location = `${vuelo.origen} → ${vuelo.destino}`;

  let links = container.querySelector('.calendar-sync');
  if (!links) {
    links = document.createElement('div');
    links.className = 'calendar-sync';
    container.appendChild(links);
  }

  links.innerHTML = `
    <div class="card-actions">
      <a class="primary-btn"
         href="${buildGoogleCalendarUrl({ title, details, location, start, end })}"
         target="_blank" rel="noopener noreferrer">
        Agregar a Google Calendar
      </a>
      <a class="secondary-btn"
         href="${buildOutlookCalendarUrl({ title, details, location, start, end })}"
         target="_blank" rel="noopener noreferrer">
        Agregar a Outlook
      </a>
    </div>
  `;
}

// ── Vista principal ───────────────────────────────────────────────

export async function renderReservasView(container, state) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Gestión de reservas</h3>
          <p class="muted">Asigna pasajeros a vuelos con una clase de asiento.</p>
        </div>
      </div>
      <div id="reservaAlert"></div>
      <div id="reservaFormContainer"></div>
    </div>
  `;

  const alertEl       = container.querySelector('#reservaAlert');
  const formContainer = container.querySelector('#reservaFormContainer');
  await renderReservaForm(formContainer, alertEl, state);
}

// ── Formulario de reserva ─────────────────────────────────────────

async function renderReservaForm(formContainer, alertEl, state) {
  try {
    const [pasajeros, vuelos] = await Promise.all([
      pasajerosService.listar(),
      vuelosService.listar(),
    ]);

    formContainer.innerHTML = `
      <div class="preview-card" id="reservaPreview">
        <h4>Resumen rápido</h4>
        <p>Selecciona un pasajero, un vuelo y una clase para ver el detalle aquí.</p>
      </div>
      <form id="reservaForm" class="form-grid">
        <div class="grid grid-2">
          <label>Pasajero
            <select name="pasajeroId" required>
              <option value="">Seleccione un pasajero</option>
              ${pasajeros.map((p) => `<option value="${p.id}">${p.nombre} ${p.apellido}</option>`).join('')}
            </select>
          </label>
          <label>Vuelo
            <select name="vueloId" required>
              <option value="">Seleccione un vuelo</option>
              ${vuelos.map((v) => `<option value="${v.id}">${v.origen} → ${v.destino} · ${v.fechaHora}</option>`).join('')}
            </select>
          </label>
        </div>
        <label>Clase de asiento
          <select name="claseAsiento" required>
            <option value="ECONOMICA">ECONÓMICA</option>
            <option value="EJECUTIVA">EJECUTIVA</option>
            <option value="PRIMERA_CLASE">PRIMERA CLASE</option>
          </select>
        </label>
        <div class="flex-actions">
          <button type="submit"  class="primary-btn">Crear reserva</button>
          <button type="button"  class="secondary-btn" id="clearReservaForm">Limpiar</button>
        </div>
      </form>
    `;

    const form     = formContainer.querySelector('#reservaForm');
    const preview  = formContainer.querySelector('#reservaPreview');
    const clearBtn = formContainer.querySelector('#clearReservaForm');

    // Vista previa reactiva
    function updatePreview() {
      const pasajero = pasajeros.find((p) => String(p.id) === form.pasajeroId.value);
      const vuelo    = vuelos.find((v)    => String(v.id) === form.vueloId.value);
      const clase    = form.claseAsiento.value;

      if (!pasajero && !vuelo) {
        preview.innerHTML = '<h4>Resumen rápido</h4><p>Selecciona un pasajero, un vuelo y una clase para ver el detalle aquí.</p>';
        return;
      }

      preview.innerHTML = `
        <h4>Resumen rápido</h4>
        <p><strong>Pasajero:</strong> ${pasajero ? `${pasajero.nombre} ${pasajero.apellido}` : '—'}</p>
        <p><strong>Vuelo:</strong>    ${vuelo    ? `${vuelo.origen} → ${vuelo.destino}` : '—'}</p>
        <p><strong>Clase:</strong>    ${clase    || '—'}</p>
      `;
    }

    ['pasajeroId', 'vueloId', 'claseAsiento'].forEach((name) => {
      form[name].addEventListener('change', updatePreview);
    });

    clearBtn.addEventListener('click', () => {
      form.reset();
      updatePreview();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const payload        = Object.fromEntries(new FormData(form));
      payload.pasajeroId   = Number(payload.pasajeroId);
      payload.vueloId      = Number(payload.vueloId);
      const selPasajero    = pasajeros.find((p) => p.id === payload.pasajeroId);
      const selVuelo       = vuelos.find((v)    => v.id === payload.vueloId);

      try {
        const result = await reservasService.crear(payload);
        alertEl.innerHTML = `<div class="alert success">Reserva creada. ID: ${result.resumen.reservaId}</div>`;

        if (selPasajero && selVuelo) {
          renderCalendarLinks(formContainer, selPasajero, selVuelo, payload.claseAsiento);
        }

        form.reset();
        updatePreview();
      } catch (error) {
        alertEl.innerHTML = `<div class="alert error">${error.message}</div>`;
      }
    });

  } catch (error) {
    formContainer.innerHTML = `<div class="alert error">${error.message}</div>`;
  }
}
