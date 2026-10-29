// Herramientas de seguridad compartidas por toda la app.
// - Hash de contraseñas con PBKDF2 (lento a propósito: adivinar contraseñas cuesta mucho más que con un hash simple).
// - Límite de intentos de ingreso que se guarda en el navegador (no se reinicia al recargar la página).
// - Lectura segura de LocalStorage (si alguien mete datos rotos o raros, la app no se rompe).
// - Filtro de URLs de imágenes (solo fotos del proyecto, https o imágenes subidas).

const ITERACIONES = 210000 // recomendación actual de OWASP para PBKDF2-SHA256

function aHex (buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function salAleatoria () {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return aHex(bytes)
}

export async function sha256 (texto) {
  return aHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto)))
}

export async function pbkdf2 (contrasena, sal, iteraciones = ITERACIONES) {
  const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(contrasena), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(sal), iterations: iteraciones },
    clave,
    256
  )
  return aHex(bits)
}

// Compara dos textos sin cortar en la primera diferencia (evita pistas por tiempo de respuesta).
export function igualesSeguro (a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let dif = 0
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return dif === 0
}

// ---------- Límite de intentos ----------
// Después de 5 intentos fallidos se bloquea 30 s; cada fallo extra duplica la espera (máximo 15 min).
const CLAVE_INTENTOS = 'monotecno_intentos'
const LIBRES = 5

function leerIntentos () {
  const datos = leerJSON(CLAVE_INTENTOS, (v) => v && typeof v === 'object' && !Array.isArray(v), {})
  return datos
}

export function segundosBloqueado (cual) {
  const r = leerIntentos()[cual]
  if (!r || !r.hasta) return 0
  return Math.max(0, Math.ceil((r.hasta - Date.now()) / 1000))
}

export function registrarFallo (cual) {
  const todos = leerIntentos()
  const r = todos[cual] || { fallos: 0, hasta: 0 }
  r.fallos++
  if (r.fallos >= LIBRES) {
    const espera = Math.min(30 * 2 ** (r.fallos - LIBRES), 15 * 60)
    r.hasta = Date.now() + espera * 1000
  }
  todos[cual] = r
  guardarJSON(CLAVE_INTENTOS, todos)
  return segundosBloqueado(cual)
}

export function limpiarFallos (cual) {
  const todos = leerIntentos()
  delete todos[cual]
  guardarJSON(CLAVE_INTENTOS, todos)
}

export function textoEspera (segundos) {
  if (segundos >= 60) {
    const m = Math.ceil(segundos / 60)
    return `${m} ${m === 1 ? 'minuto' : 'minutos'}`
  }
  return `${segundos} segundos`
}

// ---------- LocalStorage seguro ----------
export function leerJSON (clave, esValido, porDefecto, almacen = localStorage) {
  try {
    const crudo = almacen.getItem(clave)
    if (crudo === null) return porDefecto
    const valor = JSON.parse(crudo)
    return esValido(valor) ? valor : porDefecto
  } catch (e) {
    return porDefecto
  }
}

export function guardarJSON (clave, valor, almacen = localStorage) {
  try {
    almacen.setItem(clave, JSON.stringify(valor))
    return true
  } catch (e) {
    return false
  }
}

// ---------- Imágenes ----------
// Solo se aceptan: fotos del proyecto ("asset:"), links https y fotos subidas (data:image JPG/PNG/WEBP).
export function imagenPermitida (src) {
  if (typeof src !== 'string' || !src) return false
  return src.startsWith('asset:') ||
    /^https:\/\/[^\s"'<>]+$/i.test(src) ||
    /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(src)
}

// ---------- Contraseñas muy usadas ----------
// Las primeras de las listas de contraseñas filtradas: son lo primero que prueba un atacante.
const COMUNES = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'password123', 'qwerty123', 'qwertyuiop',
  'abc12345', 'abcd1234', '11111111', '00000000', 'iloveyou1', 'contraseña', 'contrasena', 'contrasena1',
  'argentina', 'argentina1', 'boca1234', 'river1234', 'bocajuniors', 'riverplate', 'messi10', 'messi1234',
  'admin123', 'admin1234', 'administrador', 'monotecno', 'monotecno1', 'mono1234', 'tecno1234', 'asdf1234',
  'zxcvbnm1', 'pass1234', 'clave123', 'clave1234', 'hola1234', 'futbol123', 'teamo123', 'qwerty1234'
])

export function contrasenaComun (c) {
  const t = String(c).toLowerCase()
  if (COMUNES.has(t)) return true
  if (/^(.)\1+$/.test(t)) return true // "aaaaaaaa", "11111111"
  if ('0123456789012345678901234567890'.includes(t) || 'abcdefghijklmnopqrstuvwxyz'.includes(t)) return true
  return false
}
