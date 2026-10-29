// Lista de productos elegidos para comparar (hasta 3). Se guarda en LocalStorage.
import { reactive } from 'vue'
import { leerJSON, guardarJSON } from './seguridad'

const CLAVE = 'monotecno_comparar'
export const MAX_COMPARAR = 3

export const comparacion = reactive({
  ids: leerJSON(CLAVE, (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'), []).slice(0, MAX_COMPARAR)
})

function guardar () {
  guardarJSON(CLAVE, comparacion.ids)
}

export function estaEnComparacion (id) {
  return comparacion.ids.includes(id)
}

// Agrega o saca un producto. Devuelve 'agregado', 'quitado' o 'lleno' (si ya hay 3).
export function alternarComparacion (id) {
  if (estaEnComparacion(id)) {
    comparacion.ids = comparacion.ids.filter((x) => x !== id)
    guardar()
    return 'quitado'
  }
  if (comparacion.ids.length >= MAX_COMPARAR) return 'lleno'
  comparacion.ids = [...comparacion.ids, id]
  guardar()
  return 'agregado'
}

export function quitarDeComparacion (id) {
  comparacion.ids = comparacion.ids.filter((x) => x !== id)
  guardar()
}

export function limpiarComparacion () {
  comparacion.ids = []
  guardar()
}

// Reemplaza la lista completa (la usa el detalle para comparar solo dentro de una categoría).
export function fijarComparacion (ids) {
  comparacion.ids = ids.slice(0, MAX_COMPARAR)
  guardar()
}
