// Cálculos de precios del checkout (subtotal, envío, descuentos y total).
import { TIENDA } from '../config/tienda'

export function costoEnvio (idEnvio) {
  const envio = TIENDA.envios.find((e) => e.id === idEnvio)
  return envio ? envio.costo : 0
}

export function descuentoPorPago (metodo) {
  if (metodo === 'transferencia') return TIENDA.pagos.transferencia.descuento
  if (metodo === 'efectivo') return TIENDA.pagos.efectivo.descuento
  return 0
}

// El descuento se aplica sobre los productos, no sobre el envío.
export function calcularTotales (subtotal, idEnvio, metodo) {
  const envio = costoEnvio(idEnvio)
  const descuento = Math.round(subtotal * descuentoPorPago(metodo))
  return { subtotal, envio, descuento, total: subtotal - descuento + envio }
}

export function precioConDescuento (precio, porcentaje = TIENDA.pagos.transferencia.descuento) {
  return Math.round(precio * (1 - porcentaje))
}
