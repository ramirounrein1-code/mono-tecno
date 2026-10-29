<template>
  <div class="contenedor listado">
    <header class="listado__cabecera">
      <h1 class="titulo-seccion">{{ categoria || 'Catálogo' }}</h1>
      <p class="texto-sec">{{ textoResultados }}</p>
    </header>

    <SearchBar
      v-model:busqueda="busqueda"
      v-model:categoria="categoria"
      v-model:condicion="condicion"
      v-model:orden="orden"
      v-model:solo-stock="soloStock"
      v-model:marca="marca"
      v-model:precio-min="precioMin"
      v-model:precio-max="precioMax"
      :categorias="categorias"
      :condiciones="condiciones"
      :marcas="marcas"
    />

    <div v-if="hayFiltros" class="listado__filtros">
      <span v-if="busqueda" class="chip">“{{ busqueda }}”</span>
      <span v-if="categoria" class="chip">{{ categoria }}</span>
      <span v-if="condicion" class="chip">{{ condicion }}</span>
      <span v-if="marca" class="chip">{{ marca }}</span>
      <span v-if="precioMin != null || precioMax != null" class="chip">{{ textoPrecio }}</span>
      <span v-if="soloStock" class="chip">Con stock</span>
      <button type="button" class="listado__limpiar" @click="limpiarFiltros">Limpiar filtros</button>
    </div>

    <!-- transition-group: anima las tarjetas al filtrar u ordenar -->
    <transition-group tag="div" name="grilla" class="grilla">
      <ProductCard
        v-for="p in productosFiltrados"
        :key="p.id"
        :producto="p"
        :dolar="dolar"
        @agregar="agregarAlCarrito"
        @comparar="comparar"
      />
    </transition-group>

    <div v-if="!productosFiltrados.length" class="vacio tarjeta">
      <h2>No encontramos productos</h2>
      <p class="texto-sec">Probá con otra búsqueda o escribinos por Instagram y lo conseguimos.</p>
      <button type="button" class="btn btn--fantasma" @click="limpiarFiltros">Ver todo el catálogo</button>
    </div>
  </div>
</template>

<script>
import SearchBar from '../components/SearchBar.vue'
import ProductCard from '../components/ProductCard.vue'
import { obtenerProductos } from '../services/productosService'
import { obtenerCotizaciones } from '../services/dolarService'
import { agregar } from '../services/carrito'
import { alternarComparacion, comparacion, MAX_COMPARAR } from '../services/comparar'
import { CATEGORIAS, CONDICIONES } from '../data/productosIniciales'

// Quita tildes y pasa a minúsculas para que la búsqueda sea más tolerante.
const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default {
  name: 'ProductsView',
  components: { SearchBar, ProductCard },
  emits: ['notificar'],
  data () {
    return {
      productos: [],
      categorias: CATEGORIAS,
      condiciones: CONDICIONES,
      busqueda: '',
      categoria: '',
      condicion: '',
      orden: 'precio-desc',
      soloStock: false,
      marca: '',
      precioMin: null,
      precioMax: null,
      dolar: null
    }
  },
  computed: {
    // 1) Filtra por texto, categoría, condición y stock. 2) Ordena según el criterio elegido.
    productosFiltrados () {
      const palabras = normalizar(this.busqueda.trim()).split(/\s+/).filter(Boolean)
      const lista = this.productos.filter((p) => {
        const texto = normalizar(`${p.nombre} ${p.marca} ${p.categoria} ${p.specs || ''} ${p.sku}`)
        return palabras.every((w) => texto.includes(w)) &&
          (!this.categoria || p.categoria === this.categoria) &&
          (!this.condicion || p.condicion === this.condicion) &&
          (!this.soloStock || p.stock > 0) &&
          (!this.marca || p.marca === this.marca) &&
          (this.precioMin == null || p.precio >= this.precioMin) &&
          (this.precioMax == null || p.precio <= this.precioMax)
      })
      const comparadores = {
        recientes: (a, b) => b.fechaAlta.localeCompare(a.fechaAlta),
        'nombre-asc': (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
        'nombre-desc': (a, b) => b.nombre.localeCompare(a.nombre, 'es'),
        'precio-asc': (a, b) => a.precio - b.precio,
        'precio-desc': (a, b) => b.precio - a.precio
      }
      // Los productos sin stock van al final.
      return [...lista].sort((a, b) => (b.stock > 0) - (a.stock > 0) || comparadores[this.orden](a, b))
    },
    // Marcas disponibles (sale de los productos cargados; si se elige una categoría, solo las de esa categoría).
    marcas () {
      const lista = this.productos.filter((p) => !this.categoria || p.categoria === this.categoria).map((p) => p.marca)
      return [...new Set(lista)].sort((a, b) => a.localeCompare(b, 'es'))
    },
    textoPrecio () {
      const f = (v) => '$ ' + v.toLocaleString('es-AR')
      if (this.precioMin != null && this.precioMax != null) return `${f(this.precioMin)} a ${f(this.precioMax)}`
      if (this.precioMax != null) return `Hasta ${f(this.precioMax)}`
      return `Desde ${f(this.precioMin)}`
    },
    hayFiltros () {
      return !!(this.busqueda || this.categoria || this.condicion || this.soloStock || this.marca || this.precioMin != null || this.precioMax != null)
    },
    textoResultados () {
      const n = this.productosFiltrados.length
      return `${n} ${n === 1 ? 'producto' : 'productos'}`
    }
  },
  watch: {
    // Mantiene búsqueda y categoría en la URL para poder compartir el link.
    busqueda () { this.actualizarUrl() },
    categoria () {
      // Si la marca elegida no existe en la nueva categoría, se limpia.
      if (this.marca && !this.marcas.includes(this.marca)) this.marca = ''
      this.actualizarUrl()
    },
    marca () { this.actualizarUrl() },
    precioMin () { this.actualizarUrl() },
    precioMax () { this.actualizarUrl() },
    // Si se busca desde el encabezado estando en esta página, se toma la nueva búsqueda.
    '$route.query' (q) {
      if ((q.q || '') !== this.busqueda) this.busqueda = q.q || ''
      if ((q.categoria || '') !== this.categoria && (!q.categoria || CATEGORIAS.includes(q.categoria))) this.categoria = q.categoria || ''
    }
  },
  // created: leemos los productos de LocalStorage y los filtros que vengan en la URL.
  created () {
    this.productos = obtenerProductos()
    const { q, categoria, marca, desde, hasta } = this.$route.query
    if (q) this.busqueda = q
    if (categoria && CATEGORIAS.includes(categoria)) this.categoria = categoria
    if (marca) this.marca = String(marca).slice(0, 40)
    if (/^\d{1,9}$/.test(desde || '')) this.precioMin = Number(desde)
    if (/^\d{1,9}$/.test(hasta || '')) this.precioMax = Number(hasta)
  },
  // mounted: con la vista en pantalla, pedimos la cotización para mostrar el precio aproximado en dólares.
  async mounted () {
    try {
      const cotizaciones = await obtenerCotizaciones()
      const oficial = cotizaciones.find((c) => c.casa === 'oficial')
      this.dolar = oficial ? oficial.venta : null
    } catch (e) {
      this.dolar = null
    }
  },
  methods: {
    actualizarUrl () {
      const query = {}
      if (this.busqueda.trim()) query.q = this.busqueda.trim()
      if (this.categoria) query.categoria = this.categoria
      if (this.marca) query.marca = this.marca
      if (this.precioMin != null) query.desde = String(this.precioMin)
      if (this.precioMax != null) query.hasta = String(this.precioMax)
      const actual = this.$route.query
      const claves = ['q', 'categoria', 'marca', 'desde', 'hasta']
      if (claves.some((k) => (actual[k] || '') !== (query[k] || ''))) {
        this.$router.replace({ query })
      }
    },
    limpiarFiltros () {
      this.busqueda = ''
      this.categoria = ''
      this.condicion = ''
      this.soloStock = false
      this.marca = ''
      this.precioMin = null
      this.precioMax = null
    },
    // Comparar: agrega o saca el producto de la comparación y avisa.
    comparar (producto) {
      const r = alternarComparacion(producto.id)
      const n = comparacion.ids.length
      if (r === 'lleno') this.$emit('notificar', { mensaje: `Podés comparar hasta ${MAX_COMPARAR} productos. Sacá uno para sumar otro.`, tipo: 'info', accion: { texto: 'Ver comparación', to: '/comparar' } })
      else if (r === 'agregado') this.$emit('notificar', { mensaje: n < 2 ? `Sumaste “${producto.nombre}”. Elegí otro para comparar.` : `Sumaste “${producto.nombre}” a la comparación.`, tipo: 'info', accion: n >= 2 ? { texto: 'Comparar', to: '/comparar' } : null })
    },
    agregarAlCarrito (producto) {
      if (agregar(producto)) this.$emit('notificar', { mensaje: `Agregaste “${producto.nombre}” al carrito.`, accion: { texto: 'Ver carrito', to: '/carrito' } })
    }
  }
}
</script>

<style scoped>
.listado { padding-top: 28px; padding-bottom: 48px; display: flex; flex-direction: column; gap: 18px; }
.listado__cabecera { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 8px 16px; }
.listado__cabecera p { margin: 0; }
.listado__filtros { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.listado__limpiar {
  border: 0;
  background: none;
  padding: 8px 4px;
  min-height: 44px;
  font: inherit;
  font-size: 14px;
  color: var(--magenta-texto);
  cursor: pointer;
  text-decoration: underline;
}
.grilla {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 600px) {
  .grilla { grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
}
.vacio { padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.vacio h2 { font-size: 24px; }
.vacio p { margin: 0 0 8px; }

/* Animaciones del transition-group */
.grilla-move,
.grilla-enter-active,
.grilla-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.grilla-enter-from,
.grilla-leave-to { opacity: 0; transform: scale(0.95); }
.grilla-leave-active { position: absolute; width: 230px; }

@media (min-width: 768px) {
  .listado { padding-top: 40px; }
}
</style>
