import { api } from './api.js';
import { Pasajero } from '../models/pasajero.js';

// Backend requirements for pasajeros:
// - GET /pasajeros            -> lista todos los pasajeros
// - GET /pasajeros/{id}       -> obtiene un pasajero por id
// - POST /pasajeros           -> crea pasajero con { nombre, apellido, documento, email }
// - PUT /pasajeros/{id}       -> actualiza pasajero
// - DELETE /pasajeros/{id}    -> elimina pasajero
export const pasajerosService = {
  listar: async () => {
    const data = await api.get('/pasajeros');
    return data.map((item) => new Pasajero(item));
  },

  obtener: async (id) => {
    const data = await api.get(`/pasajeros/${id}`);
    return new Pasajero(data);
  },

  crear: async (pasajero) => {
    const data = await api.post('/pasajeros', pasajero);
    return new Pasajero(data);
  },

  actualizar: async (id, pasajero) => {
    const data = await api.put(`/pasajeros/${id}`, pasajero);
    return new Pasajero(data);
  },

  eliminar: async (id) => {
    await api.delete(`/pasajeros/${id}`);
  },
};
