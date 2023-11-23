const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  fecha_venta: String, // Ajustar según sea necesario, preferiblemente usar Date
  metodo_pago: String,
  total_venta: Number,
  total_pedido: Number,
  nombre: String,
  telefono: String,
  documento: String,
  correo: String,
  productos: [{
    _id: Number,
    nombre: String,
    precio: Number,
  }],
});


const Venta = mongoose.model('Venta', ventaSchema);

module.exports = Venta;

