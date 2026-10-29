<template>
  <div class="buscador tarjeta" role="search">
    <div class="buscador__texto">
      <label for="busqueda" class="sr-only">Buscar en el catálogo</label>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      <input
        id="busqueda"
        type="search"
        placeholder="Buscar por nombre, marca o modelo…"
        :value="busqueda"
        @input="$emit('update:busqueda', $event.target.value)"
      >
    </div>

    <div class="buscador__campo">
      <label for="categoria">Categoría</label>
      <select id="categoria" :value="categoria" @change="$emit('update:categoria', $event.target.value)">
        <option value="">Todas</option>
        <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div class="buscador__campo">
      <label for="condicion">Condición</label>
      <select id="condicion" :value="condicion" @change="$emit('update:condicion', $event.target.value)">
        <option value="">Todas</option>
        <option v-for="c in condiciones" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div class="buscador__campo">
      <label for="marca">Marca</label>
      <select id="marca" :value="marca" @change="$emit('update:marca', $event.target.value)">
        <option value="">Todas</option>
        <option v-for="m in marcas" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>

    <div class="buscador__campo">
      <label for="precio">Precio</label>
      <select id="precio" :value="rangoElegido" @change="elegirRango($event.target.value)">
        <option value="">Cualquier precio</option>
        <option v-for="r in rangos" :key="r.id" :value="r.id">{{ r.nombre }}</option>
        <option value="propio">Elegir un rango…</option>
      </select>
    </div>

    <!-- Rango propio: desde / hasta -->
    <div v-if="rangoElegido === 'propio'" class="buscador__rango">
      <div class="buscador__campo">
        <label for="precio-min">Desde $</label>
        <input id="precio-min" type="number" inputmode="numeric" min="0" step="10000" placeholder="0" :value="precioMin ?? ''" @input="$emit('update:precioMin', numero($event.target.value))">
      </div>
      <div class="buscador__campo">
        <label for="precio-max">Hasta $</label>
        <input id="precio-max" type="number" inputmode="numeric" min="0" step="10000" placeholder="Sin límite" :value="precioMax ?? ''" @input="$emit('update:precioMax', numero($event.target.value))">
      </div>
    </div>

    <div class="buscador__campo">
      <label for="orden">Ordenar por</label>
      <select id="orden" :value="orden" @change="$emit('update:orden', $event.target.value)">
        <option value="precio-desc">Mayor precio</option>
        <option value="precio-asc">Menor precio</option>
        <option value="recientes">Más recientes</option>
        <option value="nombre-asc">Nombre (A-Z)</option>
        <option value="nombre-desc">Nombre (Z-A)</option>
      </select>
    </div>

    <label class="buscador__check">
      <input type="checkbox" :checked="soloStock" @change="$emit('update:soloStock', $event.target.checked)">
      <span>Solo con stock</span>
    </label>
  </div>
</template>

<script>
// Buscador + filtros + orden del catálogo.
// Usa v-model con varios argumentos: v-model:busqueda, v-model:categoria, v-model:condicion, v-model:orden, v-model:solo-stock.
export default {
  name: 'SearchBar',
  props: {
    busqueda: { type: String, default: '' },
    categoria: { type: String, default: '' },
    condicion: { type: String, default: '' },
    orden: { type: String, default: 'precio-desc' },
    soloStock: { type: Boolean, default: false },
    marca: { type: String, default: '' },
    marcas: { type: Array, default: () => [] },
    precioMin: { type: Number, default: null },
    precioMax: { type: Number, default: null },
    categorias: { type: Array, required: true },
    condiciones: { type: Array, required: true }
  },
  emits: ['update:busqueda', 'update:categoria', 'update:condicion', 'update:orden', 'update:soloStock', 'update:marca', 'update:precioMin', 'update:precioMax'],
  data () {
    return {
      propio: false,
      // Rangos rápidos de precio (en pesos)
      rangos: [
        { id: 'hasta-150', nombre: 'Hasta $ 150.000', min: null, max: 150000 },
        { id: '150-300', nombre: '$ 150.000 a $ 300.000', min: 150000, max: 300000 },
        { id: '300-450', nombre: '$ 300.000 a $ 450.000', min: 300000, max: 450000 },
        { id: 'mas-450', nombre: 'Más de $ 450.000', min: 450000, max: null }
      ]
    }
  },
  computed: {
    // Qué opción del select corresponde a los valores actuales de mínimo y máximo.
    rangoElegido () {
      if (this.propio) return 'propio'
      if (this.precioMin == null && this.precioMax == null) return ''
      const r = this.rangos.find((x) => x.min === this.precioMin && x.max === this.precioMax)
      return r ? r.id : 'propio'
    }
  },
  methods: {
    elegirRango (id) {
      this.propio = id === 'propio'
      if (id === 'propio') return
      const r = this.rangos.find((x) => x.id === id)
      this.$emit('update:precioMin', r ? r.min : null)
      this.$emit('update:precioMax', r ? r.max : null)
    },
    numero (v) {
      const n = parseInt(String(v).replace(/\D/g, ''), 10)
      return Number.isFinite(n) ? n : null
    }
  }
}
</script>

<style scoped>
.buscador__rango { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.buscador__rango input { width: 100%; min-width: 0; min-height: 44px; padding: 0 10px; border: 1px solid var(--borde); border-radius: 10px; background: var(--papel); font: inherit; font-size: 16px; color: var(--texto); }
.buscador {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
}
.buscador__texto {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  min-height: 48px;
  border: 1px solid var(--borde);
  border-radius: 12px;
  color: var(--texto-2);
  background: var(--fondo);
}
.buscador__campo { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.buscador__campo label { font-size: 12px; font-weight: 600; color: var(--texto-2); }
input[type="search"],
select {
  font: inherit;
  font-size: 16px; /* evita el zoom automático en iOS */
  color: var(--texto);
}
input[type="search"] {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  min-height: 46px;
  outline: none;
}
select {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0 10px;
  border: 1px solid var(--borde);
  border-radius: 10px;
  background: var(--papel);
}
.buscador__check {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  font-size: 14px;
  cursor: pointer;
}
.buscador__check input { width: 18px; height: 18px; accent-color: var(--magenta); }
@media (min-width: 980px) {
  .buscador {
    grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
    align-items: end;
  }
  .buscador__texto { grid-column: 1 / -1; }
  .buscador__rango { grid-column: 4 / span 2; grid-row: 3; }
}
</style>
