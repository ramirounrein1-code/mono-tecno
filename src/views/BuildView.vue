<template>
  <div class="contenedor armado">
    <header class="armado__cabecera">
      <h1 class="titulo-seccion">Armá tu PC</h1>
      <p class="texto-sec">Elegí cada pieza y te avisamos al momento si algo no es compatible. Al final podés llevar todo al carrito de una.</p>
    </header>

    <div class="armado__grilla">
      <ol class="lugares">
        <li v-for="l in lugares" :key="l.id" class="lugar tarjeta">
          <div class="lugar__cabecera">
            <h2 :id="'t-' + l.id">{{ l.titulo }} <span v-if="!l.obligatorio" class="lugar__opcional">opcional</span></h2>
            <span v-if="elegidos[l.id]" class="lugar__elegido">{{ pesos(elegidos[l.id].precio) }}</span>
          </div>
          <p v-if="!opciones(l).length" class="texto-sec lugar__vacio">No hay productos de esta categoría en este momento.</p>
          <ul v-else class="opciones" role="radiogroup" :aria-labelledby="'t-' + l.id">
            <li v-for="o in opciones(l)" :key="o.p.id">
              <button
                type="button"
                role="radio"
                :aria-checked="armado.sel[l.id] === o.p.id ? 'true' : 'false'"
                :disabled="o.p.stock === 0 && armado.sel[l.id] !== o.p.id"
                :class="['opcion', 'opcion--' + o.c.estado, { 'opcion--activa': armado.sel[l.id] === o.p.id }]"
                @click="elegir(l.id, o.p.id)"
              >
                <img :src="foto(o.p)" alt="" width="64" height="48">
                <span class="opcion__texto">
                  <span class="opcion__nombre">{{ o.p.nombre }}</span>
                  <span class="opcion__specs">{{ o.p.specs }}</span>
                  <span v-if="o.p.stock === 0" class="opcion__motivo opcion__motivo--error">Sin stock</span>
                  <span v-else-if="o.c.motivo" :class="['opcion__motivo', 'opcion__motivo--' + o.c.estado]">{{ o.c.motivo }}</span>
                </span>
                <span class="opcion__precio">{{ pesos(o.p.precio) }}</span>
              </button>
            </li>
          </ul>
        </li>
      </ol>

      <aside class="resumen tarjeta" aria-labelledby="t-resumen">
        <h2 id="t-resumen">Tu equipo</h2>
        <dl class="resumen__cifras">
          <div><dt>Total</dt><dd class="resumen__total">{{ pesos(total) }}</dd></div>
          <div><dt>Consumo estimado</dt><dd>{{ consumo.carga }} W</dd></div>
          <div><dt>Piezas</dt><dd>{{ cantidadElegida }} de {{ lugares.length }}</dd></div>
        </dl>
        <ul class="chequeos" aria-live="polite">
          <li v-for="(c, i) in chequeos" :key="i" :class="'chequeo chequeo--' + c.estado">
            <span class="chequeo__icono" aria-hidden="true">{{ iconos[c.estado] }}</span>
            <span><span class="sr-only">{{ etiquetas[c.estado] }}: </span>{{ c.texto }}</span>
          </li>
        </ul>
        <button type="button" class="btn btn--primario resumen__boton" :disabled="!cantidadElegida" @click="llevarAlCarrito">
          {{ hayErrores ? 'Agregar igual al carrito' : 'Agregar todo al carrito' }}
        </button>
        <button v-if="cantidadElegida" type="button" class="resumen__vaciar" @click="vaciar">Vaciar armado</button>
      </aside>
    </div>
  </div>
</template>

<script>
// Asistente para armar una PC con los productos del catálogo, avisando la compatibilidad.
import { armado, LUGARES, elegir, vaciarArmado, compatibilidad, revisarArmado, consumoEstimado } from '../services/armado'
import { obtenerProductos } from '../services/productosService'
import { resolverImagen } from '../services/imagenes'
import { formatearPesos } from '../services/dolarService'
import { agregar } from '../services/carrito'

export default {
  name: 'BuildView',
  emits: ['notificar'],
  data () {
    return {
      armado,
      lugares: LUGARES,
      iconos: { ok: '✓', error: '!', aviso: '!', info: 'i', pendiente: '·' },
      etiquetas: { ok: 'Bien', error: 'Problema', aviso: 'Atención', info: 'Dato', pendiente: 'Pendiente' }
    }
  },
  computed: {
    productos () { return obtenerProductos() },
    // Producto elegido en cada lugar (o null).
    elegidos () {
      const r = {}
      LUGARES.forEach((l) => { r[l.id] = this.productos.find((p) => p.id === armado.sel[l.id]) || null })
      return r
    },
    total () { return Object.values(this.elegidos).reduce((s, p) => s + (p ? p.precio : 0), 0) },
    cantidadElegida () { return Object.values(this.elegidos).filter(Boolean).length },
    consumo () { return consumoEstimado(this.elegidos.cpu, this.elegidos.gpu) },
    chequeos () { return revisarArmado(this.elegidos) },
    hayErrores () { return this.chequeos.some((c) => c.estado === 'error') }
  },
  methods: {
    pesos (v) { return formatearPesos(v) },
    foto (p) { return resolverImagen(p.imagen) },
    // Opciones de un lugar con su compatibilidad respecto de lo demás (sin contarse a sí mismo).
    opciones (l) {
      const otros = { ...this.elegidos, [l.id]: null }
      return this.productos
        .filter((p) => p.categoria === l.categoria)
        .map((p) => ({ p, c: compatibilidad(l.id, p, otros) }))
        .sort((a, b) => (a.p.stock === 0) - (b.p.stock === 0) || a.p.precio - b.p.precio)
    },
    elegir (lugar, id) { elegir(lugar, id) },
    vaciar () { vaciarArmado() },
    llevarAlCarrito () {
      const piezas = Object.values(this.elegidos).filter(Boolean)
      const agregadas = piezas.filter((p) => agregar(p)).length
      if (agregadas) this.$emit('notificar', { mensaje: `Agregaste ${agregadas} ${agregadas === 1 ? 'pieza' : 'piezas'} al carrito.`, accion: { texto: 'Ver carrito', to: '/carrito' } })
      else this.$emit('notificar', { mensaje: 'Ya tenés en el carrito todas las unidades disponibles.', tipo: 'info' })
    }
  }
}
</script>

<style scoped>
.armado { padding-top: 28px; padding-bottom: 64px; display: flex; flex-direction: column; gap: 20px; }
.armado__cabecera p { margin: 6px 0 0; max-width: 60ch; }
.armado__grilla { display: grid; gap: 20px; align-items: start; }
@media (min-width: 960px) {
  .armado__grilla { grid-template-columns: minmax(0, 1fr) 340px; }
  .resumen { position: sticky; top: 88px; }
}

.lugares { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; counter-reset: lugar; }
.lugar { padding: 16px; }
.lugar__cabecera { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 10px; }
.lugar__cabecera h2 { font-size: 18px; margin: 0; counter-increment: lugar; }
.lugar__cabecera h2::before { content: counter(lugar) ". "; color: var(--texto-2); font-weight: 500; }
.lugar__opcional { font-size: 13px; font-weight: 400; color: var(--texto-2); }
.lugar__elegido { font-weight: 650; font-variant-numeric: tabular-nums; }
.lugar__vacio { margin: 0; }

.opciones { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.opcion {
  width: 100%; display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 12px; align-items: center;
  padding: 8px 12px 8px 8px; min-height: 64px; text-align: left; font: inherit; color: var(--texto);
  background: var(--fondo); border: 1.5px solid transparent; border-radius: 12px; cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.opcion:hover:not(:disabled) { border-color: var(--borde); }
.opcion img { width: 64px; height: 48px; object-fit: cover; border-radius: 8px; background: #fff; }
.opcion--activa { border-color: var(--magenta); background: var(--papel); box-shadow: inset 4px 0 0 var(--magenta); }
.opcion--error:not(.opcion--activa) img { opacity: 0.55; }
.opcion--error.opcion--activa { border-color: var(--error); box-shadow: inset 4px 0 0 var(--error); }
.opcion:disabled { cursor: not-allowed; opacity: 0.5; }
.opcion__texto { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.opcion__nombre { font-weight: 600; font-size: 15px; }
.opcion__specs { font-size: 13px; color: var(--texto-2); }
.opcion__motivo { font-size: 13px; font-weight: 600; }
.opcion__motivo--error { color: var(--error); }
.opcion__motivo--aviso { color: #8a5a00; }
.opcion__precio { font-weight: 650; font-variant-numeric: tabular-nums; white-space: nowrap; }

.resumen { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.resumen h2 { font-size: 20px; margin: 0; }
.resumen__cifras { margin: 0; display: grid; gap: 8px; }
.resumen__cifras div { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.resumen__cifras dt { color: var(--texto-2); font-size: 14px; }
.resumen__cifras dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }
.resumen__total { font-size: 26px; font-weight: 700 !important; }
.chequeos { list-style: none; margin: 0; padding: 14px 0 0; border-top: 1px solid var(--borde); display: flex; flex-direction: column; gap: 10px; font-size: 14px; line-height: 1.4; }
.chequeo { display: grid; grid-template-columns: 22px 1fr; gap: 8px; }
.chequeo__icono { width: 22px; height: 22px; border-radius: 999px; display: grid; place-items: center; font-size: 12px; font-weight: 700; background: var(--borde); color: var(--texto); }
.chequeo--ok .chequeo__icono { background: var(--exito); color: #fff; }
.chequeo--error .chequeo__icono { background: var(--error); color: #fff; }
.chequeo--aviso .chequeo__icono { background: #f2c14e; color: #3a2a00; }
.chequeo--error { color: var(--error); }
.resumen__boton { width: 100%; }
.resumen__vaciar { border: 0; background: none; font: inherit; color: var(--texto-2); min-height: 44px; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .opcion { transition: none; } }
</style>
