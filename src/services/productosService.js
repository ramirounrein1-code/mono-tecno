// Servicio de productos y pedidos.
// - Con Supabase configurado: la base de datos en la nube es la fuente de verdad (stock, precios, pedidos)
//   y LocalStorage guarda una copia para que la tienda cargue al instante y funcione sin conexión.
// - Sin Supabase: todo se guarda en LocalStorage (modo demo).
// Toda la app lee y escribe a través de estas funciones.
import { reactive } from 'vue'
import { productosIniciales } from '../data/productosIniciales'
import { imagenPermitida } from './seguridad'
import { nubeActiva, rpc } from './nube'
import { claveAdmin } from './auth'
import { calcularTotales } from './precios'
import { LIMITES_PEDIDO } from '../config/limites'

const CLAVE = 'monotecno_productos_v4'
const CLAVE_PEDIDOS = 'monotecno_pedidos_v1' // pedidos hechos en este navegador (con su código para verlos)
const CLAVE_PEDIDOS_ADMIN = 'monotecno_pedidos_admin' // copia de todos los pedidos para el panel
const CLAVE_ULTIMO = 'monotecno_ultimo_pedido'

// "version" cambia cada vez que llegan datos nuevos: las vistas que leen productos se actualizan solas.
export const catalogo = reactive({ version: 0, sincronizado: false, error: '' })

// ---------- Validación y lectura de la copia local ----------
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
  // Primera visita (o datos corruptos): catálogo inicial hasta que llegue el de la nube.
  guardar(productosIniciales)
  return productosIniciales.map((p) => ({ ...p }))
}

function guardar (productos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(productos))
    return true
  } catch (e) {
    console.warn('No se pudo guardar en LocalStorage:', e)
    return false
  }
}

function avisarCambio () {
  catalogo.version++
}

function leerLista (clave) {
  try {
    const lista = JSON.parse(localStorage.getItem(clave)) || []
    return Array.isArray(lista) ? lista.filter((p) => p && Number.isInteger(p.numero) && Array.isArray(p.items) && p.cliente) : []
  } catch (e) {
    return []
  }
}

function guardarLista (clave, lista) {
  try { localStorage.setItem(clave, JSON.stringify(lista)) } catch (e) { /* sin espacio */ }
}

// ---------- Conversión entre la base (snake_case) y la app (camelCase) ----------
function desdeFila (f) {
  return {
    id: f.id,
    sku: f.sku,
    nombre: f.nombre,
    marca: f.marca,
    categoria: f.categoria,
    condicion: f.condicion,
    precio: f.precio,
    stock: f.stock,
    ...(f.stock_guardado ? { stockGuardado: f.stock_guardado } : {}),
    destacado: f.destacado,
    fechaAlta: f.fecha_alta,
    imagen: f.imagen,
    specs: f.specs,
    descripcion: f.descripcion,
    ficha: Array.isArray(f.ficha) ? f.ficha : [],
    ideal: Array.isArray(f.ideal) ? f.ideal : []
  }
}

function pedidoDesdeFila (f) {
  return {
    numero: Number(f.numero),
    token: f.token,
    estado: f.estado,
    vencido: !!f.vencido,
    fecha: f.fecha,
    items: f.items,
    subtotal: f.subtotal,
    envio: f.envio,
    descuento: f.descuento,
    total: f.total,
    cliente: f.cliente,
    entrega: f.entrega,
    pago: f.pago,
    usuario: f.usuario
  }
}

// Llamada del panel: agrega la clave de la sesión del administrador.
function rpcAdmin (nombre, parametros = {}) {
  return rpc(nombre, { p_clave: claveAdmin(), ...parametros })
}

// ---------- Sincronización con la nube ----------
// Trae el catálogo actualizado (la base libera antes las reservas vencidas).
export async function sincronizarCatalogo () {
  if (!nubeActiva()) {
    expirarPedidosLocales()
    return false
  }
  try {
    const filas = await rpc('catalogo')
    guardar(filas.map(desdeFila))
    catalogo.sincronizado = true
    catalogo.error = ''
    avisarCambio()
    return true
  } catch (e) {
    catalogo.error = e.message
    return false
  }
}

// ---------- READ ----------
export function obtenerProductos () {
  void catalogo.version // dependencia reactiva: al sincronizar, las vistas se vuelven a calcular
  return leer()
}

export function obtenerProducto (id) {
  void catalogo.version
  return leer().find((p) => p.id === id) || null
}

function generarId () {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// Guarda un producto en la nube (si hay) y en la copia local.
async function guardarProducto (producto) {
  if (nubeActiva()) {
    const r = await rpcAdmin('admin_guardar_producto', { p: producto })
    producto = desdeFila(r.producto)
  }
  const productos = leer()
  const i = productos.findIndex((p) => p.id === producto.id)
  if (i === -1) productos.unshift(producto)
  else productos[i] = producto
  if (!guardar(productos) && !nubeActiva()) throw new Error('No hay espacio en el navegador. Probá con una foto más liviana o un link.')
  avisarCambio()
  return producto
}

// ---------- CREATE ----------
export async function crearProducto (datos) {
  return guardarProducto({ ...datos, id: generarId(), fechaAlta: new Date().toISOString().slice(0, 10) })
}

// ---------- UPDATE ----------
export async function actualizarProducto (id, datos) {
  const actual = leer().find((p) => p.id === id)
  if (!actual) return null
  return guardarProducto({ ...actual, ...datos, id })
}

// ---------- DELETE ----------
export async function eliminarProducto (id) {
  if (nubeActiva()) await rpcAdmin('admin_borrar_producto', { p_id: id })
  guardar(leer().filter((p) => p.id !== id))
  avisarCambio()
}

// Comprueba que el SKU no esté repetido (validación del formulario; la base también lo controla).
export function skuDisponible (sku, idActual = null) {
  return !leer().some((p) => p.sku.toUpperCase() === sku.toUpperCase() && p.id !== idActual)
}

// Próximo SKU libre (MT-0001, MT-0002, ...): el formulario de alta lo propone solo.
export function siguienteSku () {
  const max = leer().reduce((m, p) => {
    const n = /^MT-(\d{4})$/.exec(p.sku)
    return n ? Math.max(m, Number(n[1])) : m
  }, 0)
  return 'MT-' + String(max + 1).padStart(4, '0')
}

// Interruptor Con stock / Sin stock del panel: al apagarlo guarda la cantidad para recuperarla después.
export async function alternarDisponible (id) {
  const p = leer().find((x) => x.id === id)
  if (!p) return null
  const cambio = { ...p }
  if (p.stock > 0) {
    cambio.stockGuardado = p.stock
    cambio.stock = 0
  } else {
    cambio.stock = p.stockGuardado > 0 ? p.stockGuardado : 1
    delete cambio.stockGuardado
  }
  return (await guardarProducto(cambio)).stock
}

// Marca o desmarca un producto como destacado (atajo del panel).
export async function alternarDestacado (id) {
  const p = leer().find((x) => x.id === id)
  if (!p) return null
  return (await guardarProducto({ ...p, destacado: !p.destacado })).destacado
}

// Vuelve al catálogo inicial (también en la nube).
export async function restaurarProductos () {
  if (nubeActiva()) {
    await rpcAdmin('admin_restaurar', { p_productos: productosIniciales })
    await sincronizarCatalogo()
  } else {
    guardar(productosIniciales)
    avisarCambio()
  }
  return leer()
}

// ---------- Pedidos ----------
export const ESTADOS_PEDIDO = ['Pendiente de pago', 'Pagado', 'Enviado', 'Entregado', 'Cancelado']
export const ESTADOS_FINALIZADOS = ['Entregado', 'Cancelado']

// Todos los pedidos (panel). Con la nube, es la copia que trae sincronizarPedidosAdmin().
export function obtenerPedidos () {
  return nubeActiva() ? leerLista(CLAVE_PEDIDOS_ADMIN) : leerLista(CLAVE_PEDIDOS)
}

// Pedidos hechos desde este navegador (para "Mis pedidos").
export function pedidosLocales () {
  return leerLista(CLAVE_PEDIDOS)
}

export async function sincronizarPedidosAdmin () {
  if (!nubeActiva()) {
    expirarPedidosLocales()
    return obtenerPedidos()
  }
  const r = await rpcAdmin('admin_pedidos')
  const lista = (r.pedidos || []).map(pedidoDesdeFila)
  guardarLista(CLAVE_PEDIDOS_ADMIN, lista)
  return lista
}

// Actualiza el estado de los pedidos hechos en este navegador (los trae de la nube con su código).
export async function actualizarPedidosLocales () {
  const locales = pedidosLocales()
  if (!nubeActiva() || !locales.length) return locales
  try {
    const remotos = (await rpc('ver_pedidos', { p_lista: locales.filter((p) => p.token).map((p) => ({ numero: p.numero, token: p.token })) })).map(pedidoDesdeFila)
    const lista = locales.map((p) => remotos.find((r) => r.numero === p.numero) || p)
    guardarLista(CLAVE_PEDIDOS, lista)
    return lista
  } catch (e) {
    return locales
  }
}

export function obtenerPedido (numero) {
  const n = Number(numero)
  return pedidosLocales().find((p) => p.numero === n) || leerLista(CLAVE_PEDIDOS_ADMIN).find((p) => p.numero === n) || null
}

// Devuelve (signo = +1) o vuelve a descontar (signo = -1) el stock de un pedido (modo sin nube).
function moverStock (pedido, signo) {
  const productos = leer()
  pedido.items.forEach((item) => {
    const p = productos.find((x) => x.id === item.id)
    if (p) p.stock = Math.max(0, p.stock + signo * item.cantidad)
  })
  guardar(productos)
  avisarCambio()
}

// Reemplaza un pedido en las copias locales (panel y "mis pedidos").
function actualizarCopias (pedido) {
  for (const clave of [CLAVE_PEDIDOS, CLAVE_PEDIDOS_ADMIN]) {
    const lista = leerLista(clave)
    const i = lista.findIndex((x) => x.numero === pedido.numero)
    if (i !== -1) {
      lista[i] = { ...lista[i], ...pedido }
      guardarLista(clave, lista)
    }
  }
}

// Cambia el estado. Si se cancela, los productos vuelven a estar a la venta (y al revés si se "descancela").
export async function actualizarEstadoPedido (numero, estado) {
  if (!ESTADOS_PEDIDO.includes(estado)) return null
  if (nubeActiva()) {
    const r = await rpcAdmin('admin_estado_pedido', { p_numero: numero, p_estado: estado })
    const pedido = pedidoDesdeFila(r.pedido)
    actualizarCopias(pedido)
    await sincronizarCatalogo()
    return pedido
  }
  const pedidos = leerLista(CLAVE_PEDIDOS)
  const p = pedidos.find((x) => x.numero === numero)
  if (!p) return null
  if (estado === 'Cancelado' && p.estado !== 'Cancelado') moverStock(p, +1)
  if (p.estado === 'Cancelado' && estado !== 'Cancelado') moverStock(p, -1)
  p.estado = estado
  p.vencido = false
  guardarLista(CLAVE_PEDIDOS, pedidos)
  return p
}

// Borra un pedido. Si todavía no se había entregado ni cancelado, su stock vuelve a la venta.
export async function eliminarPedido (numero) {
  if (nubeActiva()) {
    await rpcAdmin('admin_borrar_pedido', { p_numero: numero })
    guardarLista(CLAVE_PEDIDOS_ADMIN, leerLista(CLAVE_PEDIDOS_ADMIN).filter((x) => x.numero !== numero))
    await sincronizarCatalogo()
    return true
  }
  const pedidos = leerLista(CLAVE_PEDIDOS)
  const p = pedidos.find((x) => x.numero === numero)
  if (!p) return false
  if (!['Entregado', 'Enviado', 'Cancelado'].includes(p.estado)) moverStock(p, +1)
  guardarLista(CLAVE_PEDIDOS, pedidos.filter((x) => x.numero !== numero))
  return true
}

// Automatización (modo sin nube): los pedidos sin pagar con más de 48 h se cancelan solos y el stock vuelve.
// (En la nube lo hace la base de datos con la función expirar_pedidos.)
export function expirarPedidosLocales () {
  const pedidos = leerLista(CLAVE_PEDIDOS)
  const limite = Date.now() - LIMITES_PEDIDO.horasReserva * 3600 * 1000
  let cambio = false
  pedidos.forEach((p) => {
    if (p.estado === 'Pendiente de pago' && ['transferencia', 'mercadoPago'].includes(p.pago) && new Date(p.fecha).getTime() < limite) {
      moverStock(p, +1)
      p.estado = 'Cancelado'
      p.vencido = true
      cambio = true
    }
  })
  if (cambio) guardarLista(CLAVE_PEDIDOS, pedidos)
}

// Límites contra el acaparamiento de stock (en la nube los vuelve a controlar la base de datos).
function controlarLimites (pedido) {
  const unidades = pedido.items.reduce((t, i) => t + i.cantidad, 0)
  if (pedido.items.some((i) => i.cantidad > LIMITES_PEDIDO.porProducto)) throw new Error(`Podés llevar hasta ${LIMITES_PEDIDO.porProducto} unidades de cada producto por pedido.`)
  if (unidades > LIMITES_PEDIDO.porPedido) throw new Error(`Un pedido puede tener hasta ${LIMITES_PEDIDO.porPedido} unidades en total.`)
  const email = (pedido.cliente.email || '').trim().toLowerCase()
  const pendientes = pedidosLocales().filter((p) => p.estado === 'Pendiente de pago' && (p.cliente.email || '').toLowerCase() === email).length
  if (pendientes >= LIMITES_PEDIDO.pendientesPorEmail) throw new Error(`Ya tenés ${LIMITES_PEDIDO.pendientesPorEmail} pedidos sin pagar. Pagá o cancelá alguno antes de hacer otro.`)
}

// Registra el pedido y descuenta el stock. Devuelve el pedido completo (con número).
export async function registrarPedido (pedido) {
  controlarLimites(pedido)
  let completo
  if (nubeActiva()) {
    // La base calcula precios, envío y descuento con sus datos y aplica los límites.
    const fila = await rpc('crear_pedido', {
      p_items: pedido.items.map((i) => ({ id: i.id, cantidad: i.cantidad })),
      p_cliente: pedido.cliente,
      p_entrega: pedido.entrega,
      p_pago: pedido.pago,
      p_usuario: pedido.usuario
    })
    completo = pedidoDesdeFila(fila)
    sincronizarCatalogo()
  } else {
    const productos = leer()
    for (const item of pedido.items) {
      const p = productos.find((x) => x.id === item.id)
      if (!p || p.stock < item.cantidad) throw new Error(`No hay stock suficiente de "${item.nombre}".`)
    }
    pedido.items.forEach((item) => {
      const p = productos.find((x) => x.id === item.id)
      p.stock -= item.cantidad
    })
    guardar(productos)
    avisarCambio()
    const pedidos = leerLista(CLAVE_PEDIDOS)
    // El número nunca se repite, aunque se borren pedidos: se guarda el último usado.
    const ultimo = Math.max(1000, Number(localStorage.getItem(CLAVE_ULTIMO)) || 0, ...pedidos.map((p) => p.numero))
    const numero = ultimo + 1
    try { localStorage.setItem(CLAVE_ULTIMO, String(numero)) } catch (e) { /* nada */ }
    const subtotal = pedido.items.reduce((t, i) => t + i.precio * i.cantidad, 0)
    completo = { ...pedido, ...calcularTotales(subtotal, pedido.entrega.tipo, pedido.pago), numero, estado: 'Pendiente de pago', fecha: new Date().toISOString() }
  }
  const locales = pedidosLocales()
  locales.unshift({ ...completo, entrega: { ...completo.entrega, descripcion: completo.entrega.descripcion || pedido.entrega.descripcion } })
  guardarLista(CLAVE_PEDIDOS, locales)
  return completo
}
