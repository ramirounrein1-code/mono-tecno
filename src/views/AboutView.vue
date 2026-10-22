<template>
  <div class="acerca">
    <section class="contenedor acerca__intro">
      <img :src="logo" alt="Logo de mono.tecno" class="acerca__logo" width="160" height="160">
      <div>
        <span class="eyebrow">Nosotros</span>
        <h1 class="titulo-seccion">mono.tecno</h1>
        <p class="texto-sec">Servicio técnico de PC en Ituzaingó: reparación, limpieza y mejoras, armado de PCs personalizado y venta de placas de video usadas, revisadas al detalle antes de publicarse.</p>
      </div>
    </section>

    <section class="contenedor acerca__grid">
      <div class="tarjeta bloque">
        <h2>Cómo comprar</h2>
        <ol>
          <li>Agregá los productos al carrito.</li>
          <li>Completá tus datos y elegí retiro o envío.</li>
          <li>Pagá con Mercado Pago, transferencia o efectivo al retirar.</li>
          <li>Te escribimos para coordinar la entrega.</li>
        </ol>
      </div>
      <div class="tarjeta bloque">
        <h2>Envíos</h2>
        <ul>
          <li v-for="e in tienda.envios" :key="e.id"><strong>{{ e.nombre }}</strong>: {{ e.costo ? pesos(e.costo) : 'gratis' }}. {{ e.detalle }}</li>
        </ul>
      </div>
      <div class="tarjeta bloque">
        <MediosDePago />
      </div>
      <div class="tarjeta bloque">
        <h2>Garantía</h2>
        <p class="texto-sec">{{ tienda.garantia }}</p>
        <h2 class="bloque__sub">Servicios</h2>
        <ul>
          <li>Reparación, limpieza y mejoras</li>
          <li>Armado de PCs personalizado</li>
        </ul>
      </div>
      <div class="tarjeta bloque">
        <h2>Contacto</h2>
        <ul class="contacto">
          <li><a :href="'https://instagram.com/' + tienda.instagram" target="_blank" rel="noopener">Instagram @{{ tienda.instagram }}</a></li>
          <li>{{ tienda.zona }}</li>
          <li>{{ tienda.horarios }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import logo from '../assets/logo-cuadrado.jpg'
import MediosDePago from '../components/MediosDePago.vue'
import { TIENDA } from '../config/tienda'
import { formatearPesos } from '../services/dolarService'

export default {
  name: 'AboutView',
  components: { MediosDePago },
  data () {
    return { logo, tienda: TIENDA }
  },
  methods: {
    pesos (v) { return formatearPesos(v) }
  }
}
</script>

<style scoped>
.acerca { padding: 32px 0 48px; display: flex; flex-direction: column; gap: 32px; }
.acerca__intro { display: flex; flex-direction: column; gap: 24px; }
.acerca__intro p { margin: 12px 0 0; font-size: 17px; max-width: 640px; }
.acerca__logo { width: 120px; height: 120px; border-radius: var(--radio-lg); }
.acerca__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
.bloque { padding: 20px; }
.bloque h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
.bloque__sub { margin-top: 18px; }
.bloque ul,
.bloque ol { margin: 12px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; font-size: 15px; }
.bloque p { margin: 10px 0 0; font-size: 14px; }
.contacto { list-style: none; padding-left: 0 !important; }

@media (min-width: 768px) {
  .acerca { padding-top: 56px; }
  .acerca__intro { flex-direction: row; align-items: center; gap: 40px; }
  .acerca__logo { width: 160px; height: 160px; }
}
</style>
