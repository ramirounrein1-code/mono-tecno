// Ingreso con Google usando "Google Identity Services" (la librería oficial de Google).
// Google muestra su propia ventana para elegir la cuenta y nos devuelve un "token" (JWT) con
// el nombre, el email y la foto. La contraseña de Google nunca pasa por esta página.
import { GOOGLE_CLIENT_ID } from '../config/tienda'

const SCRIPT = 'https://accounts.google.com/gsi/client'
let cargando = null

export function googleConfigurado () {
  return /^[\w-]+\.apps\.googleusercontent\.com$/.test(GOOGLE_CLIENT_ID)
}

export function cargarGoogle () {
  if (window.google && window.google.accounts) return Promise.resolve(window.google)
  if (cargando) return cargando
  cargando = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.defer = true
    s.onload = () => resolve(window.google)
    s.onerror = () => {
      cargando = null
      reject(new Error('No se pudo conectar con Google. Revisá tu conexión.'))
    }
    document.head.appendChild(s)
  })
  return cargando
}

// Lee los datos del token y revisa que sea para esta página, que venga de Google, que no esté vencido
// y que el email esté verificado.
// Nota: la firma del token solo se puede verificar 100 % en un servidor; acá se valida todo lo demás.
export function leerToken (jwt) {
  const partes = String(jwt).split('.')
  if (partes.length !== 3) throw new Error('Respuesta de Google inválida.')
  const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(escape(atob(base64)))
  const d = JSON.parse(json)
  const ahora = Math.floor(Date.now() / 1000)
  if (d.aud !== GOOGLE_CLIENT_ID) throw new Error('El ingreso no es para esta página.')
  if (d.iss !== 'https://accounts.google.com' && d.iss !== 'accounts.google.com') throw new Error('El ingreso no viene de Google.')
  if (!d.exp || d.exp < ahora) throw new Error('El ingreso con Google venció. Probá de nuevo.')
  if (!d.email || d.email_verified !== true) throw new Error('Tu email de Google no está verificado.')
  return {
    sub: d.sub,
    email: d.email,
    nombre: d.given_name || d.name || '',
    apellido: d.family_name || '',
    foto: /^https:\/\//.test(d.picture || '') ? d.picture : ''
  }
}

// Dibuja el botón oficial de Google dentro de "contenedor". "alIngresar" recibe el perfil ya validado.
export async function mostrarBotonGoogle (contenedor, { alIngresar, alError, texto = 'continue_with' }) {
  const google = await cargarGoogle()
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (respuesta) => {
      try {
        alIngresar(leerToken(respuesta.credential))
      } catch (e) {
        alError(e)
      }
    },
    ux_mode: 'popup',
    auto_select: false,
    cancel_on_tap_outside: true
  })
  google.accounts.id.renderButton(contenedor, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    text: texto,
    locale: 'es',
    width: Math.min(contenedor.clientWidth || 320, 400)
  })
}
