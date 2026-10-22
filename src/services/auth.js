// Acceso al panel de administración.
// La contraseña no se guarda en el código: solo su hash SHA-256 (ver config/tienda.js).
// La sesión dura 8 horas y se guarda en sessionStorage (se cierra al cerrar el navegador).
import { reactive } from 'vue'
import { ADMIN_HASH } from '../config/tienda'

const CLAVE = 'monotecno_admin_sesion'
const DURACION = 8 * 60 * 60 * 1000

function sesionValida () {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE))
    return !!s && s.hasta > Date.now()
  } catch (e) {
    return false
  }
}

export const auth = reactive({ logueado: sesionValida() })

async function sha256 (texto) {
  const datos = new TextEncoder().encode(texto)
  const hash = await crypto.subtle.digest('SHA-256', datos)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function iniciarSesion (contrasena) {
  // Pequeña demora para que probar contraseñas al azar sea más lento.
  await new Promise((r) => setTimeout(r, 600))
  const ok = (await sha256('monotecno:' + contrasena)) === ADMIN_HASH
  if (ok) {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify({ hasta: Date.now() + DURACION }))
    } catch (e) { /* sin sessionStorage la sesión dura hasta recargar */ }
    auth.logueado = true
  }
  return ok
}

export function cerrarSesion () {
  try {
    sessionStorage.removeItem(CLAVE)
  } catch (e) { /* nada */ }
  auth.logueado = false
}

export function estaLogueado () {
  auth.logueado = auth.logueado && sesionValida() ? true : sesionValida()
  return auth.logueado
}
