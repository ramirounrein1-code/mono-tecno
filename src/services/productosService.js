// Servicio de productos y pedidos: CRUD con persistencia en LocalStorage.
// Toda la app lee y escribe a través de estas funciones.
import { productosIniciales } from '../data/productosIniciales'

const CLAVE = 'monotecno_productos_v4'
const CLAVE_PEDIDOS = 'monotecno_pedidos_v1'

function leer () {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (crudo) return JSON.parse(crudo)
  } catch (e) {
    console.warn('No se pudo leer LocalStorage:', e)
  }
  // Primera visita (o datos corruptos): cargamos el catálogo inicial.
  guardar(productosIniciales)
  return productosIniciales.map((p) => ({ ...p }))
}

function guardar (productos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(productos))
    return true
  } catch (e) {
    // Puede pasar si se suben muchas fotos grandes y se llena el espacio del navegador.
    console.warn('No se pudo guardar en LocalStorage:', e)
    return false
  }
}

function generarId () {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// READ
export function obtenerProductos () {
  return leer()
}

export function obtenerProducto (id) {
  return leer().find((p) => p.id === id) || null
}

// CREATE
export function crearProducto (datos) {
  const productos = leer()
  const nuevo = { ...datos, id: generarId(), fechaAlta: new Date().toISOString().slice(0, 10) }
  productos.unshift(nuevo)
  if (!guardar(productos)) throw new Error('No hay espacio en el navegador. Probá con una foto más liviana o un link.')
  return nuevo
}

// UPDATE
export function actualizarProducto (id, datos) {
  const productos = leer()
  const i = productos.findIndex((p) => p.id === id)
  if (i === -1) return null
  productos[i] = { ...productos[i], ...datos, id }
  if (!guardar(productos)) throw new Error('No hay espacio en el navegador. Probá con una foto más liviana o un link.')
  return productos[i]
}

// DELETE
export function eliminarProducto (id) {
  guardar(leer().filter((p) => p.id !== id))
}

// Comprueba que el SKU no esté repetido (validación del formulario).
export function skuDisponible (sku, idActual = null) {
  return !leer().some((p) => p.sku.toUpperCase() === sku.toUpperCase() && p.id !== idActual)
}

// Vuelve al catálogo inicial.
export function restaurarProductos () {
  guardar(productosIniciales)
  return productosIniciales.map((p) => ({ ...p }))
}

// ---------- Pedidos ----------
export function obtenerPedidos () {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PEDIDOS)) || []
  } catch (e) {
    return []
  }
}

// Cambia el estado de un pedido (lo usa el panel de administración).
export const ESTADOS_PEDIDO = ['Pendiente de pago', 'Pagado', 'Enviado', 'Entregado', 'Cancelado']

export function actualizarEstadoPedido (numero, estado) {
  const pedidos = obtenerPedidos()
  const p = pedidos.find((x) => x.numero === numero)
  if (!p) return null
  p.estado = estado
  try {
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos))
  } catch (e) { /* sin espacio */ }
  return p
}

export function obtenerPedido (numero) {
  return obtenerPedidos().find((p) => p.numero === Number(numero)) || null
}

// Guarda el pedido y descuenta el stock de cada producto.
export function registrarPedido (pedido) {
  const productos = leer()
  pedido.items.forEach((item) => {
    const p = productos.find((x) => x.id === item.id)
    if (p) p.stock = Math.max(0, p.stock - item.cantidad)
  })
  guardar(productos)
  const pedidos = obtenerPedidos()
  const numero = 1000 + pedidos.length + 1
  const completo = { ...pedido, numero, estado: 'Pendiente de pago', fecha: new Date().toISOString() }
  pedidos.unshift(completo)
  try {
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos))
  } catch (e) { /* sin espacio: el pedido igual se muestra al cliente */ }
  return completo
}
