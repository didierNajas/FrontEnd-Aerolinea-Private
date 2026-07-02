export function renderContactoView(container, state) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Contacto</h3>
          <p class="muted">Envíanos tus dudas o sugerencias. Responderemos a la brevedad.</p>
        </div>
      </div>

      <div id="contactAlert"></div>

      <form id="contactForm" class="form-grid">
        <div class="grid grid-2">
          <label>Nombre<input name="nombre" required /></label>
          <label>Email<input name="email" type="email" required /></label>
        </div>
        <label>Asunto<input name="asunto" required /></label>
        <label>Mensaje<textarea name="mensaje" rows="6" required></textarea></label>

        <div class="flex-actions">
          <button type="submit" class="primary-btn">Enviar</button>
          <button type="button" id="contactClear" class="secondary-btn">Limpiar</button>
        </div>
      </form>
    </div>
  `;

  const alert = container.querySelector('#contactAlert');
  const form = container.querySelector('#contactForm');
  const clear = container.querySelector('#contactClear');

  function validate(values) {
    if (!values.nombre.trim()) return 'El nombre es obligatorio.';
    if (!values.email.trim()) return 'El email es obligatorio.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) return 'Formato de email inválido.';
    if (!values.asunto.trim()) return 'El asunto es obligatorio.';
    if (!values.mensaje.trim()) return 'El mensaje no puede estar vacío.';
    return null;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert.innerHTML = '';
    const payload = Object.fromEntries(new FormData(form));
    const err = validate(payload);
    if (err) {
      alert.innerHTML = `<div class="alert error">${err}</div>`;
      return;
    }

    // UX behavior: show success and offer copy / mailto
    alert.innerHTML = `<div class="alert success">Gracias, tu mensaje ha sido guardado localmente.</div>`;
    // Save to localStorage as a simple inbox
    const inbox = JSON.parse(localStorage.getItem('aerolinea-contactos') || '[]');
    inbox.push({ ...payload, fecha: new Date().toISOString() });
    localStorage.setItem('aerolinea-contactos', JSON.stringify(inbox));

    const actions = document.createElement('div');
    actions.className = 'card';
    actions.style.marginTop = '10px';
    actions.innerHTML = `
      <div class="card-header">
        <div>
          <h4>Resumen del mensaje</h4>
        </div>
      </div>
      <p><strong>Nombre:</strong> ${payload.nombre}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Asunto:</strong> ${payload.asunto}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${payload.mensaje.replace(/\n/g, '<br/>')}</p>
      <div style="margin-top:8px">
        <button id="copyMessage" class="secondary-btn">Copiar mensaje</button>
        <a id="mailtoLink" class="primary-btn" style="text-decoration:none;display:inline-block;margin-left:8px;color:inherit;">Enviar por email</a>
      </div>
    `;

    // attach actions
    container.appendChild(actions);
    const copyBtn = actions.querySelector('#copyMessage');
    const mailto = actions.querySelector('#mailtoLink');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(`${payload.asunto}\n\n${payload.mensaje}`).then(() => {
        alert.innerHTML = `<div class="alert success">Mensaje copiado al portapapeles.</div>`;
      });
    });

    mailto.href = `mailto:${encodeURIComponent(payload.email)}?subject=${encodeURIComponent(payload.asunto)}&body=${encodeURIComponent(payload.mensaje)}`;
    mailto.textContent = 'Abrir en cliente';

    form.reset();
  });

  clear.addEventListener('click', () => {
    form.reset();
    alert.innerHTML = '';
  });
}

export default renderContactoView;
