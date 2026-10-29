<template>
  <footer class="footer">
    <div class="contenedor footer__grid">
      <div class="footer__marca">
        <div class="footer__logo">
          <img :src="logo" alt="" width="32" height="32">
          <span>mono.tecno</span>
        </div>
        <p>Servicio técnico de PC en Ituzaingó: reparación, armado a medida y venta de placas de video revisadas.</p>
      </div>
      <div class="footer__col">
        <h2>Tienda</h2>
        <router-link :to="{ name: 'listado', query: { categoria: 'Placas de video' } }">Placas de video</router-link>
        <router-link :to="{ name: 'listado', query: { categoria: 'Procesadores' } }">Procesadores</router-link>
        <router-link to="/productos">Todo el catálogo</router-link>
        <router-link to="/arma-tu-pc">Armá tu PC</router-link>
        <router-link to="/comparar">Comparar productos</router-link>
        <router-link to="/carrito">Carrito</router-link>
      </div>
      <div class="footer__col">
        <h2>Ayuda</h2>
        <router-link to="/cuenta">Mi cuenta y mis pedidos</router-link>
        <router-link to="/acerca">Nosotros y cómo comprar</router-link>
      </div>
      <div class="footer__col">
        <h2>Contacto</h2>
        <a :href="'https://instagram.com/' + tienda.instagram" target="_blank" rel="noopener noreferrer">Instagram @{{ tienda.instagram }}</a>
        <a href="https://www.google.com/maps/search/?api=1&query=Ituzaing%C3%B3%2C%20Buenos%20Aires" target="_blank" rel="noopener noreferrer">{{ tienda.zona }}</a>
      </div>
    </div>
    <div class="contenedor footer__legal">© {{ anio }} mono.tecno · Todos los derechos reservados</div>
  </footer>
</template>

<script>
import logo from '../assets/logo-circulo.png'
import { TIENDA } from '../config/tienda'

export default {
  name: 'AppFooter',
  data () {
    return { logo, tienda: TIENDA }
  },
  computed: {
    anio () {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer { background: var(--pie); color: #fff; padding: 56px 0 32px; margin-top: 40px; }
.footer__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px; }
.footer__logo { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 17px; }
.footer__logo img { border-radius: 999px; }
.footer__marca p { margin: 10px 0 0; color: rgba(255, 255, 255, 0.72); font-size: 14px; max-width: 300px; }
.footer__col { display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
.footer__col h2 { font-size: 14px; font-weight: 700; letter-spacing: 0; }
.footer__col a,
.footer__col span { color: rgba(255, 255, 255, 0.72); }
.footer__col a:hover { color: #fff; }
@media (max-width: 859px) {
  .footer__col { gap: 0; }
  .footer__col h2 { margin-bottom: 4px; }
  .footer__col a { display: flex; align-items: center; min-height: 44px; }
  .footer__col span { padding: 10px 0; }
}
.footer__legal { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.12); font-size: 13px; color: rgba(255, 255, 255, 0.6); }
</style>
