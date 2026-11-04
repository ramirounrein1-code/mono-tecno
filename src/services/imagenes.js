// Fotos incluidas en el proyecto. En los datos se guardan como "asset:<nombre>"
// para que LocalStorage no dependa del nombre que webpack le pone a cada archivo.
import { imagenPermitida } from './seguridad'

const fotos = {
  'rtx-3060': require('../assets/productos/rtx-3060.webp'),
  'rtx-3070': require('../assets/productos/rtx-3070.webp'),
  'rx-6700-xt': require('../assets/productos/rx-6700-xt.webp'),
  'rx-6600': require('../assets/productos/rx-6600.webp'),
  'rtx-3060-ti': require('../assets/productos/rtx-3060-ti.webp'),
  'gtx-1660-super': require('../assets/productos/gtx-1660-super.webp'),
  'rtx-3080': require('../assets/productos/rtx-3080.webp'),
  'rx-6600-xt': require('../assets/productos/rx-6600-xt.webp'),
  'ryzen-5-5600x': require('../assets/productos/ryzen-5-5600x.webp'),
  'ryzen-5-7600': require('../assets/productos/ryzen-5-7600.webp'),
  'core-i5': require('../assets/productos/core-i5.webp'),
  'ddr4-ripjaws': require('../assets/productos/ddr4-ripjaws.webp'),
  'ddr5-vengeance': require('../assets/productos/ddr5-vengeance.webp'),
  'ssd-980-pro': require('../assets/productos/ssd-980-pro.webp'),
  'fuente-modular': require('../assets/productos/fuente-modular.webp'),
  'cooler-hyper-212': require('../assets/productos/cooler-hyper-212.webp'),
  'motherboard-b550': require('../assets/productos/motherboard-b550.webp')
}

// Devuelve una URL usable en <img src>: foto del proyecto, URL externa o imagen subida (data URL).
export function resolverImagen (imagen) {
  // Solo fotos del proyecto, links https o fotos subidas: cualquier otra cosa se ignora.
  if (!imagenPermitida(imagen)) return ''
  if (imagen.startsWith('asset:')) {
    const f = fotos[imagen.slice(6)]
    return f ? (f.default || f) : ''
  }
  return imagen
}

// Comprueba que un link abra de verdad una imagen (espera hasta 8 segundos).
export function probarImagen (url) {
  return new Promise((resolve) => {
    const img = new Image()
    const t = setTimeout(() => { img.src = ''; resolve(false) }, 8000)
    img.onload = () => { clearTimeout(t); resolve(img.naturalWidth > 0) }
    img.onerror = () => { clearTimeout(t); resolve(false) }
    img.referrerPolicy = 'no-referrer'
    img.src = url
  })
}

// Achica una foto subida desde la computadora, le pone fondo blanco (las PNG/WEBP transparentes
// no quedan negras) y la devuelve como data URL en WEBP, que pesa menos y entra cómoda en LocalStorage.
export function prepararFotoSubida (archivo, maxAncho = 640, maxAlto = 480) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    lector.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('El archivo no es una imagen válida.'))
      img.onload = () => {
        const escala = Math.min(1, maxAncho / img.width, maxAlto / img.height)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * escala)
        canvas.height = Math.round(img.height * escala)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const webp = canvas.toDataURL('image/webp', 0.85)
        // Algunos navegadores viejos no saben guardar WEBP: ahí queda en JPEG.
        resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = lector.result
    }
    lector.readAsDataURL(archivo)
  })
}
