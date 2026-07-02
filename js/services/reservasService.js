import { api } from './api.js';
import { Reserva } from '../models/reserva.js';

// Backend requirements for reservas:
// - POST /reservas            -> crea reserva con { pasajeroId, vueloId, claseAsiento }
//   responde con datos de reserva guardada y cualquier metadata necesaria
export const reservasService = {
  crear: async (reserva) => {
    const data = await api.post('/reservas', reserva);
    return {
      reserva: new Reserva(data),
      resumen: data,
    };
  },
};
