import { vuelosService } from '../services/vuelosService.js';

export async function renderVuelosView(container, state) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Listado de vuelos</h3>
          <p class="muted">Consulta y gestiona los trayectos programados.</p>
        </div>
        <button class="primary-btn" id="nuevoVueloBtn">Nuevo vuelo</button>
      </div>
      <div class="toolbar">
        <input id="vueloSearch" type="search" placeholder="Buscar por origen, destino o estado" />
        <select id="estadoFilter">
          <option value="">Todos los estados</option>
          <option value="PROGRAMADO">PROGRAMADO</option>
          <option value="EN_VUELO">EN VUELO</option>
          <option value="ATERRIZADO">ATERRIZADO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
        <button class="secondary-btn" id="clearVueloFilter">Limpiar</button>
      </div>
      <div id="vuelosAlert"></div>
      <div id="vuelosTable"></div>
    </div>
  `;

  const alert = container.querySelector('#vuelosAlert');
  const table = container.querySelector('#vuelosTable');
  const nuevoBtn = container.querySelector('#nuevoVueloBtn');
  const searchInput = container.querySelector('#vueloSearch');
  const estadoFilter = container.querySelector('#estadoFilter');
  const clearBtn = container.querySelector('#clearVueloFilter');

  nuevoBtn.addEventListener('click', () => {
    state.activeForm = 'vuelo';
    state.vueloEditId = null;
    renderVueloForm(container, state);
  });

  searchInput.addEventListener('input', () => cargarVuelos(table, alert, state, searchInput.value, estadoFilter.value));
  estadoFilter.addEventListener('change', () => cargarVuelos(table, alert, state, searchInput.value, estadoFilter.value));
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    estadoFilter.value = '';
    cargarVuelos(table, alert, state, '', '');
  });

  await cargarVuelos(table, alert, state, searchInput.value, estadoFilter.value);
}

async function cargarVuelos(table, alert, state, search = '', estado = '') {
  try {
    const vuelos = await vuelosService.listar();
    const filtrados = vuelos.filter((vuelo) => {
      const term = search.toLowerCase();
      const matchesText = !term || `${vuelo.origen} ${vuelo.destino} ${vuelo.estado}`.toLowerCase().includes(term);
      const matchesEstado = !estado || vuelo.estado === estado;
      return matchesText && matchesEstado;
    });

    if (!filtrados.length) {
      table.innerHTML = '<div class="empty-state">No hay vuelos disponibles por el momento.</div>';
      return;
    }

    table.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Fecha y hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${filtrados
            .map(
              (v) => `
                <tr>
                  <td>${v.origen} → ${v.destino}</td>
                  <td>${v.fechaHora}</td>
                  <td><span class="badge">${v.estado}</span></td>
                  <td>
                    <button class="small-btn" data-edit="${v.id}">Editar</button>
                    <button class="ghost-btn" data-delete="${v.id}">Eliminar</button>
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
        state.activeForm = 'vuelo';
        state.vueloEditId = Number(btn.getAttribute('data-edit'));
        renderVueloForm(table.parentElement, state);
      });
    });

    table.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await vuelosService.eliminar(btn.getAttribute('data-delete'));
          alert.innerHTML = '<div class="alert success">Vuelo eliminado correctamente.</div>';
          await cargarVuelos(table, alert, state, search, estado);
        } catch (error) {
          alert.innerHTML = `<div class="alert error">${error.message}</div>`;
        }
      });
    });
  } catch (error) {
    table.innerHTML = `<div class="alert error">${error.message}</div>`;
  }
}

function renderVueloForm(container, state) {
  const formContainer = document.createElement('div');
  formContainer.className = 'card';

  formContainer.innerHTML = `
    <div class="card-header">
      <div>
        <h3>${state.vueloEditId ? 'Editar vuelo' : 'Crear vuelo'}</h3>
        <p class="muted">Define la ruta y el estado del viaje.</p>
      </div>
      <button class="secondary-btn" id="cancelVueloBtn">Volver</button>
    </div>
    <form id="vueloForm" class="form-grid">
      <div class="grid grid-2">
        <label>Origen<input name="origen" required /></label>
        <label>Destino<input name="destino" required /></label>
      </div>
      <label>Fecha y hora<input name="fechaHora" type="datetime-local" required /></label>
      <label>Estado
        <select name="estado">
          <option value="PROGRAMADO">PROGRAMADO</option>
          <option value="EN_VUELO">EN VUELO</option>
          <option value="ATERRIZADO">ATERRIZADO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </label>
      <div class="flex-actions">
        <button type="submit" class="primary-btn">Guardar</button>
        <button type="button" id="cancelVueloBtn2" class="secondary-btn">Cancelar</button>
      </div>
    </form>
  `;

  container.innerHTML = '';
  container.appendChild(formContainer);

  const cancelButtons = [
    formContainer.querySelector('#cancelVueloBtn'),
    formContainer.querySelector('#cancelVueloBtn2'),
  ];

  cancelButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      state.activeForm = null;
      await renderVuelosView(container, state);
    });
  });

  const form = formContainer.querySelector('#vueloForm');
  if (state.vueloEditId) {
    vuelosService.obtener(state.vueloEditId).then((vuelo) => {
      form.origen.value = vuelo.origen || '';
      form.destino.value = vuelo.destino || '';
      form.fechaHora.value = vuelo.fechaHora ? vuelo.fechaHora.replace(' ', 'T') : '';
      form.estado.value = vuelo.estado || 'PROGRAMADO';
    }).catch(() => {
      formContainer.querySelector('.card-header').insertAdjacentHTML('afterend', '<div class="alert error">No se pudo cargar el vuelo.</div>');
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form));

    try {
      if (state.vueloEditId) {
        await vuelosService.actualizar(state.vueloEditId, payload);
      } else {
        await vuelosService.crear(payload);
      }
      state.activeForm = null;
      state.vueloEditId = null;
      await renderVuelosView(container, state);
    } catch (error) {
      form.insertAdjacentHTML('beforebegin', `<div class="alert error">${error.message}</div>`);
    }
  });
}
