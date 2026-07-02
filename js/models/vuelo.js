export class Vuelo {
  constructor({ id, origen, destino, fechaHora, estado }) {
    this.id = id;
    this.origen = origen;
    this.destino = destino;
    this.fechaHora = fechaHora;
    this.estado = estado;
  }
}
