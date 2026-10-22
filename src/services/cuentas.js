// Cuentas de clientes: registro, inicio de sesión y perfil.
// Las contraseñas nunca se guardan en texto: se guarda un hash SHA-256 con una "sal" aleatoria por usuario.
// (Sin servidor, las cuentas viven en el LocalStorage de este navegador. Con Supabase pasarían a la nube.)
import { reactive } from 'vue'
import { obtenerPedidos } from './productosService'

const CLAVE_USUARIOS = 'monotecno_usuarios'
const CLAVE_SESION = 'monotecno_sesion'

function leerUsuarios () {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || []
  } catch (e) {
    return []
  }
}

function guardarUsuarios (lista) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista))
}

// Datos públicos del usuario (sin hash ni sal).
function publico (u) {
  if (!u) return null
  const { hash, sal, ...resto } = u
  return resto
}

function usuarioDeSesion () {
  try {
    const email = JSON.parse(localStorage.getItem(CLAVE_SESION))
    return publico(leerUsuarios().find((u) => u.email === email))
  } catch (e) {
    return null
  }
}

// Estado compartido: la barra, el checkout y "Mi cuenta" lo leen.
export const sesion = reactive({ usuario: usuarioDeSesion() })

async function sha256 (texto) {
  const datos = new TextEncoder().encode(texto)
  const hash = await crypto.subtle.digest('SHA-256', datos)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function salAleatoria () {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function emailRegistrado (email) {
  return leerUsuarios().some((u) => u.email === email.trim().toLowerCase())
}

export async function registrar ({ nombre, apellido, email, telefono, contrasena }) {
  const mail = email.trim().toLowerCase()
  if (emailRegistrado(mail)) throw new Error('Ya existe una cuenta con ese email. Probá iniciar sesión.')
  const sal = salAleatoria()
  const usuario = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: mail,
    telefono: telefono.trim(),
    dni: '',
    creado: new Date().toISOString(),
    sal,
    hash: await sha256(sal + contrasena)
  }
  const lista = leerUsuarios()
  lista.push(usuario)
  guardarUsuarios(lista)
  localStorage.setItem(CLAVE_SESION, JSON.stringify(mail))
  sesion.usuario = publico(usuario)
  return sesion.usuario
}

export async function iniciarSesion (email, contrasena) {
  await new Promise((r) => setTimeout(r, 400)) // demora para que probar contraseñas sea más lento
  const u = leerUsuarios().find((x) => x.email === email.trim().toLowerCase())
  if (!u || (await sha256(u.sal + contrasena)) !== u.hash) {
    throw new Error('El email o la contraseña no son correctos.')
  }
  localStorage.setItem(CLAVE_SESION, JSON.stringify(u.email))
  sesion.usuario = publico(u)
  return sesion.usuario
}

export function cerrarSesion () {
  localStorage.removeItem(CLAVE_SESION)
  sesion.usuario = null
}

export function actualizarPerfil (datos) {
  const lista = leerUsuarios()
  const u = lista.find((x) => x.email === sesion.usuario.email)
  if (!u) return null
  Object.assign(u, {
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    telefono: datos.telefono.trim(),
    dni: (datos.dni || '').trim()
  })
  guardarUsuarios(lista)
  sesion.usuario = publico(u)
  return sesion.usuario
}

export function pedidosDelUsuario () {
  if (!sesion.usuario) return []
  return obtenerPedidos().filter((p) => p.usuario === sesion.usuario.email || p.cliente.email === sesion.usuario.email)
}

export function estaLogueadoCliente () {
  if (!sesion.usuario) sesion.usuario = usuarioDeSesion()
  return !!sesion.usuario
}
