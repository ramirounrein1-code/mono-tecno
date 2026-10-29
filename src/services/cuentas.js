// Cuentas de clientes: registro, inicio de sesión (con email o con Google), perfil y pedidos.
// Las contraseñas nunca se guardan en texto: se guarda un hash PBKDF2 con una "sal" aleatoria por usuario.
// (Sin servidor, las cuentas viven en el LocalStorage de este navegador. Con Supabase pasarían a la nube.)
import { reactive } from 'vue'
import { obtenerPedidos } from './productosService'
import { pbkdf2, sha256, salAleatoria, igualesSeguro, leerJSON, guardarJSON, registrarFallo, limpiarFallos, segundosBloqueado, textoEspera } from './seguridad'

const CLAVE_USUARIOS = 'monotecno_usuarios'
const CLAVE_SESION = 'monotecno_sesion'
const CLAVE_PEDIDOS_INVITADO = 'monotecno_pedidos_invitado'
const DURACION_SESION = 30 * 24 * 60 * 60 * 1000 // 30 días

const esLista = (v) => Array.isArray(v)
const esUsuario = (u) => u && typeof u.email === 'string' && typeof u.nombre === 'string'

function leerUsuarios () {
  return leerJSON(CLAVE_USUARIOS, esLista, []).filter(esUsuario)
}

function guardarUsuarios (lista) {
  if (!guardarJSON(CLAVE_USUARIOS, lista)) throw new Error('No se pudo guardar la cuenta en este navegador.')
}

// Datos públicos del usuario (sin hash ni sal).
function publico (u) {
  if (!u) return null
  const { hash, sal, algo, google, ...resto } = u
  return { ...resto, conGoogle: !!google, conContrasena: !!hash }
}

function abrirSesion (email) {
  guardarJSON(CLAVE_SESION, { email, hasta: Date.now() + DURACION_SESION })
}

function usuarioDeSesion () {
  const s = leerJSON(CLAVE_SESION, (v) => v && typeof v.email === 'string' && typeof v.hasta === 'number', null)
  if (!s || s.hasta < Date.now()) return null
  return publico(leerUsuarios().find((u) => u.email === s.email))
}

// Estado compartido: la barra, el checkout y "Mi cuenta" lo leen.
export const sesion = reactive({ usuario: usuarioDeSesion() })

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
    algo: 'pbkdf2',
    sal,
    hash: await pbkdf2(contrasena, sal)
  }
  const lista = leerUsuarios()
  lista.push(usuario)
  guardarUsuarios(lista)
  abrirSesion(mail)
  sesion.usuario = publico(usuario)
  return sesion.usuario
}

async function contrasenaCorrecta (u, contrasena) {
  if (!u.hash) return false
  // Cuentas creadas antes de la mejora de seguridad usaban SHA-256: se aceptan y se actualizan a PBKDF2.
  const calculado = u.algo === 'pbkdf2' ? await pbkdf2(contrasena, u.sal) : await sha256(u.sal + contrasena)
  return igualesSeguro(calculado, u.hash)
}

export async function iniciarSesion (email, contrasena) {
  const espera = segundosBloqueado('cliente')
  if (espera) throw new Error(`Demasiados intentos. Probá de nuevo en ${textoEspera(espera)}.`)

  const mail = email.trim().toLowerCase()
  const lista = leerUsuarios()
  const u = lista.find((x) => x.email === mail)
  if (u && !u.hash && u.google) {
    throw new Error('Esta cuenta se creó con Google. Tocá "Continuar con Google" para entrar.')
  }
  if (!u || !(await contrasenaCorrecta(u, contrasena))) {
    const bloqueo = registrarFallo('cliente')
    // Mismo mensaje exista o no el email: así no se puede averiguar quién tiene cuenta.
    throw new Error(bloqueo ? `Demasiados intentos. Probá de nuevo en ${textoEspera(bloqueo)}.` : 'El email o la contraseña no son correctos.')
  }
  limpiarFallos('cliente')
  if (u.algo !== 'pbkdf2') {
    u.sal = salAleatoria()
    u.hash = await pbkdf2(contrasena, u.sal)
    u.algo = 'pbkdf2'
    guardarUsuarios(lista)
  }
  abrirSesion(u.email)
  sesion.usuario = publico(u)
  return sesion.usuario
}

// Ingreso con Google: si el email ya tiene cuenta, se vincula; si no, se crea la cuenta con los datos de Google.
export function ingresarConGoogle (perfil) {
  const mail = perfil.email.trim().toLowerCase()
  const lista = leerUsuarios()
  let u = lista.find((x) => x.email === mail)
  if (u) {
    if (u.google && u.google !== perfil.sub) throw new Error('Este email ya está vinculado a otra cuenta de Google.')
    u.google = perfil.sub
    if (!u.foto && perfil.foto) u.foto = perfil.foto
  } else {
    u = {
      nombre: (perfil.nombre || mail.split('@')[0]).slice(0, 40),
      apellido: (perfil.apellido || '').slice(0, 40),
      email: mail,
      telefono: '',
      dni: '',
      foto: perfil.foto || '',
      creado: new Date().toISOString(),
      google: perfil.sub
    }
    lista.push(u)
  }
  guardarUsuarios(lista)
  limpiarFallos('cliente')
  abrirSesion(mail)
  sesion.usuario = publico(u)
  return { usuario: sesion.usuario, nuevo: !u.telefono }
}

export function cerrarSesion () {
  try { localStorage.removeItem(CLAVE_SESION) } catch (e) { /* nada */ }
  sesion.usuario = null
  // Si Google está cargado, evita que vuelva a entrar solo con la misma cuenta.
  if (window.google && window.google.accounts && window.google.accounts.id) window.google.accounts.id.disableAutoSelect()
}

export function actualizarPerfil (datos) {
  const lista = leerUsuarios()
  const u = lista.find((x) => x.email === sesion.usuario.email)
  if (!u) return null
  Object.assign(u, {
    nombre: datos.nombre.trim().slice(0, 40),
    apellido: datos.apellido.trim().slice(0, 40),
    telefono: datos.telefono.trim().slice(0, 20),
    dni: (datos.dni || '').trim().slice(0, 10)
  })
  guardarUsuarios(lista)
  sesion.usuario = publico(u)
  return sesion.usuario
}

export function pedidosDelUsuario () {
  if (!sesion.usuario) return []
  return obtenerPedidos().filter((p) => p.usuario === sesion.usuario.email || (p.cliente && p.cliente.email === sesion.usuario.email))
}

// Los pedidos hechos sin cuenta solo se pueden volver a ver desde la misma pestaña del navegador.
export function recordarPedidoInvitado (numero) {
  const lista = leerJSON(CLAVE_PEDIDOS_INVITADO, esLista, [], sessionStorage)
  guardarJSON(CLAVE_PEDIDOS_INVITADO, [...lista, numero], sessionStorage)
}

// ¿Quién puede ver un pedido? Su dueño (logueado), quien lo hizo como invitado en esta pestaña, o el admin.
export function puedeVerPedido (pedido, esAdmin = false) {
  if (!pedido) return false
  if (esAdmin) return true
  if (sesion.usuario && (pedido.usuario === sesion.usuario.email || (pedido.cliente && pedido.cliente.email === sesion.usuario.email))) return true
  return leerJSON(CLAVE_PEDIDOS_INVITADO, esLista, [], sessionStorage).includes(pedido.numero)
}

export function estaLogueadoCliente () {
  sesion.usuario = usuarioDeSesion()
  return !!sesion.usuario
}
