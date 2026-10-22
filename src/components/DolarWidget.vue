<template>
  <section class="dolar tarjeta" aria-labelledby="dolar-titulo">
    <div class="dolar__cabecera">
      <div>
        <span class="eyebrow">API en vivo · DolarAPI</span>
        <h2 id="dolar-titulo">Cotización del día</h2>
      </div>
      <button type="button" class="btn btn--fantasma btn--chico" :disabled="cargando" @click="cargar(true)">
        {{ cargando ? 'Actualizando…' : 'Actualizar' }}
      </button>
    </div>

    <p v-if="cargando && !cotizaciones.length" class="dolar__estado">Cargando cotizaciones…</p>
    <p v-else-if="error" class="dolar__estado dolar__estado--error" role="alert">
      No pudimos traer la cotización del dólar en este momento. Los precios en pesos no cambian.
    </p>

    <transition-group v-else tag="ul" name="lista" class="dolar__lista">
      <li v-for="c in cotizaciones" :key="c.casa" class="dolar__item">
        <span class="dolar__nombre">Dólar {{ c.nombre }}</span>
        <span class="dolar__valor">{{ formatear(c.venta) }}</span>
        <span class="dolar__compra">Compra {{ formatear(c.compra) }}</span>
      </li>
    </transition-group>

    <p v-if="actualizado" class="dolar__pie">Actualizado: {{ actualizado }}. El precio aproximado en dólares de cada producto usa el dólar oficial (venta).</p>
  </section>
</template>

<script>
import { obtenerCotizaciones, formatearPesos } from '../services/dolarService'

export default {
  name: 'DolarWidget',
  emits: ['cotizacion'],
  data () {
    return {
      cotizaciones: [],
      cargando: false,
      error: ''
    }
  },
  computed: {
    actualizado () {
      if (!this.cotizaciones.length) return ''
      const fecha = new Date(this.cotizaciones[0].actualizado)
      return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
    }
  },
  // Hook del ciclo de vida: apenas se crea el componente pedimos los datos a la API.
  created () {
    this.cargar()
  },
  methods: {
    async cargar (forzar = false) {
      this.cargando = true
      this.error = ''
      try {
        if (forzar) localStorage.removeItem('monotecno_dolar_cache')
        this.cotizaciones = await obtenerCotizaciones()
        const oficial = this.cotizaciones.find((c) => c.casa === 'oficial')
        // Avisamos al componente padre el valor del dólar oficial.
        this.$emit('cotizacion', oficial ? oficial.venta : null)
      } catch (e) {
        this.error = e.message
        this.$emit('cotizacion', null)
      } finally {
        this.cargando = false
      }
    },
    formatear (valor) {
      return formatearPesos(valor)
    }
  }
}
</script>

<style scoped>
.dolar { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.dolar__cabecera { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.dolar__cabecera h2 { font-size: 26px; margin-top: 6px; }
.dolar__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}
.dolar__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px;
  border-radius: 12px;
  background: var(--fondo);
}
.dolar__nombre { font-size: 13px; font-weight: 600; color: var(--texto-2); }
.dolar__valor { font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; }
.dolar__compra { font-size: 13px; color: var(--texto-2); font-variant-numeric: tabular-nums; }
.dolar__estado { margin: 0; color: var(--texto-2); }
.dolar__estado--error { color: var(--error); }
.dolar__pie { margin: 0; font-size: 12px; color: var(--texto-2); }

.lista-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.lista-enter-from { opacity: 0; transform: translateY(10px); }
</style>
