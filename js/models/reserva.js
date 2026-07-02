export class Reserva {
  constructor({ id, pasajeroId, vueloId, claseAsiento }) {
    this.id = id;
    this.pasajeroId = pasajeroId;
    this.vueloId = vueloId;
    this.claseAsiento = claseAsiento;
  }
}
