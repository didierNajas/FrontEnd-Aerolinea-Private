/**
 * contactoController.js
 * Monta el formulario de contacto en #contactoFormCard (contacto.html).
 *
 * Usa renderContactoView de contactoView.js para mantener la lógica
 * de validación y persistencia en localStorage centralizada en una sola capa.
 */

import { renderContactoView } from '../views/contactoView.js';

const card = document.getElementById('contactoFormCard');

if (card) {
  renderContactoView(card, {});
}
