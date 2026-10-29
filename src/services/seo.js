// SEO: título, descripción, link canónico, vista previa para redes y datos estructurados (JSON-LD) de cada página.
// Google lee estas etiquetas cuando renderiza la página, y los datos estructurados le permiten mostrar
// precio, stock y estado del producto directamente en los resultados.
import { TIENDA } from '../config/tienda'

export const SITIO = 'https://mono-tecno-tienda.vercel.app'
const DESCRIPCION_BASE = 'Placas de video usadas revisadas una por una, procesadores, memorias y servicio técnico de PC en Ituzaingó, zona oeste. Envíos a todo el país.'

function etiqueta (selector, crear) {
  let el = document.head.querySelector(selector)
  if (!el) { el = crear(); document.head.appendChild(el) }
  return el
}
function meta (atributo, nombre, valor) {
  const el = etiqueta(`meta[${atributo}="${nombre}"]`, () => { const m = document.createElement('meta'); m.setAttribute(atributo, nombre); return m })
  el.setAttribute('content', valor)
}

// Datos estructurados propios de la página (se reemplazan en cada navegación).
function jsonLd (datos) {
  const previo = document.getElementById('ld-pagina')
  if (previo) previo.remove()
  if (!datos) return
  const s = document.createElement('script')
  s.type = 'application/ld+json'
  s.id = 'ld-pagina'
  s.textContent = JSON.stringify(datos)
  document.head.appendChild(s)
}

export function aplicarSeo ({ titulo, descripcion, ruta = '/', imagen, indexar = true, datos = null }) {
  const tituloCompleto = titulo ? `${titulo} | mono.tecno` : 'mono.tecno · Placas de video y servicio técnico de PC en Ituzaingó'
  const desc = (descripcion || DESCRIPCION_BASE).slice(0, 160)
  const url = SITIO + ruta
  const img = imagen ? (imagen.startsWith('http') ? imagen : SITIO + imagen) : SITIO + '/og-imagen.jpg'
  document.title = tituloCompleto
  meta('name', 'description', desc)
  meta('name', 'robots', indexar ? 'index, follow, max-image-preview:large' : 'noindex, nofollow')
  meta('property', 'og:title', tituloCompleto)
  meta('property', 'og:description', desc)
  meta('property', 'og:url', url)
  meta('property', 'og:image', img)
  meta('name', 'twitter:title', tituloCompleto)
  meta('name', 'twitter:description', desc)
  meta('name', 'twitter:image', img)
  etiqueta('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l }).href = url
  jsonLd(datos)
}

const CONDICION = { Nuevo: 'NewCondition', Usado: 'UsedCondition', Reacondicionado: 'RefurbishedCondition' }

// Ficha de producto para Google (nombre, marca, precio en pesos, stock y estado).
export function datosProducto (p, imagen) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nombre,
    sku: p.sku,
    brand: { '@type': 'Brand', name: p.marca },
    category: p.categoria,
    description: p.descripcion,
    image: imagen && imagen.startsWith('http') ? imagen : SITIO + (imagen || '/og-imagen.jpg'),
    itemCondition: 'https://schema.org/' + (CONDICION[p.condicion] || 'UsedCondition'),
    offers: {
      '@type': 'Offer',
      url: `${SITIO}/productos/${p.id}`,
      priceCurrency: 'ARS',
      price: p.precio,
      availability: 'https://schema.org/' + (p.stock > 0 ? 'InStock' : 'OutOfStock'),
      itemCondition: 'https://schema.org/' + (CONDICION[p.condicion] || 'UsedCondition'),
      seller: { '@type': 'Organization', name: TIENDA.nombre }
    }
  }
}

// Descripciones de cada sección (las que no son de un producto).
export const DESCRIPCIONES = {
  inicio: DESCRIPCION_BASE,
  listado: 'Catálogo de mono.tecno: placas de video NVIDIA y AMD usadas y revisadas, procesadores Ryzen e Intel, memorias, discos y fuentes. Precios en pesos y descuento por transferencia.',
  armado: 'Armá tu PC en mono.tecno: elegí procesador, placa de video, memoria y fuente y te avisamos al momento si son compatibles y cuánto suma todo.',
  comparar: 'Compará placas de video y componentes lado a lado con su ficha técnica completa.',
  acerca: 'mono.tecno es un servicio técnico de PC en Ituzaingó: reparación, limpieza, armado a medida y venta de placas de video revisadas con garantía.'
}
