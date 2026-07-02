import { pasajerosService } from '../services/pasajerosService.js';

export async function renderPasajerosView(container, state) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Listado de pasajeros</h3>
          <p class="muted">Administra los clientes registrados en la aerolínea.</p>
        </div>
        <button class="primary-btn" id="nuevoPasajeroBtn">Nuevo pasajero</button>
      </div>
      <div class="toolbar">
        <input id="pasajeroSearch" type="search" placeholder="Buscar por nombre, documento o correo" />
        <button class="secondary-btn" id="clearPasajeroFilter">Limpiar</button>
      </div>
      <div id="pasajerosAlert"></div>
      <div id="pasajerosTable"></div>
    </div>
  `;

  const alert = container.querySelector('#pasajerosAlert');
  const table = container.querySelector('#pasajerosTable');
  const nuevoBtn = container.querySelector('#nuevoPasajeroBtn');
  const searchInput = container.querySelector('#pasajeroSearch');
  const clearBtn = container.querySelector('#clearPasajeroFilter');

  nuevoBtn.addEventListener('click', () => {
    state.activeForm = 'pasajero';
    state.pasajeroEditId = null;
    renderPasajeroForm(container, state);
  });

  searchInput.addEventListener('input', () => cargarPasajeros(table, alert, state, searchInput.value));
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    cargarPasajeros(table, alert, state, '');
  });

  await cargarPasajeros(table, alert, state, searchInput.value);
}

async function cargarPasajeros(table, alert, state, search = '') {
  try {
    const pasajeros = await pasajerosService.listar();
    const filtrados = pasajeros.filter((pasajero) => {
      const term = search.toLowerCase();
      return !term || `${pasajero.nombre} ${pasajero.apellido} ${pasajero.documento} ${pasajero.email}`.toLowerCase().includes(term);
    });

    if (!filtrados.length) {
      table.innerHTML = '<div class="empty-state">Aún no hay pasajeros registrados.</div>';
      return;
    }

    table.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${filtrados
            .map(
              (p) => `
                <tr>
                  <td>${p.nombre} ${p.apellido}</td>
                  <td>${p.documento}</td>
                  <td>${p.email}</td>
                  <td>
                    <button class="small-btn" data-edit="${p.id}">Editar</button>
                    <button class="small-btn danger-btn" data-delete="${p.id}">Eliminar</button>
                  </td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;

    table.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeForm = 'pasajero';
        state.pasajeroEditId = Number(btn.getAttribute('data-edit'));
        renderPasajeroForm(table.parentElement, state);
      });
    });

    table.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await pasajerosService.eliminar(btn.getAttribute('data-delete'));
          alert.innerHTML = '<div class="alert success">Pasajero eliminado correctamente.</div>';
          await cargarPasajeros(table, alert, state, search);
        } catch (error) {
          alert.innerHTML = `<div class="alert error">${error.message}</div>`;
        }
      });
    });
  } catch (error) {
    table.innerHTML = `<div class="alert error">${error.message}</div>`;
  }
}

function renderPasajeroForm(container, state) {
  const formContainer = document.createElement('div');
  formContainer.className = 'card';

  formContainer.innerHTML = `
    <div class="card-header">
      <div>
        <h3>${state.pasajeroEditId ? 'Editar pasajero' : 'Crear pasajero'}</h3>
        <p class="muted">Completa los datos para continuar.</p>
      </div>
      <button class="secondary-btn" id="cancelPasajeroBtn">Volver</button>
    </div>
    <form id="pasajeroForm" class="form-grid">
      <div class="grid grid-2">
        <label>Nombre<input name="nombre" required /></label>
        <label>Apellido<input name="apellido" required /></label>
      </div>
      <div class="grid grid-2">
        <label>Documento<input name="documento" required /></label>
        <label>Email<input name="email" type="email" required /></label>
      </div>
      <div class="flex-actions">
        <button type="submit" class="primary-btn">Guardar</button>
        <button type="button" id="cancelPasajeroBtn2" class="secondary-btn">Cancelar</button>
      </div>
    </form>
  `;

  container.innerHTML = '';
  container.appendChild(formContainer);

  const cancelButtons = [
    formContainer.querySelector('#cancelPasajeroBtn'),
    formContainer.querySelector('#cancelPasajeroBtn2'),
  ];

  cancelButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      state.activeForm = null;
      await renderPasajerosView(container, state);
    });
  });

  const form = formContainer.querySelector('#pasajeroForm');
  if (state.pasajeroEditId) {
    pasajerosService.obtener(state.pasajeroEditId).then((pasajero) => {
      form.nombre.value = pasajero.nombre || '';
      form.apellido.value = pasajero.apellido || '';
      form.documento.value = pasajero.documento || '';
      form.email.value = pasajero.email || '';
    }).catch(() => {
      formContainer.querySelector('.card-header').insertAdjacentHTML('afterend', '<div class="alert error">No se pudo cargar el pasajero.</div>');
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form));

    try {
      if (state.pasajeroEditId) {
        await pasajerosService.actualizar(state.pasajeroEditId, payload);
      } else {
        await pasajerosService.crear(payload);
      }
      state.activeForm = null;
      state.pasajeroEditId = null;
      await renderPasajerosView(container, state);
    } catch (error) {
      form.insertAdjacentHTML('beforebegin', `<div class="alert error">${error.message}</div>`);
    }
  });
}
