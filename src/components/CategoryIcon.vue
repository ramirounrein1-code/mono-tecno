<template>
  <svg :width="tamano" :height="tamano" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="trazo" />
  </svg>
</template>

<script>
// Ícono de línea según la categoría del producto (se reutiliza en tarjetas, detalle e inicio).
const ICONOS = {
  Procesadores: 'M7 7h10v10H7zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  'Placas de video': 'M2 7h20v10H2zM6 17v3M8 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0M15 10h4M15 14h4',
  Motherboards: 'M4 4h16v16H4zM8 8h4v4H8zM15 8h2M15 12h2M8 16h9',
  'Memorias RAM': 'M3 8h18v8H3zM7 16v3M11 16v3M15 16v3M7 11h2M11 11h2M15 11h2',
  Almacenamiento: 'M4 6h16v12H4zM8 12h.01M12 10h5M12 14h5',
  Fuentes: 'M4 6h16v12H4zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M7 9h.01',
  Gabinetes: 'M7 3h10v18H7zM10 7h4M12 13a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
  Refrigeración: 'M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9 4l3 2 3-2M9 20l3-2 3 2'
}

export default {
  name: 'CategoryIcon',
  props: {
    categoria: { type: String, required: true },
    tamano: { type: [Number, String], default: 24 }
  },
  computed: {
    trazo () {
      return ICONOS[this.categoria] || 'M4 4h16v16H4z'
    }
  }
}
</script>
