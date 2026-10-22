// Carrito de compras: estado compartido (reactive) + persistencia en LocalStorage.
// Lo usan la barra de navegación (contador), las tarjetas, el detalle y la página del carrito.
import { reactive } from 'vue'
import { obtenerProductos } from './productosService'

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
export function agregar (producto, cantidad = 1) {
  const enCarrito = cantidadDe(producto.id)
  const posible = Math.max(0, Math.min(cantidad, producto.stock - enCarrito))
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
    item.cantidad = cantidad
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
      return producto ? { producto, cantidad: Math.min(i.cantidad, producto.stock) } : null
    })
    .filter((i) => i && i.cantidad > 0)
}
