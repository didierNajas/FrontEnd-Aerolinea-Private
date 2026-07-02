const STORAGE_KEY = 'aerolinea-admin-notice';

export async function renderNoticiasView(container, state) {
  const currentNotice = localStorage.getItem(STORAGE_KEY) || '';

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Comunicación pública</h3>
          <p class="muted">Define un mensaje breve que aparecerá en las páginas de usuario.</p>
        </div>
      </div>
      <div id="noticiasAlert"></div>
      <form id="noticiasForm" class="form-grid">
        <label>Mensaje para usuarios<textarea name="mensaje" rows="5" required>${currentNotice}</textarea></label>
        <div class="flex-actions">
          <button type="submit" class="primary-btn">Guardar mensaje</button>
          <button type="button" id="clearNotice" class="secondary-btn">Borrar mensaje</button>
        </div>
      </form>
      <div class="preview-card" id="noticePreview">
        <h4>Vista previa</h4>
        <p>${currentNotice || 'No hay mensaje público configurado aún.'}</p>
      </div>
    </div>
  `;

  const form = container.querySelector('#noticiasForm');
  const alert = container.querySelector('#noticiasAlert');
  const preview = container.querySelector('#noticePreview p');
  const clearBtn = container.querySelector('#clearNotice');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    const message = payload.mensaje.trim();

    if (!message) {
      alert.innerHTML = '<div class="alert error">El mensaje público no puede estar vacío.</div>';
      return;
    }

    localStorage.setItem(STORAGE_KEY, message);
    alert.innerHTML = '<div class="alert success">Mensaje público guardado correctamente.</div>';
    preview.textContent = message;
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    form.mensaje.value = '';
    alert.innerHTML = '<div class="alert success">Mensaje público borrado.</div>';
    preview.textContent = 'No hay mensaje público configurado aún.';
  });
}
