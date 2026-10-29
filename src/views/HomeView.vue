<template>
  <div class="inicio">
    <!-- HERO -->
    <section class="hero">
      <div class="contenedor hero__grid">
        <div class="hero__texto">
          <h1>Placas de video revisadas y hardware para tu PC.</h1>
          <p class="texto-sec">Cada placa usada pasa por control de temperaturas y rendimiento antes de publicarse. Comprá online y retirá en Ituzaingó.</p>
          <div class="hero__acciones">
            <router-link :to="{ name: 'listado', query: { categoria: 'Placas de video' } }" class="btn btn--primario">
              Ver placas de video
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </router-link>
            <router-link to="/arma-tu-pc" class="btn btn--fantasma">Armá tu PC</router-link>
          </div>
        </div>
        <div class="hero__logo">
          <LogoParticles :src="logoCirculo" descripcion="Logo de mono.tecno, la cara de un mono con antifaz, dibujado con puntitos" />
        </div>
      </div>
    </section>

    <!-- CATEGORÍAS -->
    <section class="seccion seccion--compacta">
      <div class="contenedor">
        <h2 class="titulo-seccion">Comprá por categoría</h2>
        <div class="categorias">
          <router-link
            v-for="c in categoriasConStock"
            :key="c.nombre"
            :to="{ name: 'listado', query: { categoria: c.nombre } }"
            class="categoria tarjeta"
          >
            <span class="categoria__icono"><CategoryIcon :categoria="c.nombre" /></span>
            <span class="categoria__nombre">{{ c.nombre }}</span>
            <span class="categoria__cant">{{ c.cantidad }} {{ c.cantidad === 1 ? 'producto' : 'productos' }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- DESTACADOS -->
    <section class="seccion seccion--compacta">
      <div class="contenedor">
        <div class="cabecera">
          <h2 class="titulo-seccion">Destacados</h2>
          <router-link to="/productos" class="seccion__mas">Ver todo el catálogo →</router-link>
        </div>
        <transition-group tag="div" name="grilla" class="grilla" appear>
          <ProductCard v-for="p in destacados" :key="p.id" :producto="p" :dolar="dolar" @agregar="agregarAlCarrito" @comparar="comparar" />
        </transition-group>
      </div>
    </section>

    <!-- CÓMO REVISAMOS -->
    <section class="banda">
      <div class="contenedor banda__grid">
        <div>
          <span class="banda__eyebrow">Usadas, pero revisadas</span>
          <h2>Elegí por presupuesto, no por suerte.</h2>
        </div>
        <ul class="controles">
          <li v-for="c in controles" :key="c.titulo">
            <span class="controles__check" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <div>
              <strong>{{ c.titulo }}</strong>
              <p>{{ c.texto }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- API -->
    <section class="seccion seccion--compacta">
      <div class="contenedor">
        <DolarWidget @cotizacion="dolar = $event" />
      </div>
    </section>
  </div>
</template>

<script>
import ProductCard from '../components/ProductCard.vue'
import CategoryIcon from '../components/CategoryIcon.vue'
import DolarWidget from '../components/DolarWidget.vue'
import LogoParticles from '../components/LogoParticles.vue'
import { obtenerProductos } from '../services/productosService'
import { agregar } from '../services/carrito'
import { alternarComparacion, comparacion, MAX_COMPARAR } from '../services/comparar'
import { CATEGORIAS } from '../data/productosIniciales'
import logoCirculo from '../assets/logo-circulo.png'

export default {
  name: 'HomeView',
  components: { ProductCard, CategoryIcon, DolarWidget, LogoParticles },
  emits: ['notificar'],
  data () {
    return {
      logoCirculo,
      productos: [],
      dolar: null,
      controles: [
        { titulo: 'Temperaturas', texto: 'Stress test de 30 minutos midiendo GPU y memoria.' },
        { titulo: 'VRM y conectores', texto: 'Revisión visual de componentes, puertos y cables de alimentación.' },
        { titulo: 'Rendimiento', texto: 'Benchmarks comparados con valores de referencia del modelo.' },
        { titulo: 'Limpieza', texto: 'Se limpian los ventiladores y, si hace falta, se cambia la pasta térmica.' }
      ]
    }
  },
  computed: {
    destacados () {
      // Solo productos con stock: primero los marcados como destacados y, si alguno se agotó,
      // su lugar lo ocupa automáticamente otro producto con stock (el de mayor precio).
      const conStock = this.productos.filter((p) => p.stock > 0)
      const marcados = conStock.filter((p) => p.destacado)
      const reemplazos = conStock.filter((p) => !p.destacado).sort((a, b) => b.precio - a.precio)
      return [...marcados, ...reemplazos].slice(0, 4)
    },
    categoriasConStock () {
      return CATEGORIAS
        .map((nombre) => ({ nombre, cantidad: this.productos.filter((p) => p.categoria === nombre).length }))
        .filter((c) => c.cantidad > 0)
    },
  },
  created () {
    this.productos = obtenerProductos()
  },
  methods: {
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
.hero { padding: 32px 0 8px; overflow-x: clip; } /* el canvas del logo se sale a los costados sin generar scroll */
.hero__grid { display: grid; gap: 24px; align-items: center; }
.hero__texto { display: flex; flex-direction: column; gap: 16px; }
.hero h1 { font-size: clamp(36px, 7.5vw, 68px); line-height: 1; letter-spacing: -0.03em; text-wrap: balance; }
.hero p { margin: 0; font-size: 18px; max-width: 500px; }
.hero__acciones { display: flex; flex-wrap: wrap; gap: 10px; }
.hero__logo { display: none; width: 100%; max-width: 500px; justify-self: center; }

.seccion--compacta { padding: 40px 0; }
.categorias {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 20px;
}
.categoria {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  color: var(--texto);
  text-decoration: none !important;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.categoria:hover { border-color: var(--magenta); transform: translateY(-2px); }
.categoria__icono {
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: var(--rosa);
  color: var(--sobre-rosa);
  display: flex;
  align-items: center;
  justify-content: center;
}
.categoria__nombre { font-weight: 600; }
.categoria__cant { font-size: 13px; color: var(--texto-2); }

.cabecera { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 8px 16px; margin-bottom: 20px; }
.grilla {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 600px) {
  .grilla { grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
}
.grilla-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.grilla-enter-from { opacity: 0; transform: translateY(16px); }

.banda { background: var(--magenta); color: #fff; padding: 56px 0; margin: 24px 0; }
.banda__grid { display: grid; gap: 28px; }
.banda__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0b0b2a;
}
.banda h2 { margin-top: 12px; font-size: clamp(32px, 6vw, 58px); line-height: 1; text-wrap: balance; }
.controles { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.controles li {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radio);
  background: var(--papel);
  color: var(--texto);
}
.controles__check {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--navy);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.controles p { margin: 2px 0 0; font-size: 14px; color: var(--texto-2); }

@media (min-width: 640px) {
  .categorias { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .controles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 900px) {
  .hero { padding: 56px 0 16px; }
  .hero__grid { grid-template-columns: 1.15fr 1fr; gap: 56px; }
  .hero__logo { display: block; }
  .categorias { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .banda { padding: 88px 0; }
  .banda__grid { grid-template-columns: 1fr 1.3fr; align-items: center; gap: 56px; }
}
.seccion__mas { display: inline-flex; align-items: center; min-height: 44px; }
</style>
