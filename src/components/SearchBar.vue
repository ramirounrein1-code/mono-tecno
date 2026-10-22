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
    categorias: { type: Array, required: true },
    condiciones: { type: Array, required: true }
  },
  emits: ['update:busqueda', 'update:categoria', 'update:condicion', 'update:orden', 'update:soloStock']
}
</script>

<style scoped>
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
    grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr)) auto;
    align-items: end;
  }
  .buscador__texto { grid-column: auto; }
}
</style>
