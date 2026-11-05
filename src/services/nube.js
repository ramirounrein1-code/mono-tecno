// Conexión con Supabase (base de datos en la nube) usando Fetch.
// La tienda solo llama a funciones de la base (RPC): el navegador nunca escribe las tablas directamente.
// Si la URL o la clave pública no están configuradas, la tienda funciona solo con LocalStorage.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/tienda'
import { tokenUsuario } from './supabaseAuth'

export function nubeActiva () {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20
}

// Llama a una función de la base. Devuelve su resultado o lanza un Error con un mensaje claro.
export async function rpc (nombre, parametros = {}) {
  if (!nubeActiva()) throw new Error('La base de datos no está configurada.')
  // Con la sesión de Google iniciada se manda el token del usuario: así la base sabe quién es (auth.uid()).
  const token = (await tokenUsuario()) || SUPABASE_ANON_KEY
  let respuesta
  try {
    respuesta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nombre}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parametros)
    })
  } catch (e) {
    throw new Error('No hay conexión con la base de datos. Revisá internet y probá de nuevo.')
  }
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    // Los errores de las funciones (por ejemplo "No hay stock suficiente...") vienen en "message"
    throw new Error((datos && datos.message) || 'La base de datos no respondió bien. Probá de nuevo.')
  }
  // Las funciones del panel devuelven { error } en vez de cortar (así se registran los intentos fallidos)
  if (datos && typeof datos === 'object' && !Array.isArray(datos) && datos.error) throw new Error(datos.error)
  return datos
}
