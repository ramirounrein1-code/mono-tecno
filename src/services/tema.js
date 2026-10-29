// Modo claro / oscuro. Si el usuario no eligió, sigue la configuración del sistema.
import { reactive } from 'vue'

const CLAVE = 'monotecno_tema'
const consulta = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null

function guardado () {
  try { const v = localStorage.getItem(CLAVE); return v === 'dark' || v === 'light' ? v : null } catch (e) { return null }
}

export const tema = reactive({ elegido: guardado(), sistema: consulta && consulta.matches ? 'dark' : 'light' })

export function temaActual () {
  return tema.elegido || tema.sistema
}

function aplicar () {
  if (tema.elegido) document.documentElement.setAttribute('data-theme', tema.elegido)
  else document.documentElement.removeAttribute('data-theme')
}

export function alternarTema () {
  tema.elegido = temaActual() === 'dark' ? 'light' : 'dark'
  try { localStorage.setItem(CLAVE, tema.elegido) } catch (e) { /* sin LocalStorage queda solo en esta visita */ }
  aplicar()
}

if (consulta && consulta.addEventListener) consulta.addEventListener('change', (e) => { tema.sistema = e.matches ? 'dark' : 'light' })
aplicar()
