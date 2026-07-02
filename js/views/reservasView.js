import { pasajerosService } from '../services/pasajerosService.js';
import { vuelosService } from '../services/vuelosService.js';
import { reservasService } from '../services/reservasService.js';

function normalizeDateTime(fechaHora) {
  const normalized = fechaHora.includes('T') ? fechaHora : fechaHora.replace(' ', 'T');
  return new Date(normalized);
}

function formatDateForGoogle(date) {
  return date.toISOString().replace(/[-:\.]/g, '').slice(0, 15) + 'Z';
}

function buildGoogleCalendarUrl({ title, details, location, start, end }) {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: title,
    details,
    location,
    dates: `${formatDateForGoogle(start)}/${formatDateForGoogle(end)}`,
  });
  return `${base}&${params.toString()}`;
}

function buildOutlookCalendarUrl({ title, details, location, start, end }) {
  const base = 'https://outlook.live.com/owa/?path=/calendar/action/compose';
  const params = new URLSearchParams({
    subject: title,
    body: details,
    location,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  });
  return `${base}&${params.toString()}`;
}

function renderCalendarLinks(container, pasajero, vuelo, claseAsiento) {
  const startDate = normalizeDateTime(vuelo.fechaHora);
  const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 2);
  const title = `Reserva Aerolínea: ${vuelo.origen} → ${vuelo.destino}`;
  const details = `Pasajero: ${pasajero.nombre} ${pasajero.apellido}\nEmail: ${pasajero.email}\nClase: ${claseAsiento || 'N/A'}`;
  const location = `${vuelo.origen} → ${vuelo.destino}`;

  const googleLink = buildGoogleCalendarUrl({ title, details, location, start: startDate, end: endDate });
  const outlookLink = buildOutlookCalendarUrl({ title, details, location, start: startDate, end: endDate });

  let links = container.querySelector('.calendar-sync');
  if (!links) {
    links = document.createElement('div');
    links.className = 'calendar-sync';
    container.appendChild(links);
  }

  links.innerHTML = `
    <div class="card-actions">
      <a class="primary-btn" href="${googleLink}" target="_blank" rel="noopener noreferrer">Agregar a Google Calendar</a>
      <a class="secondary-btn" href="${outlookLink}" target="_blank" rel="noopener noreferrer">Agregar a Outlook</a>
    </div>
  `;
}

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

  const alert = container.querySelector('#reservaAlert');
  const formContainer = container.querySelector('#reservaFormContainer');
  await renderReservaForm(formContainer, alert, state);
}

async function renderReservaForm(formContainer, alert, state) {
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
              ${pasajeros
                .map((p) => `<option value="${p.id}">${p.nombre} ${p.apellido}</option>`)
                .join('')}
            </select>
          </label>
          <label>Vuelo
            <select name="vueloId" required>
              <option value="">Seleccione un vuelo</option>
              ${vuelos
                .map((v) => `<option value="${v.id}">${v.origen} → ${v.destino} · ${v.fechaHora}</option>`)
                .join('')}
            </select>
          </label>
        </div>
        <label>Clase de asiento
          <select name="claseAsiento" required>
            <option value="ECONOMICA">ECONOMICA</option>
            <option value="EJECUTIVA">EJECUTIVA</option>
            <option value="PRIMERA_CLASE">PRIMERA CLASE</option>
          </select>
        </label>
        <div class="flex-actions">
          <button type="submit" class="primary-btn">Crear reserva</button>
          <button type="button" id="clearReservaForm" class="secondary-btn">Limpiar</button>
        </div>
      </form>
    `;

    const form = formContainer.querySelector('#reservaForm');
    const preview = formContainer.querySelector('#reservaPreview');
    const clearBtn = formContainer.querySelector('#clearReservaForm');

    function actualizarPreview() {
      const pasajeroId = form.pasajeroId.value;
      const vueloId = form.vueloId.value;
      const clase = form.claseAsiento.value;
      const pasajero = pasajeros.find((item) => String(item.id) === pasajeroId);
      const vuelo = vuelos.find((item) => String(item.id) === vueloId);

      if (!pasajero && !vuelo && !clase) {
        preview.innerHTML = '<h4>Resumen rápido</h4><p>Selecciona un pasajero, un vuelo y una clase para ver el detalle aquí.</p>';
        return;
      }

      preview.innerHTML = `
        <h4>Resumen rápido</h4>
        <p><strong>Pasajero:</strong> ${pasajero ? `${pasajero.nombre} ${pasajero.apellido}` : 'Sin seleccionar'}</p>
        <p><strong>Vuelo:</strong> ${vuelo ? `${vuelo.origen} → ${vuelo.destino}` : 'Sin seleccionar'}</p>
        <p><strong>Clase:</strong> ${clase || 'Sin seleccionar'}</p>
      `;
    }

    ['pasajeroId', 'vueloId', 'claseAsiento'].forEach((name) => {
      form[name].addEventListener('change', actualizarPreview);
      form[name].addEventListener('input', actualizarPreview);
    });

    clearBtn.addEventListener('click', () => {
      form.reset();
      actualizarPreview();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form));
      payload.pasajeroId = Number(payload.pasajeroId);
      payload.vueloId = Number(payload.vueloId);

      const selectedPasajero = pasajeros.find((item) => item.id === payload.pasajeroId);
      const selectedVuelo = vuelos.find((item) => item.id === payload.vueloId);

      try {
        const result = await reservasService.crear(payload);
        alert.innerHTML = `
          <div class="alert success">
            Reserva creada correctamente. ID: ${result.resumen.reservaId}
          </div>
        `;
        if (selectedPasajero && selectedVuelo) {
          renderCalendarLinks(formContainer, selectedPasajero, selectedVuelo, payload.claseAsiento);
        }
        form.reset();
        actualizarPreview();
      } catch (error) {
        alert.innerHTML = `<div class="alert error">${error.message}</div>`;
      }
    });
  } catch (error) {
    formContainer.innerHTML = `<div class="alert error">${error.message}</div>`;
  }
}
