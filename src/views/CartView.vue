<template>
  <div class="contenedor carrito">
    <h1 class="titulo-seccion">Tu carrito</h1>

    <div v-if="!items.length" class="tarjeta vacio">
      <h2>Tu carrito está vacío</h2>
      <p class="texto-sec">Buscá lo que necesitás y agregalo desde el catálogo.</p>
      <router-link to="/productos" class="btn btn--primario">Ir al catálogo</router-link>
    </div>

    <div v-else class="carrito__grid">
      <section aria-label="Productos en el carrito">
        <transition-group tag="ul" name="fila" class="lista">
          <li v-for="item in items" :key="item.producto.id" class="fila tarjeta">
            <router-link :to="{ name: 'detalle', params: { id: item.producto.id } }" class="fila__foto">
              <img :src="foto(item.producto)" :alt="item.producto.nombre">
            </router-link>
            <div class="fila__info">
              <router-link :to="{ name: 'detalle', params: { id: item.producto.id } }" class="fila__nombre">{{ item.producto.nombre }}</router-link>
              <span class="fila__meta">{{ item.producto.condicion }} · {{ pesos(item.producto.precio) }} c/u</span>
              <div class="fila__acciones">
                <QuantityStepper
                  :model-value="item.cantidad"
                  :max="item.producto.stock"
                  :etiqueta="'Cantidad de ' + item.producto.nombre"
                  @update:model-value="cambiar(item.producto.id, $event)"
                />
                <button type="button" class="fila__quitar" :aria-label="'Quitar ' + item.producto.nombre" @click="quitarItem(item.producto.id)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></svg>
                  <span>Quitar</span>
                </button>
              </div>
            </div>
            <span class="fila__subtotal">{{ pesos(item.producto.precio * item.cantidad) }}</span>
          </li>
        </transition-group>
        <router-link to="/productos" class="carrito__seguir">← Seguir comprando</router-link>
      </section>

      <aside class="resumen tarjeta" aria-label="Resumen de la compra">
        <h2>Resumen</h2>
        <dl class="resumen__lineas">
          <div><dt>Productos ({{ unidades }})</dt><dd>{{ pesos(subtotal) }}</dd></div>
          <div><dt>Envío</dt><dd class="texto-sec">Se elige en el próximo paso</dd></div>
          <div class="resumen__total"><dt>Total</dt><dd>{{ pesos(subtotal) }}</dd></div>
        </dl>
        <p class="resumen__promo">
          <strong>{{ pesos(conTransferencia) }}</strong> pagando con transferencia ({{ porcentaje }} % off)
        </p>
        <router-link ref="continuar" :to="{ name: 'checkout' }" class="btn btn--primario resumen__btn">Continuar compra</router-link>
        <MediosDePago compacto />
      </aside>
    </div>

    <!-- En celular: total y "Continuar" siempre a mano del pulgar -->
    <transition name="barra">
      <div v-if="items.length && mostrarBarra" class="barra-accion">
        <div class="barra-accion__precio">
          <strong>{{ pesos(subtotal) }}</strong>
          <span>{{ unidades }} {{ unidades === 1 ? 'producto' : 'productos' }}</span>
        </div>
        <router-link :to="{ name: 'checkout' }" class="btn btn--primario">Continuar compra</router-link>
      </div>
    </transition>
  </div>
</template>

<script>
import QuantityStepper from '../components/QuantityStepper.vue'
import MediosDePago from '../components/MediosDePago.vue'
import { detalleCarrito, cambiarCantidad, quitar } from '../services/carrito'
import { formatearPesos } from '../services/dolarService'
import { resolverImagen } from '../services/imagenes'
import { precioConDescuento } from '../services/precios'
import { TIENDA } from '../config/tienda'

export default {
  name: 'CartView',
  components: { QuantityStepper, MediosDePago },
  emits: ['notificar'],
  data () {
    return { mostrarBarra: false, observador: null }
  },
  mounted () {
    // Muestra la barra fija cuando el botón "Continuar compra" del resumen no se ve en pantalla.
    const boton = this.$refs.continuar && this.$refs.continuar.$el
    if (boton && window.IntersectionObserver) {
      this.observador = new IntersectionObserver(([e]) => { this.mostrarBarra = !e.isIntersecting }, { rootMargin: '0px 0px -140px 0px' })
      this.observador.observe(boton)
    }
  },
  beforeUnmount () {
    if (this.observador) this.observador.disconnect()
  },
  computed: {
    // Se recalcula solo cuando cambia el carrito, porque detalleCarrito() lee el estado reactivo.
    items () {
      return detalleCarrito()
    },
    unidades () {
      return this.items.reduce((t, i) => t + i.cantidad, 0)
    },
    subtotal () {
      return this.items.reduce((t, i) => t + i.producto.precio * i.cantidad, 0)
    },
    conTransferencia () {
      return precioConDescuento(this.subtotal)
    },
    porcentaje () {
      return Math.round(TIENDA.pagos.transferencia.descuento * 100)
    }
  },
  methods: {
    pesos (v) { return formatearPesos(v) },
    foto (p) { return resolverImagen(p.imagen) },
    cambiar (id, cantidad) { cambiarCantidad(id, cantidad) },
    quitarItem (id) {
      quitar(id)
      this.$emit('notificar', { mensaje: 'Producto quitado del carrito.', tipo: 'info' })
    }
  }
}
</script>

<style scoped>
.carrito { padding-top: 28px; padding-bottom: 96px; display: flex; flex-direction: column; gap: 20px; }
.carrito__grid { display: grid; gap: 20px; align-items: start; }
.carrito__seguir { display: inline-flex; align-items: center; min-height: 44px; margin-top: 8px; }
.lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; position: relative; }
.fila { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 12px 14px; padding: 12px; }
.fila__foto { width: 88px; aspect-ratio: 4 / 3; border-radius: 10px; overflow: hidden; background: #fff; border: 1px solid var(--borde); }
.fila__foto img { width: 100%; height: 100%; object-fit: cover; }
.fila__info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.fila__nombre { color: var(--texto); font-weight: 600; line-height: 1.3; }
.fila__meta { font-size: 13px; color: var(--texto-2); }
.fila__acciones { display: flex; align-items: center; gap: 12px; margin-top: 6px; flex-wrap: wrap; }
.fila__quitar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--borde);
  border-radius: 12px;
  background: var(--papel);
  font: inherit;
  font-size: 14px;
  color: var(--error);
  cursor: pointer;
}
.fila__quitar:active { background: #fff5f4; }
@media (max-width: 479px) {
  .fila__acciones { flex-wrap: nowrap; gap: 8px; }
  .fila__quitar { width: 50px; min-height: 50px; padding: 0; justify-content: center; }
  .fila__quitar span { display: none; } /* solo el ícono: el nombre accesible está en aria-label */
}
.fila__subtotal { grid-column: 2; font-size: 18px; font-weight: 650; font-variant-numeric: tabular-nums; }
.fila-move,
.fila-enter-active,
.fila-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fila-enter-from,
.fila-leave-to { opacity: 0; transform: translateX(-24px); }
.fila-leave-active { position: absolute; width: 100%; }

.resumen { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.resumen h2 { font-size: 24px; }
.resumen__lineas { margin: 0; display: flex; flex-direction: column; gap: 8px; }
.resumen__lineas div { display: flex; justify-content: space-between; gap: 12px; font-size: 15px; }
.resumen__lineas dd { margin: 0; font-variant-numeric: tabular-nums; text-align: right; }
.resumen__total { padding-top: 10px; border-top: 1px solid var(--borde); font-size: 20px !important; font-weight: 650; }
.resumen__promo { margin: 0; padding: 10px 12px; border-radius: 10px; background: #e7f4ec; color: var(--exito); font-size: 14px; }
.resumen__btn { width: 100%; }
.vacio { padding: 36px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.vacio h2 { font-size: 26px; }
.vacio p { margin: 0 0 6px; }

@media (min-width: 640px) {
  .fila { grid-template-columns: 112px minmax(0, 1fr) auto; align-items: center; }
  .fila__foto { width: 112px; }
  .fila__subtotal { grid-column: 3; }
}
@media (min-width: 960px) {
  .carrito { padding-top: 40px; }
  .carrito__grid { grid-template-columns: minmax(0, 1fr) 380px; gap: 28px; }
  .resumen { position: sticky; top: 96px; }
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
