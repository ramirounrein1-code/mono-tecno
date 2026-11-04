// Carrito de compras: estado compartido (reactive) + persistencia en LocalStorage.
// Lo usan la barra de navegación (contador), las tarjetas, el detalle y la página del carrito.
import { reactive } from 'vue'
import { obtenerProductos } from './productosService'
import { LIMITES_PEDIDO } from '../config/limites'

const CLAVE = 'monotecno_carrito_v1'

function leer () {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || []
  } catch (e) {
    return []
  }
}

export const carrito = reactive({
  items: leer() // [{ id, cantidad }]
})

function guardar () {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(carrito.items))
  } catch (e) { /* sin LocalStorage el carrito dura hasta recargar */ }
}

export function cantidadTotal () {
  return carrito.items.reduce((t, i) => t + i.cantidad, 0)
}

export function cantidadDe (id) {
  const item = carrito.items.find((i) => i.id === id)
  return item ? item.cantidad : 0
}

// Agrega unidades sin superar el stock disponible. Devuelve la cantidad realmente agregada.
// Máximo de unidades de un producto que se pueden tener en el carrito (stock y límite por pedido).
export function maximoPara (producto) {
  return Math.min(producto.stock, LIMITES_PEDIDO.porProducto)
}

// Por qué no se pudo agregar (para mostrarle al cliente un mensaje claro).
export function motivoNoAgregado (producto) {
  const enCarrito = cantidadDe(producto.id)
  if (enCarrito >= producto.stock) return 'Ya tenés en el carrito todas las unidades disponibles.'
  if (enCarrito >= LIMITES_PEDIDO.porProducto) return `Podés llevar hasta ${LIMITES_PEDIDO.porProducto} unidades de cada producto por pedido.`
  return `Un pedido puede tener hasta ${LIMITES_PEDIDO.porPedido} unidades en total.`
}

// Agrega unidades sin superar el stock ni los límites por pedido (evitan que alguien acapare el stock).
export function agregar (producto, cantidad = 1) {
  const enCarrito = cantidadDe(producto.id)
  const lugarEnPedido = LIMITES_PEDIDO.porPedido - cantidadTotal()
  const posible = Math.max(0, Math.min(cantidad, maximoPara(producto) - enCarrito, lugarEnPedido))
  if (!posible) return 0
  const item = carrito.items.find((i) => i.id === producto.id)
  if (item) item.cantidad += posible
  else carrito.items.push({ id: producto.id, cantidad: posible })
  guardar()
  return posible
}

export function cambiarCantidad (id, cantidad) {
  const item = carrito.items.find((i) => i.id === id)
  if (!item) return
  if (cantidad <= 0) quitar(id)
  else {
    const otros = cantidadTotal() - item.cantidad
    item.cantidad = Math.min(cantidad, LIMITES_PEDIDO.porProducto, LIMITES_PEDIDO.porPedido - otros)
    guardar()
  }
}

export function quitar (id) {
  carrito.items = carrito.items.filter((i) => i.id !== id)
  guardar()
}

export function vaciar () {
  carrito.items = []
  guardar()
}

// Une el carrito con los datos actuales de cada producto (si alguno se borró, se descarta).
export function detalleCarrito () {
  const productos = obtenerProductos()
  return carrito.items
    .map((i) => {
      const producto = productos.find((p) => p.id === i.id)
      return producto ? { producto, cantidad: Math.min(i.cantidad, maximoPara(producto)) } : null
    })
    .filter((i) => i && i.cantidad > 0)
}
