// Consumo de API externa con Fetch: cotizaciones del dólar en Argentina (https://dolarapi.com).
// Se usa para mostrar la cotización y convertir los precios de USD a pesos.

const URL_API = 'https://dolarapi.com/v1/dolares'
const CLAVE_CACHE = 'monotecno_dolar_cache'
const DURACION_CACHE = 30 * 60 * 1000 // 30 minutos

export async function obtenerCotizaciones () {
  // 1) Si hay una cotización reciente guardada, la usamos y evitamos otra llamada.
  try {
    const cache = JSON.parse(localStorage.getItem(CLAVE_CACHE))
    if (cache && Date.now() - cache.guardado < DURACION_CACHE) return cache.datos
  } catch (e) { /* cache inválido: se ignora */ }

  // 2) Pedimos los datos a la API.
  const respuesta = await fetch(URL_API)
  if (!respuesta.ok) throw new Error(`La API respondió con estado ${respuesta.status}`)
  const json = await respuesta.json()

  // 3) Nos quedamos con las cotizaciones que mostramos.
  const buscadas = ['oficial', 'blue', 'tarjeta']
  const datos = json
    .filter((d) => buscadas.includes(d.casa))
    .map((d) => ({
      casa: d.casa,
      nombre: d.nombre,
      compra: d.compra,
      venta: d.venta,
      actualizado: d.fechaActualizacion
    }))

  localStorage.setItem(CLAVE_CACHE, JSON.stringify({ guardado: Date.now(), datos }))
  return datos
}

export function formatearPesos (valor) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor)
}

export function formatearDolares (valor) {
  return 'US$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(valor)
}
