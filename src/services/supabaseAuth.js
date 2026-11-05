// Ingreso con Google a través de Supabase Auth (con Fetch, sin librerías extra).
//
// Cómo funciona:
//   1. entrarConGoogle() lleva al usuario a Supabase, que lo manda a la pantalla de Google.
//   2. Google vuelve a Supabase (callback: <proyecto>.supabase.co/auth/v1/callback) y Supabase
//      vuelve a la tienda con la sesión en la dirección (#access_token=...).
//   3. recibirIngreso() lee esa sesión, le pide a Supabase los datos del usuario (así se verifica
//      en el servidor que el token es real) y trae su perfil de la tabla "perfiles".
// El usuario queda guardado en Supabase (Authentication → Users) y su perfil en public.perfiles.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/tienda'
import { leerJSON, guardarJSON } from './seguridad'

const CLAVE = 'monotecno_supabase_sesion'
const CLAVE_DESTINO = 'monotecno_supabase_destino'

const valida = (s) => s && typeof s.access_token === 'string' && typeof s.refresh_token === 'string' && typeof s.expira === 'number'

function cabeceras (token) {
  return { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' }
}

function guardarSesion (s) {
  guardarJSON(CLAVE, { access_token: s.access_token, refresh_token: s.refresh_token, expira: s.expira })
}

export function borrarSesionNube () {
  try { localStorage.removeItem(CLAVE) } catch (e) { /* nada */ }
}

// Paso 1: ir a Google. "destino" es la página a la que se vuelve después de entrar.
export function entrarConGoogle (destino = '/cuenta') {
  try { sessionStorage.setItem(CLAVE_DESTINO, destino) } catch (e) { /* nada */ }
  const vuelta = `${window.location.origin}/cuenta/ingresar`
  window.location.assign(`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(vuelta)}`)
}

export function destinoGuardado () {
  try {
    const d = sessionStorage.getItem(CLAVE_DESTINO)
    sessionStorage.removeItem(CLAVE_DESTINO)
    return d && d.startsWith('/') && !d.startsWith('//') ? d : ''
  } catch (e) {
    return ''
  }
}

// ¿Volvimos de Google? (la sesión o el error vienen en la dirección)
export function hayRespuestaDeGoogle () {
  const h = window.location.hash
  return /access_token=|error_description=/.test(h) || /error_description=/.test(window.location.search)
}

// Paso 3: lee la sesión de la dirección, la verifica con Supabase y devuelve el perfil del usuario.
export async function recibirIngreso () {
  const datos = new URLSearchParams(window.location.hash.slice(1) || window.location.search.slice(1))
  // Se limpia la dirección para que el token no quede a la vista ni en el historial.
  window.history.replaceState(null, '', window.location.pathname)
  if (datos.get('error_description')) throw new Error('Google no autorizó el ingreso: ' + datos.get('error_description'))
  const accessToken = datos.get('access_token')
  const refreshToken = datos.get('refresh_token')
  if (!accessToken || !refreshToken) throw new Error('No llegó la sesión de Google. Probá de nuevo.')

  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: cabeceras(accessToken) })
  if (!r.ok) throw new Error('Supabase no pudo confirmar tu cuenta de Google. Probá de nuevo.')
  const usuario = await r.json()
  if (!usuario.email) throw new Error('Tu cuenta de Google no tiene email.')

  const segundos = Number(datos.get('expires_in')) || 3600
  guardarSesion({ access_token: accessToken, refresh_token: refreshToken, expira: Date.now() + segundos * 1000 })

  const perfil = await leerPerfil(accessToken, usuario.id)
  const m = usuario.user_metadata || {}
  const completo = m.full_name || m.name || ''
  return {
    sub: usuario.id,
    email: usuario.email,
    nombre: (perfil && perfil.nombre) || m.given_name || completo.split(' ')[0] || '',
    apellido: (perfil && perfil.apellido) || m.family_name || completo.split(' ').slice(1).join(' '),
    telefono: (perfil && perfil.telefono) || '',
    foto: /^https:\/\//.test(m.avatar_url || '') ? m.avatar_url : ''
  }
}

async function leerPerfil (token, id) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${encodeURIComponent(id)}&select=nombre,apellido,telefono`, { headers: cabeceras(token) })
    if (!r.ok) return null
    const filas = await r.json()
    return filas[0] || null
  } catch (e) {
    return null
  }
}

// Token del usuario para hablar con la base (lo renueva si venció). Devuelve '' si no hay sesión de Supabase.
export async function tokenUsuario () {
  const s = leerJSON(CLAVE, valida, null)
  if (!s) return ''
  if (s.expira - Date.now() > 60 * 1000) return s.access_token
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: cabeceras(),
      body: JSON.stringify({ refresh_token: s.refresh_token })
    })
    if (!r.ok) throw new Error('vencida')
    const n = await r.json()
    guardarSesion({ access_token: n.access_token, refresh_token: n.refresh_token, expira: Date.now() + (n.expires_in || 3600) * 1000 })
    return n.access_token
  } catch (e) {
    borrarSesionNube()
    return ''
  }
}

// Guarda nombre, apellido y teléfono en la tabla perfiles (solo puede tocar su propia fila).
export async function guardarPerfilNube ({ nombre, apellido, telefono }) {
  const token = await tokenUsuario()
  if (!token) return false
  const s = leerJSON(CLAVE, valida, null)
  const id = idDelToken(s && s.access_token)
  if (!id) return false
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { ...cabeceras(token), Prefer: 'return=minimal' },
      body: JSON.stringify({ nombre, apellido, telefono })
    })
    return r.ok
  } catch (e) {
    return false
  }
}

// El id del usuario viene dentro del token (campo "sub"). Supabase lo vuelve a verificar en cada pedido.
function idDelToken (token) {
  try {
    const p = JSON.parse(atob(String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return p.sub || ''
  } catch (e) {
    return ''
  }
}

// Cierra la sesión también en Supabase.
export async function salirDeNube () {
  const s = leerJSON(CLAVE, valida, null)
  borrarSesionNube()
  if (!s) return
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: cabeceras(s.access_token) })
  } catch (e) { /* si falla, igual se borró la sesión local */ }
}
