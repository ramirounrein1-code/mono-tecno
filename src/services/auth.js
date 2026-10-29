// Acceso al panel de administración.
// - La contraseña no está en el código: solo la "huella" (hash) de una clave que se deriva de ella con PBKDF2.
// - Al entrar, esa clave se guarda en sessionStorage y se vuelve a comprobar en cada página del panel:
//   escribir a mano una sesión falsa en el navegador NO sirve, porque sin la contraseña no se puede fabricar la clave.
// - La sesión dura como máximo 8 horas, se cierra sola tras 30 minutos sin actividad y al cerrar el navegador.
// Ojo: sin servidor, esta protección es del lado del navegador. Para algo 100 % seguro hace falta un backend (ej: Supabase).
import { reactive } from 'vue'
import { ADMIN_HASH } from '../config/tienda'
import { pbkdf2, sha256, igualesSeguro, leerJSON, guardarJSON, registrarFallo, limpiarFallos, segundosBloqueado } from './seguridad'

const CLAVE = 'monotecno_admin_sesion'
const DURACION = 8 * 60 * 60 * 1000
const INACTIVIDAD = 30 * 60 * 1000

export const auth = reactive({ logueado: false })
let claveVerificada = '' // evita recalcular el hash en cada navegación

function leerSesion () {
  return leerJSON(CLAVE, (v) => v && typeof v.k === 'string' && typeof v.hasta === 'number' && typeof v.ultimo === 'number', null, sessionStorage)
}

// Devuelve { ok, espera }: espera = segundos que hay que esperar si se bloqueó por intentos.
export async function iniciarSesion (contrasena) {
  const bloqueo = segundosBloqueado('admin')
  if (bloqueo) return { ok: false, espera: bloqueo }
  const k = await pbkdf2(contrasena, 'monotecno-admin')
  const ok = igualesSeguro(await sha256(k), ADMIN_HASH)
  if (!ok) return { ok: false, espera: registrarFallo('admin') }
  limpiarFallos('admin')
  const ahora = Date.now()
  guardarJSON(CLAVE, { k, hasta: ahora + DURACION, ultimo: ahora }, sessionStorage)
  claveVerificada = k
  auth.logueado = true
  return { ok: true, espera: 0 }
}

export function segundosBloqueadoAdmin () {
  return segundosBloqueado('admin')
}

export function cerrarSesion () {
  try {
    sessionStorage.removeItem(CLAVE)
  } catch (e) { /* nada */ }
  claveVerificada = ''
  auth.logueado = false
}

// Comprueba la sesión de verdad (async, porque recalcula la huella de la clave guardada).
export async function estaLogueado () {
  const s = leerSesion()
  const ahora = Date.now()
  if (!s || s.hasta < ahora || ahora - s.ultimo > INACTIVIDAD) {
    if (s) cerrarSesion()
    auth.logueado = false
    return false
  }
  if (s.k !== claveVerificada) {
    if (!igualesSeguro(await sha256(s.k), ADMIN_HASH)) {
      cerrarSesion()
      return false
    }
    claveVerificada = s.k
  }
  auth.logueado = true
  return true
}

// Marca actividad (navegar, tocar, escribir) para que la sesión no se cierre por inactividad.
let ultimoToque = 0
export function registrarActividad () {
  if (!auth.logueado) return
  const ahora = Date.now()
  if (ahora - ultimoToque < 15000) return
  ultimoToque = ahora
  const s = leerSesion()
  if (s) guardarJSON(CLAVE, { ...s, ultimo: ahora }, sessionStorage)
}
