// Servicio de productos y pedidos: CRUD con persistencia en LocalStorage.
// Toda la app lee y escribe a través de estas funciones.
import { productosIniciales } from '../data/productosIniciales'
import { imagenPermitida } from './seguridad'

const CLAVE = 'monotecno_productos_v4'
const CLAVE_PEDIDOS = 'monotecno_pedidos_v1'
const CLAVE_ULTIMO = 'monotecno_ultimo_pedido'

// Un producto guardado tiene que tener la forma correcta; si no, se descarta (datos rotos o manipulados).
function productoValido (p) {
  return p && typeof p.id === 'string' && typeof p.nombre === 'string' && typeof p.sku === 'string' &&
    Number.isFinite(p.precio) && p.precio >= 0 && Number.isInteger(p.stock) && p.stock >= 0
}

// Si la foto guardada no es de un tipo permitido, se saca la foto (el producto queda).
function limpiarImagen (p) {
  return p.imagen && !imagenPermitida(p.imagen) ? { ...p, imagen: '' } : p
}

function leer () {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (crudo) {
      const lista = JSON.parse(crudo)
      if (Array.isArray(lista)) return lista.filter(productoValido).map(limpiarImagen)
    }
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
    const lista = JSON.parse(localStorage.getItem(CLAVE_PEDIDOS)) || []
    return Array.isArray(lista) ? lista.filter((p) => p && Number.isInteger(p.numero) && Array.isArray(p.items) && p.cliente) : []
  } catch (e) {
    return []
  }
}

// Cambia el estado de un pedido (lo usa el panel de administración).
export const ESTADOS_PEDIDO = ['Pendiente de pago', 'Pagado', 'Enviado', 'Entregado', 'Cancelado']

export const ESTADOS_FINALIZADOS = ['Entregado', 'Cancelado']

function guardarPedidos (pedidos) {
  try {
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos))
  } catch (e) { /* sin espacio */ }
}

// Devuelve (signo = +1) o vuelve a descontar (signo = -1) el stock de los productos de un pedido.
function moverStock (pedido, signo) {
  const productos = leer()
  pedido.items.forEach((item) => {
    const p = productos.find((x) => x.id === item.id)
    if (p) p.stock = Math.max(0, p.stock + signo * item.cantidad)
  })
  guardar(productos)
}

// Cambia el estado. Si se cancela, los productos vuelven a estar a la venta (y al revés si se "descancela").
export function actualizarEstadoPedido (numero, estado) {
  const pedidos = obtenerPedidos()
  const p = pedidos.find((x) => x.numero === numero)
  if (!p || !ESTADOS_PEDIDO.includes(estado)) return null
  if (estado === 'Cancelado' && p.estado !== 'Cancelado') moverStock(p, +1)
  if (p.estado === 'Cancelado' && estado !== 'Cancelado') moverStock(p, -1)
  p.estado = estado
  guardarPedidos(pedidos)
  return p
}

// Borra un pedido de la lista. Si todavía no se había entregado ni cancelado, su stock vuelve a la venta.
export function eliminarPedido (numero) {
  const pedidos = obtenerPedidos()
  const p = pedidos.find((x) => x.numero === numero)
  if (!p) return false
  if (!['Entregado', 'Enviado', 'Cancelado'].includes(p.estado)) moverStock(p, +1)
  guardarPedidos(pedidos.filter((x) => x.numero !== numero))
  return true
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
  // El número nunca se repite, aunque se borren pedidos: se guarda el último usado.
  const ultimo = Math.max(1000, Number(localStorage.getItem(CLAVE_ULTIMO)) || 0, ...pedidos.map((p) => p.numero))
  const numero = ultimo + 1
  try { localStorage.setItem(CLAVE_ULTIMO, String(numero)) } catch (e) { /* nada */ }
  const completo = { ...pedido, numero, estado: 'Pendiente de pago', fecha: new Date().toISOString() }
  pedidos.unshift(completo)
  try {
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos))
  } catch (e) { /* sin espacio: el pedido igual se muestra al cliente */ }
  return completo
}
