<template>
  <div class="nos">
    <!-- 1. Presentación -->
    <section class="contenedor nos__hero">
      <div class="nos__hero-texto">
        <span class="eyebrow">Nosotros</span>
        <h1>Servicio técnico de PC en Ituzaingó.</h1>
        <p>Reparamos, limpiamos y mejoramos computadoras, armamos PCs a medida y vendemos placas de video usadas que revisamos una por una antes de publicarlas.</p>
        <div class="nos__acciones">
          <a :href="linkInstagram" target="_blank" rel="noopener noreferrer" class="btn btn--primario">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
            Escribinos por Instagram
          </a>
          <router-link to="/productos" class="btn btn--fantasma">Ver el catálogo</router-link>
        </div>
      </div>
      <div class="nos__marca" aria-hidden="true">
        <img :src="logo" alt="" width="220" height="220">
        <ul class="nos__datos">
          <li><span>Zona</span>{{ tienda.zona }}</li>
          <li><span>Horario</span>{{ tienda.horarios }}</li>
        </ul>
      </div>
    </section>

    <!-- 2. Qué hacemos -->
    <section class="contenedor nos__bloque" aria-labelledby="t-servicios">
      <h2 id="t-servicios" class="nos__titulo">Qué hacemos</h2>
      <div class="servicios">
        <article v-for="s in servicios" :key="s.titulo" class="tarjeta servicio">
          <span class="servicio__icono" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path v-for="(d, i) in s.icono" :key="i" :d="d" /></svg>
          </span>
          <h3>{{ s.titulo }}</h3>
          <p>{{ s.texto }}</p>
        </article>
      </div>
    </section>

    <!-- 3. Cómo revisamos las placas usadas -->
    <section class="nos__banda" aria-labelledby="t-revision">
      <div class="contenedor">
        <span class="eyebrow eyebrow--claro">Usadas, pero revisadas</span>
        <h2 id="t-revision">Cómo revisamos cada placa antes de venderla</h2>
        <ol class="pasos">
          <li v-for="(p, i) in revision" :key="p.titulo" class="paso">
            <span class="paso__num">{{ i + 1 }}</span>
            <div>
              <h3>{{ p.titulo }}</h3>
              <p>{{ p.texto }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- 4. Cómo comprar -->
    <section class="contenedor nos__bloque" aria-labelledby="t-comprar">
      <h2 id="t-comprar" class="nos__titulo">Cómo comprar</h2>
      <ol class="compra">
        <li v-for="(p, i) in comoComprar" :key="p" class="tarjeta compra__paso">
          <span class="compra__num">{{ i + 1 }}</span>
          <p>{{ p }}</p>
        </li>
      </ol>
    </section>

    <!-- 5. Envíos, pagos y garantía -->
    <section class="contenedor nos__bloque nos__info" aria-label="Envíos y garantía">
      <div class="tarjeta info">
        <h2>Envíos y retiro</h2>
        <ul class="envios">
          <li v-for="e in tienda.envios" :key="e.id">
            <div class="envios__fila"><strong>{{ e.nombre }}</strong><span :class="{ gratis: !e.costo }">{{ e.costo ? pesos(e.costo) : 'Gratis' }}</span></div>
            <span class="texto-sec">{{ e.detalle }}</span>
          </li>
        </ul>
      </div>
      <div class="tarjeta info">
        <h2>Garantía</h2>
        <ul class="garantia">
          <li><strong>Placas usadas:</strong> 3 meses de garantía de mono.tecno.</li>
          <li><strong>Productos nuevos:</strong> garantía oficial del fabricante.</li>
        </ul>
        <p class="texto-sec">Si algo falla, escribinos con tu número de pedido y lo revisamos.</p>
      </div>
    </section>

    <!-- 6. Preguntas frecuentes -->
    <section class="contenedor nos__bloque" aria-labelledby="t-faq">
      <h2 id="t-faq" class="nos__titulo">Preguntas frecuentes</h2>
      <div class="faq">
        <div v-for="(f, i) in preguntas" :key="f.p" class="tarjeta faq__item">
          <h3>
            <button type="button" class="faq__pregunta" :aria-expanded="abierta === i ? 'true' : 'false'" :aria-controls="'faq-' + i" @click="abierta = abierta === i ? null : i">
              <span>{{ f.p }}</span>
              <svg :class="['faq__flecha', { 'faq__flecha--abierta': abierta === i }]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </h3>
          <!-- La respuesta se despliega suave (animando la altura con grid) -->
          <div :id="'faq-' + i" :class="['faq__panel', { abierto: abierta === i }]" role="region" :aria-hidden="abierta === i ? 'false' : 'true'">
            <div class="faq__interior">
              <p class="faq__respuesta">{{ f.r }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Contacto -->
    <section class="contenedor nos__bloque">
      <div class="contacto">
        <div>
          <h2>¿Tenés una consulta o querés presupuesto?</h2>
          <p>Contanos qué necesitás: arreglar tu PC, armar una nueva o elegir una placa según tu presupuesto.</p>
        </div>
        <div class="contacto__acciones">
          <a :href="linkInstagram" target="_blank" rel="noopener noreferrer" class="btn contacto__btn">Instagram @{{ tienda.instagram }}</a>
          <a v-if="linkWhatsapp" :href="linkWhatsapp" target="_blank" rel="noopener noreferrer" class="btn contacto__btn contacto__btn--borde">WhatsApp</a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import logo from '../assets/logo-cuadrado.jpg'
import { TIENDA } from '../config/tienda'
import { formatearPesos } from '../services/dolarService'

export default {
  name: 'AboutView',
  data () {
    return {
      logo,
      tienda: TIENDA,
      abierta: null,
      servicios: [
        { titulo: 'Reparación y limpieza', texto: 'Diagnóstico, limpieza interna, cambio de pasta térmica y mejoras para que tu PC ande fresca y rápida.', icono: ['M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z'] },
        { titulo: 'Armado a medida', texto: 'Te ayudamos a elegir componentes compatibles según tu presupuesto y lo que vas a usar, y te la entregamos armada.', icono: ['M4 4h16v12H4z', 'M8 20h8', 'M12 16v4'] },
        { titulo: 'Placas de video revisadas', texto: 'Vendemos placas usadas probadas una por una, con garantía, además de componentes nuevos.', icono: ['M2 7h20v10H2z', 'M7 17v3', 'M17 17v3', 'M9 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0', 'M17 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0'] }
      ],
      revision: [
        { titulo: 'Temperaturas', texto: 'Stress test de 30 minutos midiendo GPU y memoria.' },
        { titulo: 'VRM y conectores', texto: 'Revisión visual de componentes, puertos y cables de alimentación.' },
        { titulo: 'Rendimiento', texto: 'Benchmarks comparados con valores de referencia del modelo.' },
        { titulo: 'Limpieza', texto: 'Se limpian los ventiladores y, si hace falta, se cambia la pasta térmica.' }
      ],
      comoComprar: [
        'Elegí los productos y agregalos al carrito.',
        'Completá tus datos y elegí retiro o envío.',
        'Pagá con Mercado Pago, transferencia o efectivo al retirar.',
        'Te escribimos para coordinar la entrega.'
      ]
    }
  },
  computed: {
    linkInstagram () {
      return `https://instagram.com/${encodeURIComponent(this.tienda.instagram)}`
    },
    // Solo se muestra si el número está cargado en config/tienda.js
    linkWhatsapp () {
      const n = String(this.tienda.whatsapp).replace(/\D/g, '')
      return n.length >= 10 ? `https://wa.me/${n}` : ''
    },
    preguntas () {
      const t = this.tienda
      const desc = Math.round(t.pagos.transferencia.descuento * 100)
      return [
        { p: '¿Las placas usadas tienen garantía?', r: 'Sí. Todas las placas usadas tienen 3 meses de garantía de mono.tecno, y antes de publicarlas pasan por la revisión de temperaturas, conectores, rendimiento y limpieza.' },
        { p: '¿Hacen envíos?', r: `Sí. Podés retirar gratis en ${t.zona}, pedir envío en moto a zona oeste y CABA (${formatearPesos(t.envios[1].costo)}) o envío por correo a todo el país (${formatearPesos(t.envios[2].costo)}).` },
        { p: '¿Cómo pago?', r: `Con Mercado Pago (tarjetas o dinero en cuenta), transferencia bancaria o efectivo al retirar. Pagando por transferencia o en efectivo tenés ${desc} % de descuento.` },
        { p: '¿Necesito crear una cuenta para comprar?', r: 'No. Podés comprar como invitado. Con una cuenta (o entrando con Google) tus datos se completan solos y podés ver tus pedidos anteriores.' },
        { p: '¿Cuánto tiempo tengo para transferir?', r: 'Tenés 48 horas. Después de ese plazo los productos vuelven a estar a la venta.' },
        { p: '¿Me arman una PC con mi presupuesto?', r: 'Sí. Escribinos por Instagram contándonos qué uso le vas a dar y cuánto querés gastar, y te pasamos opciones.' }
      ]
    }
  },
  methods: {
    pesos (v) { return formatearPesos(v) }
  }
}
</script>

<style scoped>
.nos { padding-bottom: 56px; display: flex; flex-direction: column; gap: 56px; }
.nos__titulo { font-size: clamp(26px, 4vw, 36px); margin-bottom: 20px; }

/* Presentación */
.nos__hero { padding-top: 32px; display: grid; gap: 28px; align-items: center; }
.nos__hero-texto { display: flex; flex-direction: column; gap: 16px; }
.nos__hero h1 { font-size: clamp(36px, 6.5vw, 64px); line-height: 1.02; letter-spacing: -0.03em; text-wrap: balance; }
.nos__hero p { margin: 0; font-size: 18px; color: var(--texto-2); max-width: 560px; }
.nos__acciones { display: flex; flex-wrap: wrap; gap: 10px; }
.nos__marca { display: none; }

/* Qué hacemos */
.servicios { display: grid; gap: 12px; }
.servicio { padding: 22px; display: flex; flex-direction: column; gap: 10px; }
.servicio__icono { width: 48px; height: 48px; border-radius: 14px; background: var(--rosa); color: var(--navy); display: flex; align-items: center; justify-content: center; }
.servicio h3 { font-size: 19px; font-weight: 600; letter-spacing: -0.01em; }
.servicio p { margin: 0; color: var(--texto-2); }

/* Revisión (banda magenta) */
.nos__banda { background: var(--magenta); color: #fff; padding: 48px 0; }
.nos__banda h2 { font-size: clamp(28px, 4.5vw, 44px); color: #fff; max-width: 720px; margin: 8px 0 28px; text-wrap: balance; }
.eyebrow--claro { color: #fff; opacity: 0.9; }
.pasos { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.paso { display: flex; gap: 14px; align-items: flex-start; padding: 18px; border-radius: var(--radio); background: #fff; color: var(--texto); }
.paso__num { flex: none; width: 36px; height: 36px; border-radius: 999px; background: var(--navy); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.paso h3 { font-size: 17px; font-weight: 600; }
.paso p { margin: 4px 0 0; font-size: 14px; color: var(--texto-2); }

/* Cómo comprar */
.compra { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; counter-reset: paso; }
.compra__paso { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.compra__num { width: 32px; height: 32px; border-radius: 999px; border: 1px solid var(--texto); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
.compra__paso p { margin: 0; font-size: 16px; }

/* Envíos, pagos y garantía */
.nos__info { display: grid; gap: 12px; align-items: stretch; }
.info { padding: 22px; display: flex; flex-direction: column; gap: 12px; }
.info h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
.info p { margin: 0; }
.envios, .garantia { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.envios li { display: flex; flex-direction: column; gap: 2px; padding-bottom: 12px; border-bottom: 1px solid var(--borde); }
.envios li:last-child { border-bottom: 0; padding-bottom: 0; }
.envios__fila { display: flex; justify-content: space-between; gap: 12px; }
.envios__fila span { font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums; }
.envios .texto-sec { font-size: 14px; }
.gratis { color: var(--exito); }

/* Preguntas frecuentes */
.faq { display: flex; flex-direction: column; gap: 10px; }
.faq__item { overflow: hidden; }
.faq__item h3 { margin: 0; font-size: inherit; }
.faq__pregunta { width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; border: 0; background: transparent; font: inherit; font-size: 17px; font-weight: 600; line-height: 1.35; color: var(--texto); text-align: left; cursor: pointer; }
.faq__pregunta:focus { outline: none; }
.faq__pregunta:focus-visible { outline: 2px solid var(--magenta); outline-offset: -4px; border-radius: 14px; }
.faq__flecha { flex: none; transition: transform 0.2s ease; color: var(--texto-2); }
.faq__flecha--abierta { transform: rotate(180deg); }
.faq__panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.28s ease; }
.faq__panel.abierto { grid-template-rows: 1fr; }
.faq__interior { overflow: hidden; }
.faq__respuesta { margin: 0; padding: 0 20px 18px; color: var(--texto-2); opacity: 0; transition: opacity 0.2s ease; }
.faq__panel.abierto .faq__respuesta { opacity: 1; transition-delay: 0.08s; }

/* Contacto */
.contacto { background: var(--navy); color: #fff; border-radius: 24px; padding: 32px 24px; display: flex; flex-direction: column; gap: 20px; }
.contacto h2 { color: #fff; font-size: clamp(24px, 3.5vw, 34px); text-wrap: balance; }
.contacto p { margin: 8px 0 0; color: rgba(255, 255, 255, 0.75); max-width: 560px; }
.contacto__acciones { display: flex; flex-wrap: wrap; gap: 10px; }
.contacto__btn { background: var(--magenta); color: #fff; }
.contacto__btn--borde { background: transparent; border-color: rgba(255, 255, 255, 0.5); }

@media (min-width: 700px) {
  .servicios, .compra { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .compra { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .pasos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 900px) {
  .nos { gap: 72px; }
  .nos__hero { padding-top: 56px; grid-template-columns: 1.4fr 1fr; gap: 56px; }
  .nos__marca { display: flex; flex-direction: column; gap: 14px; align-items: stretch; justify-self: end; width: 100%; max-width: 360px; }
  .nos__marca img { width: 100%; height: auto; border-radius: 28px; }
  .nos__datos { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .nos__datos li { background: var(--papel); border: 1px solid var(--borde); border-radius: 14px; padding: 12px 14px; font-size: 14px; display: flex; flex-direction: column; gap: 2px; }
  .nos__datos span { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--texto-2); font-weight: 600; }
  .pasos { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .paso { flex-direction: column; }
  .nos__info { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .nos__banda { padding: 64px 0; }
  .contacto { flex-direction: row; align-items: center; justify-content: space-between; padding: 40px; }
  .contacto__acciones { flex: none; }
}
</style>
