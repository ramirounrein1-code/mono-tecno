<template>
  <div class="contenedor comparar">
    <header class="comparar__cabecera">
      <h1 class="titulo-seccion">Comparar</h1>
      <p v-if="productos.length >= 2" class="texto-sec">Las celdas resaltadas marcan el mejor valor de cada fila.</p>
    </header>

    <div v-if="productos.length < 2" class="tarjeta vacio">
      <h2>{{ productos.length ? 'Falta un producto más' : 'Todavía no elegiste productos' }}</h2>
      <p class="texto-sec">Entrá a un producto y, abajo de la ficha técnica, elegí con cuáles de su misma categoría querés compararlo.</p>
      <router-link :to="{ name: 'listado', query: { categoria: 'Placas de video' } }" class="btn btn--primario">Elegir placas de video</router-link>
    </div>

    <template v-else>
      <p v-if="categoriasDistintas" class="aviso">Estás comparando productos de categorías distintas: algunas filas solo aplican a uno de ellos.</p>

      <div class="tabla-caja" role="region" aria-label="Tabla de comparación" tabindex="0">
        <table class="tabla" :style="{ '--columnas': productos.length }">
          <thead>
            <tr>
              <th scope="col" class="tabla__dato"><span class="sr-only">Dato</span></th>
              <th v-for="p in productos" :key="p.id" scope="col" class="tabla__producto">
                <button type="button" class="tabla__quitar" :aria-label="'Quitar ' + p.nombre" @click="quitar(p.id)">×</button>
                <router-link :to="{ name: 'detalle', params: { id: p.id } }" class="tabla__foto">
                  <img :src="foto(p)" :alt="p.nombre" width="200" height="150">
                </router-link>
                <router-link :to="{ name: 'detalle', params: { id: p.id } }" class="tabla__nombre">{{ p.nombre }}</router-link>
                <span class="tabla__precio">{{ pesos(p.precio) }}</span>
                <button type="button" class="btn btn--primario btn--chico tabla__agregar" :disabled="p.stock === 0" @click="agregarAlCarrito(p)">{{ p.stock === 0 ? 'Sin stock' : 'Agregar al carrito' }}</button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fila in filas" :key="fila.dato">
              <th scope="row" class="tabla__dato">{{ fila.dato }}</th>
              <td v-for="(v, i) in fila.valores" :key="i" :class="{ mejor: fila.mejores.includes(i) }">
                {{ v || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" class="comparar__limpiar" @click="limpiar">Empezar de nuevo</button>
    </template>
  </div>
</template>

<script>
// Compara 2 o 3 productos lado a lado usando su ficha técnica.
import { comparacion, quitarDeComparacion, limpiarComparacion } from '../services/comparar'
import { obtenerProductos } from '../services/productosService'
import { resolverImagen } from '../services/imagenes'
import { formatearPesos } from '../services/dolarService'
import { agregar } from '../services/carrito'

// Para estas filas se marca el mejor valor: 'max' = más es mejor, 'min' = menos es mejor.
const CRITERIOS = [
  [/^precio$/i, 'min'],
  [/^memoria$|^capacidad$/i, 'max'],
  [/^consumo/i, 'min'],
  [/^fuente recomendada/i, 'min'],
  [/frecuencia boost|^velocidad$/i, 'max'],
  [/^caché l3$/i, 'max'],
  [/^potencia$/i, 'max'],
  [/^stock$/i, 'max']
]

// Primer número de un texto ("12 GB GDDR6" → 12, "Hasta 2581 MHz" → 2581, "$ 320.000" → 320000).
function numero (texto) {
  const m = String(texto).replace(/\./g, '').match(/\d+(,\d+)?/)
  return m ? parseFloat(m[0].replace(',', '.')) : null
}

export default {
  name: 'CompareView',
  emits: ['notificar'],
  computed: {
    productos () {
      const todos = obtenerProductos()
      return comparacion.ids.map((id) => todos.find((p) => p.id === id)).filter(Boolean)
    },
    categoriasDistintas () {
      return new Set(this.productos.map((p) => p.categoria)).size > 1
    },
    // Une todas las filas de las fichas técnicas, en el orden en que aparecen.
    filas () {
      const base = [
        { dato: 'Precio', valores: this.productos.map((p) => formatearPesos(p.precio)) },
        { dato: 'Condición', valores: this.productos.map((p) => p.condicion) },
        { dato: 'Marca', valores: this.productos.map((p) => p.marca) },
        { dato: 'Stock', valores: this.productos.map((p) => p.stock ? `${p.stock} disponible${p.stock === 1 ? '' : 's'}` : 'Sin stock') }
      ]
      // "Consumo (TGP)" y "Consumo (TBP)" son el mismo dato con distinto nombre según la marca.
      const clave = (d) => (/^consumo/i.test(d) ? 'Consumo' : d)
      const datos = []
      this.productos.forEach((p) => (p.ficha || []).forEach(([d]) => { if (!datos.includes(clave(d))) datos.push(clave(d)) }))
      const ficha = datos.map((d) => ({
        dato: d,
        valores: this.productos.map((p) => { const f = (p.ficha || []).find(([x]) => clave(x) === d); return f ? f[1] : '' })
      }))
      return [...base, ...ficha].map((fila) => ({ ...fila, mejores: this.mejores(fila) }))
    }
  },
  methods: {
    pesos (v) { return formatearPesos(v) },
    foto (p) { return resolverImagen(p.imagen) },
    // Índices de las celdas con el mejor valor de la fila (solo si al menos 2 tienen dato y no son todos iguales).
    mejores (fila) {
      const c = CRITERIOS.find(([re]) => re.test(fila.dato))
      if (!c) return []
      const nums = fila.valores.map(numero)
      const validos = nums.filter((n) => n != null)
      if (validos.length < 2 || new Set(validos).size === 1) return []
      const objetivo = c[1] === 'max' ? Math.max(...validos) : Math.min(...validos)
      return nums.map((n, i) => (n === objetivo ? i : -1)).filter((i) => i >= 0)
    },
    quitar (id) { quitarDeComparacion(id) },
    limpiar () { limpiarComparacion() },
    agregarAlCarrito (p) {
      if (agregar(p)) this.$emit('notificar', { mensaje: `Agregaste “${p.nombre}” al carrito.`, accion: { texto: 'Ver carrito', to: '/carrito' } })
      else this.$emit('notificar', { mensaje: 'Ya tenés en el carrito todas las unidades disponibles.', tipo: 'info' })
    }
  }
}
</script>

<style scoped>
.comparar { padding-top: 28px; padding-bottom: 64px; display: flex; flex-direction: column; gap: 16px; }
.comparar__cabecera { display: flex; flex-direction: column; gap: 6px; }
.comparar__cabecera p { margin: 0; }
.aviso { margin: 0; padding: 12px 14px; border-radius: 12px; background: var(--rosa); font-size: 14px; }
.vacio { padding: 36px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.vacio h2 { font-size: 24px; }
.vacio p { margin: 0 0 6px; max-width: 46ch; }

.tabla-caja { overflow-x: auto; border: 1px solid var(--borde); border-radius: var(--radio); background: var(--papel); }
.tabla-caja:focus-visible { outline: 2px solid var(--magenta); outline-offset: 2px; }
.tabla { width: 100%; min-width: calc(140px + var(--columnas) * 200px); border-collapse: collapse; font-size: 14px; table-layout: fixed; }
.tabla th, .tabla td { padding: 12px 14px; border-bottom: 1px solid var(--borde); text-align: left; vertical-align: top; }
.tabla tbody tr:last-child th, .tabla tbody tr:last-child td { border-bottom: 0; }
.tabla__dato { width: 150px; position: sticky; left: 0; z-index: 1; background: var(--papel); color: var(--texto-2); font-weight: 600; font-size: 13px; }
thead .tabla__dato { z-index: 2; }
.tabla__producto { position: relative; font-weight: 400; }
.tabla__producto > * { display: block; }
.tabla__foto { aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: #fff; border: 1px solid var(--borde); margin-bottom: 10px; }
.tabla__foto img { width: 100%; height: 100%; object-fit: cover; }
.tabla__nombre { color: var(--texto); font-weight: 600; font-size: 15px; line-height: 1.3; min-height: 2.6em; }
.tabla__precio { font-size: 20px; font-weight: 650; margin: 6px 0 10px; font-variant-numeric: tabular-nums; }
.tabla__agregar { width: 100%; }
.tabla__quitar { position: absolute; top: 18px; right: 20px; z-index: 1; width: 30px; height: 30px; border-radius: 999px; border: 1px solid var(--borde); background: var(--papel); color: var(--texto); font-size: 16px; line-height: 1; cursor: pointer; }
@media (max-width: 600px) {
  .tabla { min-width: calc(108px + var(--columnas) * 168px); font-size: 13px; }
  .tabla th, .tabla td { padding: 10px; }
  .tabla__dato { width: 108px; }
  .tabla__precio { font-size: 17px; }
}
td.mejor { background: color-mix(in srgb, var(--exito) 12%, transparent); color: var(--exito); font-weight: 650; }
.comparar__limpiar { align-self: flex-start; border: 0; background: none; font: inherit; color: var(--magenta-texto); min-height: 44px; padding: 0; cursor: pointer; }
</style>
