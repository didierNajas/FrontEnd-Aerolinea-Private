import { api } from './api.js';
import { Vuelo } from '../models/vuelo.js';

// Backend requirements for vuelos:
// - GET /vuelos               -> lista todos los vuelos
// - GET /vuelos/{id}          -> obtiene un vuelo por id
// - POST /vuelos              -> crea vuelo con { origen, destino, fechaHora, estado }
// - PUT /vuelos/{id}          -> actualiza vuelo
// - DELETE /vuelos/{id}       -> elimina vuelo
export const vuelosService = {
  listar: async () => {
    const data = await api.get('/vuelos');
    return data.map((item) => new Vuelo(item));
  },

  obtener: async (id) => {
    const data = await api.get(`/vuelos/${id}`);
    return new Vuelo(data);
  },

  crear: async (vuelo) => {
    const data = await api.post('/vuelos', vuelo);
    return new Vuelo(data);
  },

  actualizar: async (id, vuelo) => {
    const data = await api.put(`/vuelos/${id}`, vuelo);
    return new Vuelo(data);
  },

  eliminar: async (id) => {
    await api.delete(`/vuelos/${id}`);
  },
};
