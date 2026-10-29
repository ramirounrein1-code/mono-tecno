<template>
  <!-- Barra flotante con los productos elegidos para comparar -->
  <transition name="subir">
    <aside v-if="visible" class="comparar-barra" aria-label="Productos para comparar">
      <ul class="comparar-barra__fotos">
        <li v-for="p in productos" :key="p.id">
          <img :src="foto(p)" :alt="p.nombre" width="56" height="42">
          <button type="button" class="comparar-barra__quitar" :aria-label="'Quitar ' + p.nombre + ' de la comparación'" @click="quitar(p.id)">×</button>
        </li>
        <li v-for="n in libres" :key="'libre' + n" class="comparar-barra__libre" aria-hidden="true"></li>
      </ul>
      <p class="comparar-barra__texto">
        <strong>{{ productos.length }} de {{ max }}</strong>
        <span>{{ productos.length < 2 ? 'Elegí otro producto para comparar' : 'Listos para comparar' }}</span>
      </p>
      <div class="comparar-barra__acciones">
        <button type="button" class="comparar-barra__limpiar" @click="limpiar">Limpiar</button>
        <router-link :to="{ name: 'comparar' }" :class="['btn', 'btn--primario', 'btn--chico', { deshabilitado: productos.length < 2 }]" :aria-disabled="productos.length < 2 ? 'true' : 'false'" @click="evitarSiFalta">Comparar</router-link>
      </div>
    </aside>
  </transition>
</template>

<script>
// Muestra qué productos están elegidos para comparar y lleva a /comparar.
import { comparacion, quitarDeComparacion, limpiarComparacion, MAX_COMPARAR } from '../services/comparar'
import { obtenerProductos } from '../services/productosService'
import { resolverImagen } from '../services/imagenes'

export default {
  name: 'CompareBar',
  data () {
    return { max: MAX_COMPARAR }
  },
  computed: {
    productos () {
      const todos = obtenerProductos()
      return comparacion.ids.map((id) => todos.find((p) => p.id === id)).filter(Boolean)
    },
    libres () {
      return Math.max(0, this.max - this.productos.length)
    },
    // No se muestra en la propia página de comparar, ni en el panel ni en la compra.
    visible () {
      const r = this.$route.path
      return this.productos.length > 0 && r !== '/comparar' && !r.startsWith('/admin') && r !== '/checkout' && r !== '/carrito'
    }
  },
  methods: {
    foto (p) { return resolverImagen(p.imagen) },
    quitar (id) { quitarDeComparacion(id) },
    limpiar () { limpiarComparacion() },
    evitarSiFalta (e) {
      if (this.productos.length < 2) e.preventDefault()
    }
  }
}
</script>

<style scoped>
.comparar-barra {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  z-index: 45;
  width: min(640px, calc(100% - 24px));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--borde);
  border-radius: 18px;
  background: var(--papel);
  box-shadow: 0 10px 30px rgba(11, 11, 42, 0.18);
}
.comparar-barra__fotos { list-style: none; margin: 0; padding: 0; display: flex; gap: 6px; flex: none; }
.comparar-barra__fotos li { position: relative; width: 56px; height: 42px; border-radius: 8px; border: 1px solid var(--borde); background: #fff; }
.comparar-barra__fotos img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.comparar-barra__libre { border-style: dashed !important; background: transparent !important; }
.comparar-barra__quitar { position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; border-radius: 999px; border: 0; background: var(--texto); color: var(--fondo); font-size: 14px; line-height: 1; cursor: pointer; }
.comparar-barra__texto { margin: 0; display: flex; flex-direction: column; font-size: 13px; line-height: 1.3; min-width: 0; flex: 1; }
.comparar-barra__texto span { color: var(--texto-2); }
.comparar-barra__texto strong { white-space: nowrap; }
.comparar-barra__acciones { display: flex; align-items: center; gap: 6px; flex: none; }
.comparar-barra__limpiar { border: 0; background: none; font: inherit; font-size: 14px; color: var(--texto-2); min-height: 44px; padding: 0 8px; cursor: pointer; }
.deshabilitado { opacity: 0.45; pointer-events: auto; cursor: not-allowed; }
.subir-enter-active, .subir-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.subir-enter-from, .subir-leave-to { opacity: 0; transform: translate(-50%, 16px); }
@media (max-width: 520px) {
  .comparar-barra__fotos li { width: 44px; height: 34px; }
  .comparar-barra__texto span { display: none; }
}
@media (min-width: 860px) {
  .comparar-barra { bottom: 20px; }
}
</style>
