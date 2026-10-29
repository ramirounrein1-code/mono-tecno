<template>
  <div class="contenedor detalle">
    <router-link :to="{ name: 'listado' }" class="detalle__volver">← Volver al catálogo</router-link>

    <div v-if="!producto" class="tarjeta vacio">
      <h1>Producto no encontrado</h1>
      <p class="texto-sec">Puede que ya se haya vendido.</p>
      <router-link to="/productos" class="btn btn--primario">Ir al catálogo</router-link>
    </div>

    <article v-else class="detalle__grid">
      <figure class="detalle__imagen tarjeta">
        <img v-if="foto && !imagenRota" :src="foto" :alt="producto.nombre" @error="imagenRota = true">
        <span v-else class="detalle__icono"><CategoryIcon :categoria="producto.categoria" :tamano="72" /></span>
        <figcaption>Foto ilustrativa</figcaption>
      </figure>

      <div class="detalle__info">
        <div class="detalle__etiquetas">
          <span class="chip">{{ producto.condicion }}</span>
          <span class="detalle__cat">{{ producto.categoria }} · {{ producto.marca }}</span>
        </div>
        <h1>{{ producto.nombre }}</h1>
        <p v-if="producto.specs" class="detalle__specs">{{ producto.specs }}</p>

        <div ref="compra" class="detalle__compra tarjeta">
          <div class="detalle__precios">
            <span class="detalle__precio">{{ precio }}</span>
            <span class="detalle__transfer"><strong>{{ precioTransferencia }}</strong> con transferencia o efectivo</span>
            <span v-if="precioUsd" class="texto-sec detalle__usd">≈ {{ precioUsd }} al dólar oficial</span>
          </div>
          <span :class="['detalle__stock', { 'detalle__stock--agotado': producto.stock === 0 }]">{{ textoStock }}</span>

          <div v-if="disponible > 0" class="detalle__agregar">
            <QuantityStepper v-model="cantidad" :max="disponible" etiqueta="Cantidad a agregar" />
            <button type="button" class="btn btn--primario" @click="agregarAlCarrito">Agregar al carrito</button>
          </div>
          <p v-else-if="producto.stock > 0" class="detalle__aviso">Ya tenés todas las unidades disponibles en tu carrito. <router-link to="/carrito">Ver carrito</router-link></p>
          <a v-else class="btn btn--fantasma" href="https://instagram.com/mono.tecno" target="_blank" rel="noopener noreferrer">Avisame cuando vuelva (Instagram)</a>
        </div>

        <p class="detalle__desc">{{ producto.descripcion }}</p>

        <section v-if="producto.ideal && producto.ideal.length" class="ideal" aria-labelledby="t-ideal">
          <h2 id="t-ideal">Ideal para</h2>
          <ul>
            <li v-for="i in producto.ideal" :key="i">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              {{ i }}
            </li>
          </ul>
        </section>

        <section class="ficha tarjeta" aria-labelledby="t-ficha">
          <h2 id="t-ficha">Ficha técnica</h2>
          <dl>
            <div v-for="[dato, valor] in fichaCompleta" :key="dato">
              <dt>{{ dato }}</dt>
              <dd>{{ valor }}</dd>
            </div>
          </dl>
          <p class="ficha__nota">Datos de referencia del fabricante. Pueden variar levemente según la marca y versión del producto.</p>
        </section>
      </div>
    </article>

    <!-- En celular: botón de compra siempre a mano del pulgar -->
    <transition name="barra">
      <div v-if="producto && disponible > 0 && mostrarBarra" class="barra-accion">
        <div class="barra-accion__precio">
          <strong>{{ precio }}</strong>
          <span>{{ precioTransferencia }} transf.</span>
        </div>
        <button type="button" class="btn btn--primario" @click="agregarAlCarrito">Agregar al carrito</button>
      </div>
    </transition>
  </div>
</template>

<script>
import CategoryIcon from '../components/CategoryIcon.vue'
import QuantityStepper from '../components/QuantityStepper.vue'
import { precioConDescuento } from '../services/precios'
import { obtenerProducto } from '../services/productosService'
import { obtenerCotizaciones, formatearPesos, formatearDolares } from '../services/dolarService'
import { resolverImagen } from '../services/imagenes'
import { carrito, agregar } from '../services/carrito'

export default {
  name: 'ProductDetailView',
  components: { CategoryIcon, QuantityStepper },
  props: {
    id: { type: String, required: true } // viene de la ruta /productos/:id
  },
  emits: ['notificar'],
  data () {
    return {
      producto: null,
      dolar: null,
      cantidad: 1,
      imagenRota: false,
      mostrarBarra: false,
      observador: null
    }
  },
  computed: {
    foto () {
      return resolverImagen(this.producto.imagen)
    },
    precio () {
      return formatearPesos(this.producto.precio)
    },
    // Ficha del producto + datos generales (marca, condición, SKU) al final.
    fichaCompleta () {
      const f = Array.isArray(this.producto.ficha) ? this.producto.ficha : []
      return [...f, ['Marca', this.producto.marca], ['Condición', this.producto.condicion], ['SKU', this.producto.sku]]
    },
    precioTransferencia () {
      return formatearPesos(precioConDescuento(this.producto.precio))
    },
    precioUsd () {
      return this.dolar ? formatearDolares(Math.round(this.producto.precio / this.dolar)) : ''
    },
    // Unidades que todavía se pueden agregar (stock menos lo que ya está en el carrito).
    disponible () {
      const item = carrito.items.find((i) => i.id === this.producto.id)
      return this.producto.stock - (item ? item.cantidad : 0)
    },
    textoStock () {
      if (this.producto.stock === 0) return 'Sin stock por ahora'
      if (this.producto.stock === 1) return 'Última unidad disponible'
      return `${this.producto.stock} unidades disponibles`
    }
  },
  created () {
    this.producto = obtenerProducto(this.id)
  },
  async mounted () {
    this.observarBoton(this.$refs.compra)
    try {
      const cotizaciones = await obtenerCotizaciones()
      const oficial = cotizaciones.find((c) => c.casa === 'oficial')
      this.dolar = oficial ? oficial.venta : null
    } catch (e) {
      this.dolar = null
    }
  },
  beforeUnmount () {
    if (this.observador) this.observador.disconnect()
  },
  methods: {
    pesos (v) { return formatearPesos(v) },
    // Muestra la barra fija cuando la tarjeta de compra ya no se ve en pantalla.
    observarBoton (el) {
      if (!el || !window.IntersectionObserver) return
      this.observador = new IntersectionObserver(([e]) => { this.mostrarBarra = !e.isIntersecting }, { rootMargin: '0px 0px -140px 0px' })
      this.observador.observe(el)
    },
    agregarAlCarrito () {
      const n = agregar(this.producto, this.cantidad)
      if (n) {
        this.$emit('notificar', { mensaje: `Agregaste ${n} × “${this.producto.nombre}” al carrito.`, accion: { texto: 'Ver carrito', to: '/carrito' } })
        this.cantidad = 1
      }
    }
  }
}
</script>

<style scoped>
.detalle { padding-top: 20px; padding-bottom: 48px; }
.detalle__volver { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: 8px; }
.detalle__grid { display: grid; gap: 24px; }
.detalle__imagen {
  position: relative;
  margin: 0;
  aspect-ratio: 4 / 3;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fff;
  color: var(--navy);
}
.detalle__imagen img { width: 100%; height: 100%; object-fit: cover; }
.detalle__imagen figcaption {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  color: var(--texto-2);
}
.detalle__icono {
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background: var(--rosa);
  display: flex;
  align-items: center;
  justify-content: center;
}
.detalle__info { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.detalle__etiquetas { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.detalle__cat { font-size: 13px; font-weight: 600; color: var(--texto-2); text-transform: uppercase; letter-spacing: 0.04em; }
.detalle__info h1 { font-size: clamp(28px, 5vw, 44px); text-wrap: balance; }
.detalle__specs { margin: 0; font-size: 16px; color: var(--texto-2); }
.detalle__compra { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
.detalle__precios { display: flex; flex-direction: column; gap: 2px; }
.detalle__precio { font-size: 36px; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.detalle__stock { font-size: 14px; font-weight: 600; color: var(--exito); }
.detalle__stock--agotado { color: var(--error); }
.detalle__agregar { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
.detalle__agregar .btn { flex: 1 1 200px; }
.detalle__aviso { margin: 0; font-size: 14px; }
.detalle__desc { margin: 0; font-size: 17px; line-height: 1.6; }
.ideal h2,
.ficha h2 { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; }
.ideal ul { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.ideal li { display: flex; align-items: center; gap: 10px; font-size: 15px; }
.ideal svg { flex: none; width: 24px; height: 24px; padding: 4px; border-radius: 999px; background: #e7f4ec; color: var(--exito); }
.ficha { padding: 18px 18px 14px; }
.ficha dl { margin: 12px 0 0; }
.ficha dl div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 12px; padding: 10px 0; border-top: 1px solid var(--borde); font-size: 14px; }
.ficha dt { color: var(--texto-2); }
.ficha dd { margin: 0; font-weight: 600; overflow-wrap: anywhere; }
.ficha__nota { margin: 8px 0 0; font-size: 12px; color: var(--texto-2); }
.detalle__transfer { margin-top: 4px; font-size: 15px; color: var(--exito); }
.detalle__usd { font-size: 13px; }
.vacio { padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.vacio h1 { font-size: 28px; }

@media (max-width: 859px) {
  .detalle { padding-bottom: 96px; }
}
@media (min-width: 900px) {
  .detalle { padding-top: 32px; }
  .detalle__grid { grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: start; }
  .detalle__imagen { position: sticky; top: 92px; align-self: start; }
}

/* Barra fija para el pulgar (solo celular): aparece cuando el botón principal sale de la pantalla. */
.barra-accion {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid var(--borde);
  box-shadow: 0 -6px 18px rgba(11, 11, 42, 0.08);
}
.barra-accion__precio { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }
.barra-accion__precio strong { font-size: 19px; font-weight: 650; font-variant-numeric: tabular-nums; }
.barra-accion__precio span { font-size: 12px; color: var(--texto-2); }
.barra-accion .btn { flex: 1; min-height: 52px; }
.barra-enter-active, .barra-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.barra-enter-from, .barra-leave-to { transform: translateY(100%); opacity: 0; }
@media (min-width: 860px) { .barra-accion { display: none; } }
</style>
