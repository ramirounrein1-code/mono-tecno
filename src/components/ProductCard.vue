<template>
  <article class="card tarjeta">
    <router-link :to="{ name: 'detalle', params: { id: producto.id } }" class="card__imagen" :aria-label="'Ver ' + producto.nombre">
      <img v-if="foto && !imagenRota" :src="foto" :alt="producto.nombre" loading="lazy" @error="imagenRota = true">
      <span v-else class="card__icono"><CategoryIcon :categoria="producto.categoria" :tamano="44" /></span>
      <span :class="['card__condicion', 'card__condicion--' + claseCondicion]">{{ producto.condicion }}</span>
      <span v-if="producto.stock === 0" class="card__agotado">Sin stock</span>
    </router-link>

    <div class="card__cuerpo">
      <h3 class="card__nombre">
        <router-link :to="{ name: 'detalle', params: { id: producto.id } }">{{ producto.nombre }}</router-link>
      </h3>
      <div class="card__precios">
        <span class="card__precio">{{ precio }}</span>
      </div>
      <span class="card__transfer">{{ precioTransferencia }} con transferencia</span>
      <span v-if="producto.stock > 0 && producto.stock <= 1" class="card__ultima">¡Última unidad!</span>

      <div class="card__pie">
        <button
          type="button"
          class="btn btn--primario card__comprar"
          :disabled="!puedeAgregar"
          @click="$emit('agregar', producto)"
        >
          <svg v-if="puedeAgregar" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          {{ textoBoton }}
        </button>
      </div>
    </div>
  </article>
</template>

<script>
import CategoryIcon from './CategoryIcon.vue'
import { formatearPesos } from '../services/dolarService'
import { resolverImagen } from '../services/imagenes'
import { carrito } from '../services/carrito'
import { precioConDescuento } from '../services/precios'

export default {
  name: 'ProductCard',
  components: { CategoryIcon },
  props: {
    producto: { type: Object, required: true },
    // Cotización del dólar oficial (de la API) para mostrar el precio aproximado en USD.
    dolar: { type: Number, default: null }
  },
  emits: ['agregar'],
  data () {
    return { imagenRota: false }
  },
  computed: {
    foto () {
      return resolverImagen(this.producto.imagen)
    },
    precio () {
      return formatearPesos(this.producto.precio)
    },
    precioTransferencia () {
      return formatearPesos(precioConDescuento(this.producto.precio))
    },
    enCarrito () {
      const item = carrito.items.find((i) => i.id === this.producto.id)
      return item ? item.cantidad : 0
    },
    puedeAgregar () {
      return this.producto.stock > this.enCarrito
    },
    textoBoton () {
      if (this.producto.stock === 0) return 'Sin stock'
      if (!this.puedeAgregar) return 'Ya está en tu carrito'
      return 'Agregar al carrito'
    },
    claseCondicion () {
      return this.producto.condicion.toLowerCase()
    }
  }
}
</script>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.card:hover { border-color: #cfc6c8; transform: translateY(-2px); }
.card__imagen {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0b0b2a;
  border-bottom: 1px solid var(--borde);
}
.card__imagen img { width: 100%; height: 100%; object-fit: cover; }
.card__icono {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  background: var(--rosa);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card__condicion {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: var(--navy);
  color: #fff;
}
.card__condicion--nuevo { background: var(--exito); }
.card__condicion--reacondicionado { background: var(--magenta-texto); }
.card__agotado {
  position: absolute;
  inset: auto 10px 10px auto;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--texto);
  font-size: 12px;
  font-weight: 600;
}
.card__cuerpo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px 16px;
  flex: 1;
}
.card__nombre { font-size: 17px; font-weight: 600; letter-spacing: -0.01em; line-height: 1.3; }
.card__nombre a { color: var(--texto); }
/* El nombre ocupa siempre 2 líneas: así el precio queda a la misma altura en todas las tarjetas. */
.card__nombre {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  min-height: calc(2em * 1.3);
}
.card__precios { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.card__precio { font-size: 22px; font-weight: 650; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.card__ultima { font-size: 13px; font-weight: 600; color: var(--magenta-texto); }
.card__transfer { font-size: 13px; color: var(--exito); font-weight: 500; }
.card__pie { margin-top: auto; padding-top: 14px; }
.card__comprar { width: 100%; }
</style>

<style scoped>
/* En celular la tienda muestra 2 productos por fila: la tarjeta se compacta. */
@media (max-width: 599px) {
  .card__cuerpo { padding: 10px 10px 12px; gap: 3px; }
    .card__nombre { font-size: 14px; -webkit-line-clamp: 3; line-clamp: 3; min-height: calc(3em * 1.3); }
    .card__precio { font-size: 18px; }
    .card__ultima { font-size: 12px; }
  .card__transfer { font-size: 11px; }
  .card__condicion { top: 6px; left: 6px; padding: 3px 8px; font-size: 11px; }
  .card__pie { padding-top: 10px; }
  .card__comprar { min-height: 48px; padding: 0 8px; font-size: 14px; gap: 4px; border-radius: 12px; }
}
</style>
