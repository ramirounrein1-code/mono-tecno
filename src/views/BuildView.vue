<template>
  <div class="contenedor armado">
    <header class="armado__cabecera">
      <h1 class="titulo-seccion">Armá tu PC</h1>
      <p class="texto-sec">Elegí cada pieza y te avisamos al momento si algo no es compatible. Al final podés llevar todo al carrito de una.</p>
    </header>

    <div class="armado__grilla">
      <ol class="lugares">
        <li v-for="l in lugares" :key="l.id" class="lugar tarjeta">
          <!-- Cada pieza se despliega como las preguntas frecuentes -->
          <h2 class="lugar__titulo">
            <button type="button" class="lugar__boton" :aria-expanded="abierto === l.id ? 'true' : 'false'" :aria-controls="'panel-' + l.id" @click="abierto = abierto === l.id ? null : l.id">
              <span class="lugar__nombre">
                <span class="lugar__pieza">{{ l.titulo }} <span v-if="!l.obligatorio" class="lugar__opcional">opcional</span></span>
                <span v-if="elegidos[l.id]" :class="['lugar__seleccion', { 'lugar__seleccion--error': estadoElegido(l) === 'error' }]">
                  {{ elegidos[l.id].nombre }}<template v-if="estadoElegido(l) === 'error'"> · no es compatible</template>
                </span>
                <span v-else class="lugar__seleccion lugar__seleccion--vacia">Sin elegir</span>
              </span>
              <span v-if="elegidos[l.id]" class="lugar__elegido">{{ pesos(elegidos[l.id].precio) }}</span>
              <svg :class="['lugar__flecha', { girada: abierto === l.id }]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </h2>
          <div :id="'panel-' + l.id" :class="['lugar__panel', { abierto: abierto === l.id }]" role="region" :aria-hidden="abierto === l.id ? 'false' : 'true'">
            <div class="lugar__interior">
              <div class="lugar__contenido">
                <p v-if="!opciones(l).length" class="texto-sec lugar__vacio">No hay productos de esta categoría en este momento.</p>
                <ul v-else class="opciones" role="radiogroup" :aria-label="l.titulo">
                  <li v-for="o in opciones(l)" :key="o.p.id">
                    <button
                      type="button"
                      role="radio"
                      :tabindex="abierto === l.id ? 0 : -1"
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
              </div>
            </div>
          </div>
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
      // Pieza desplegada: arranca en la primera que falte elegir
      abierto: (LUGARES.find((l) => !armado.sel[l.id]) || LUGARES[0]).id,
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
    // Al elegir una pieza se cierra y se abre la siguiente que falte.
    elegir (lugar, id) {
      const quitando = armado.sel[lugar] === id
      elegir(lugar, id)
      if (quitando) return
      const i = LUGARES.findIndex((l) => l.id === lugar)
      const siguiente = LUGARES.slice(i + 1).find((l) => !armado.sel[l.id])
      this.abierto = siguiente ? siguiente.id : null
      // Lleva la vista hasta la pieza que se abrió (después de la animación)
      if (siguiente) {
        setTimeout(() => {
          const boton = this.$el.querySelector(`[aria-controls="panel-${siguiente.id}"]`)
          if (boton) boton.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
        }, 300)
      }
    },
    estadoElegido (l) {
      const p = this.elegidos[l.id]
      return p ? compatibilidad(l.id, p, { ...this.elegidos, [l.id]: null }).estado : null
    },
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

.lugares { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; counter-reset: lugar; }
.lugar { padding: 0; overflow: hidden; }
.lugar__titulo { margin: 0; font-size: inherit; counter-increment: lugar; }
.lugar__boton { width: 100%; min-height: 64px; display: flex; align-items: center; gap: 14px; padding: 12px 18px; border: 0; background: transparent; font: inherit; color: var(--texto); text-align: left; cursor: pointer; }
.lugar__boton:focus { outline: none; }
.lugar__boton:focus-visible { outline: 2px solid var(--magenta); outline-offset: -4px; border-radius: 14px; }
.lugar__nombre { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lugar__pieza { font-size: 17px; font-weight: 600; }
.lugar__pieza::before { content: counter(lugar) ". "; color: var(--texto-2); font-weight: 500; }
.lugar__opcional { font-size: 13px; font-weight: 400; color: var(--texto-2); }
.lugar__seleccion { font-size: 14px; color: var(--texto-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lugar__seleccion--vacia { font-style: normal; opacity: 0.8; }
.lugar__seleccion--error { color: var(--error); font-weight: 600; }
.lugar__elegido { font-weight: 650; font-variant-numeric: tabular-nums; white-space: nowrap; }
.lugar__flecha { flex: none; color: var(--texto-2); transition: transform 0.2s ease; }
.lugar__flecha.girada { transform: rotate(180deg); }
.lugar__panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.28s ease; }
.lugar__panel.abierto { grid-template-rows: 1fr; }
.lugar__interior { overflow: hidden; }
.lugar__contenido { padding: 0 16px 16px; opacity: 0; transition: opacity 0.2s ease; }
.lugar__panel.abierto .lugar__contenido { opacity: 1; transition-delay: 0.08s; }
.lugar__vacio { margin: 0; }
@media (prefers-reduced-motion: reduce) { .lugar__panel, .lugar__contenido, .lugar__flecha { transition: none; } }

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
