<template>
  <!-- Barra de navegación inferior para celular, estilo app (como Instagram). En escritorio no se muestra. -->
  <nav class="barra" aria-label="Navegación principal">
    <router-link v-for="b in botones" :key="b.to" :to="b.to" :class="['barra__btn', { activo: esActivo(b) }]" :aria-label="b.etiqueta">
      <span class="barra__icono">
        <svg width="26" height="26" viewBox="0 0 24 24" :fill="esActivo(b) && b.relleno ? 'currentColor' : 'none'" stroke="currentColor" :stroke-width="esActivo(b) ? 2.3 : 1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path :d="b.icono" />
        </svg>
        <transition name="pop" mode="out-in">
          <span v-if="b.to === '/carrito' && cantidad" :key="cantidad" class="barra__badge">{{ cantidad }}</span>
        </transition>
      </span>
      <span class="barra__texto">{{ b.etiqueta }}</span>
    </router-link>
  </nav>
</template>

<script>
import { carrito } from '../services/carrito'

export default {
  name: 'BottomNav',
  data () {
    return {
      botones: [
        { to: '/', etiqueta: 'Inicio', exacto: true, relleno: true, icono: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
        { to: '/productos', etiqueta: 'Catálogo', relleno: false, icono: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
        { to: '/acerca', etiqueta: 'Nosotros', relleno: false, icono: 'M3 9l1.5-5h15L21 9M3 9h18M3 9v1a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0V9M5 13v8h14v-8M10 21v-5h4v5' },
        { to: '/carrito', etiqueta: 'Carrito', relleno: false, icono: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2M10 20.5h.01M17 20.5h.01' },
        { to: '/cuenta', etiqueta: 'Cuenta', relleno: true, icono: 'M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0z' }
      ]
    }
  },
  computed: {
    cantidad () {
      return carrito.items.reduce((t, i) => t + i.cantidad, 0)
    }
  },
  methods: {
    esActivo (b) {
      const ruta = this.$route.path
      if (b.exacto) return ruta === b.to
      if (b.to === '/carrito') return ruta === '/carrito' || ruta === '/checkout'
      return ruta.startsWith(b.to)
    }
  }
}
</script>

<style scoped>
.barra {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  padding: 6px max(8px, env(safe-area-inset-left, 0px)) calc(6px + env(safe-area-inset-bottom, 0px)) max(8px, env(safe-area-inset-right, 0px));
  background: color-mix(in srgb, var(--papel) 94%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid var(--borde);
}
.barra__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 52px;
  color: var(--texto-2);
  text-decoration: none !important;
  -webkit-tap-highlight-color: transparent;
}
.barra__btn.activo { color: var(--texto); }
.barra__btn:active .barra__icono { transform: scale(0.88); }
.barra__icono { position: relative; display: flex; transition: transform 0.12s ease; }
.barra__texto { font-size: 11px; font-weight: 500; }
.barra__btn.activo .barra__texto { font-weight: 700; }
.barra__badge {
  position: absolute;
  top: -5px;
  right: -9px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--magenta);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--papel);
  font-variant-numeric: tabular-nums;
}
.pop-enter-active { transition: transform 0.25s cubic-bezier(0.3, 1.6, 0.6, 1); }
.pop-enter-from { transform: scale(0.4); }

@media (min-width: 860px) {
  .barra { display: none; }
}
</style>
