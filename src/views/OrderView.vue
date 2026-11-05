<template>
  <div class="contenedor pedido">
    <div v-if="!cargado" class="pedido__cargando" aria-busy="true"></div>
    <div v-else-if="!pedido" class="tarjeta vacio">
      <h1>No encontramos ese pedido</h1>
      <p class="texto-sec">Si ya hiciste la compra, escribinos por Instagram con tu nombre.</p>
      <router-link to="/" class="btn btn--primario">Ir al inicio</router-link>
    </div>

    <template v-else>
      <router-link v-if="hayCuenta && !esNuevo" to="/cuenta" class="pedido__volver">← Mis pedidos</router-link>
      <header v-if="!esNuevo" class="pedido__cabecera">
        <div>
          <h1>Pedido #{{ pedido.numero }}</h1>
          <p class="texto-sec">{{ fechaLarga }} · Estado: <span class="chip">{{ pedido.estado }}</span></p>
        </div>
        <button type="button" class="btn btn--primario pedido__repetir" @click="volverAComprar">Volver a comprar</button>
      </header>
      <header v-else class="pedido__cabecera">
        <span class="pedido__ok" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </span>
        <div>
          <h1>¡Gracias, {{ pedido.cliente.nombre }}!</h1>
          <p class="texto-sec">Recibimos tu pedido <strong>#{{ pedido.numero }}</strong>. Estado: <span class="chip">{{ pedido.estado }}</span></p>
        </div>
      </header>

      <div class="pedido__grid">
        <!-- Instrucciones de pago -->
        <section class="tarjeta pago" aria-labelledby="pago-titulo">
          <h2 id="pago-titulo">{{ tituloPago }}</h2>

          <!-- Tienda de práctica: no hay pagos reales -->
          <p>Este pedido es de prueba: <strong>no tenés que pagar nada</strong>. mono.tecno es un proyecto de práctica y no cobra ni pide datos de pago.</p>
          <p class="texto-sec pago__nota">El pedido quedó registrado con el medio que elegiste ({{ nombrePago }}) y se ve en el panel de administración, donde se le cambia el estado.</p>

          <!-- Comprobante de pago: foto o PDF -->
          <div v-if="puedeAdjuntar" class="comprobante" aria-live="polite">
            <h3 class="comprobante__titulo">Comprobante de pago</h3>
            <p v-if="pedido.comprobanteFecha" class="comprobante__ok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              Lo recibimos el {{ fechaComprobante }}. Lo revisamos y te avisamos.
            </p>
            <p v-else class="texto-sec comprobante__texto">¿Ya pagaste? Adjuntá una foto o captura del comprobante (JPG, PNG o PDF, hasta 5 MB).</p>
            <input id="comprobante-archivo" ref="archivo" type="file" class="comprobante__input" :accept="tiposComprobante" :disabled="subiendo" @change="subirComprobante">
            <label for="comprobante-archivo" :class="['btn', pedido.comprobanteFecha ? 'btn--fantasma' : 'btn--primario', 'comprobante__boton', { deshabilitado: subiendo }]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.4 11.6l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" /></svg>
              {{ subiendo ? 'Subiendo…' : (pedido.comprobanteFecha ? 'Cambiar comprobante' : 'Adjuntar comprobante') }}
            </label>
            <p v-if="errorComprobante" class="campo__error" role="alert">{{ errorComprobante }}</p>
          </div>
        </section>

        <!-- Resumen -->
        <section class="tarjeta resumen" aria-labelledby="resumen-titulo">
          <h2 id="resumen-titulo">Resumen del pedido</h2>
          <ul class="resumen__items">
            <li v-for="i in pedido.items" :key="i.id">
              <span>{{ i.cantidad }} × {{ i.nombre }}</span>
              <span class="num">{{ pesos(i.precio * i.cantidad) }}</span>
            </li>
          </ul>
          <dl class="resumen__lineas">
            <div><dt>Productos</dt><dd>{{ pesos(pedido.subtotal) }}</dd></div>
            <div v-if="pedido.descuento"><dt>Descuento</dt><dd class="verde">− {{ pesos(pedido.descuento) }}</dd></div>
            <div><dt>Envío</dt><dd>{{ pedido.envio ? pesos(pedido.envio) : 'Gratis' }}</dd></div>
            <div class="resumen__total"><dt>Total</dt><dd>{{ pesos(pedido.total) }}</dd></div>
          </dl>
          <dl class="resumen__datos">
            <div><dt>Entrega</dt><dd>{{ pedido.entrega.descripcion }}</dd></div>
            <div><dt>Contacto</dt><dd>{{ pedido.cliente.nombre }} {{ pedido.cliente.apellido }} · {{ pedido.cliente.email }} · {{ pedido.cliente.telefono }}</dd></div>
          </dl>
          <button type="button" class="btn btn--fantasma" @click="copiar(textoPedido, 'pedido')">{{ copiado === 'pedido' ? 'Resumen copiado' : 'Copiar resumen del pedido' }}</button>
        </section>
      </div>

      <div class="pedido__links">
        <router-link v-if="hayCuenta" to="/cuenta" class="pedido__seguir">Ver mis pedidos</router-link>
        <router-link to="/productos" class="pedido__seguir">Seguir comprando →</router-link>
      </div>
    </template>
  </div>
</template>

<script>
import { obtenerPedido, actualizarPedidosLocales, adjuntarComprobante, TIPOS_COMPROBANTE } from '../services/productosService'
import { formatearPesos } from '../services/dolarService'
import { TIENDA } from '../config/tienda'
import { nubeActiva } from '../services/nube'
import { sesion, puedeVerPedido } from '../services/cuentas'
import { obtenerProducto } from '../services/productosService'
import { agregar } from '../services/carrito'
import { estaLogueado } from '../services/auth'

export default {
  name: 'OrderView',
  props: {
    numero: { type: String, required: true }
  },
  emits: ['notificar'],
  data () {
    return {
      pedido: null,
      cargado: false,
      copiado: '',
      subiendo: false,
      errorComprobante: '',
      tiposComprobante: TIPOS_COMPROBANTE.join(','),
      zona: TIENDA.zona,
      horarios: TIENDA.horarios,
      linkInstagram: `https://ig.me/m/${TIENDA.instagram}`
    }
  },
  computed: {
    hayCuenta () {
      return !!sesion.usuario
    },
    // Recién comprado (viene del checkout): se muestra el "¡Gracias!". Si no, es un pedido anterior.
    esNuevo () {
      return this.$route.query.nuevo === '1'
    },
    fechaLarga () {
      return new Date(this.pedido.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    // Se puede adjuntar mientras el pedido siga abierto y se haya hecho desde este navegador (tiene su código).
    puedeAdjuntar () {
      return ['Pendiente de pago', 'Pagado'].includes(this.pedido.estado) && (!!this.pedido.token || !nubeActiva())
    },
    fechaComprobante () {
      const d = new Date(this.pedido.comprobanteFecha)
      return `${d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} a las ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}`
    },
    tituloPago () {
      return 'Pedido de prueba'
    },
    nombrePago () {
      return { mercadoPago: 'Mercado Pago', transferencia: 'transferencia', efectivo: 'efectivo al retirar' }[this.pedido.pago] || 'sin elegir'
    },
    textoPedido () {
      const p = this.pedido
      return [
        `Pedido #${p.numero} — ${TIENDA.nombre}`,
        ...p.items.map((i) => `• ${i.cantidad} × ${i.nombre} — ${formatearPesos(i.precio * i.cantidad)}`),
        `Total: ${formatearPesos(p.total)} (${this.tituloPago})`,
        `Entrega: ${p.entrega.descripcion}`,
        `${p.cliente.nombre} ${p.cliente.apellido} · ${p.cliente.telefono}`
      ].join('\n')
    }
  },
  async created () {
    await actualizarPedidosLocales()
    const p = obtenerPedido(this.numero)
    // Privacidad: solo ve el pedido su dueño (o el admin). A cualquier otro le decimos que no existe.
    this.pedido = puedeVerPedido(p, await estaLogueado()) ? p : null
    this.cargado = true
  },
  methods: {
    pesos (v) { return formatearPesos(v) },
    // Agrega al carrito los productos de este pedido que sigan con stock.
    volverAComprar () {
      let agregados = 0
      const sinStock = []
      this.pedido.items.forEach((i) => {
        const prod = obtenerProducto(i.id)
        const n = prod ? agregar(prod, i.cantidad) : 0
        if (n) agregados += n
        else sinStock.push(i.nombre)
      })
      if (!agregados) {
        this.$emit('notificar', { mensaje: 'Esos productos ya no tienen stock.', tipo: 'info' })
        return
      }
      this.$emit('notificar', { mensaje: sinStock.length ? `Agregamos lo que hay en stock. Sin stock: ${sinStock.join(', ')}.` : 'Agregamos los productos al carrito.' })
      this.$router.push({ name: 'carrito' })
    },
    async subirComprobante (e) {
      const archivo = e.target.files && e.target.files[0]
      e.target.value = '' // así se puede volver a elegir el mismo archivo
      if (!archivo) return
      this.errorComprobante = ''
      this.subiendo = true
      try {
        const fecha = await adjuntarComprobante(this.pedido, archivo)
        this.pedido = { ...this.pedido, comprobanteFecha: fecha }
        this.$emit('notificar', { mensaje: 'Recibimos tu comprobante.' })
      } catch (err) {
        this.errorComprobante = err.message
      } finally {
        this.subiendo = false
      }
    },
    async copiar (texto, clave) {
      try {
        await navigator.clipboard.writeText(texto)
        this.copiado = clave
        setTimeout(() => { this.copiado = '' }, 2000)
      } catch (e) {
        window.prompt('Copiá el texto:', texto)
      }
    }
  }
}
</script>

<style scoped>
.pedido { padding-top: 32px; padding-bottom: 48px; display: flex; flex-direction: column; gap: 24px; }
.pedido__cabecera { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.pedido__cabecera h1 { font-size: clamp(28px, 5vw, 44px); }
.pedido__cabecera p { margin: 6px 0 0; }
.pedido__ok { flex: none; width: 56px; height: 56px; border-radius: 999px; background: var(--exito); color: #fff; display: flex; align-items: center; justify-content: center; }
.pedido__grid { display: grid; gap: 16px; align-items: start; }
.pago,
.resumen { padding: 20px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.pago h2,
.resumen h2 { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
.pago p { margin: 0; }
.pago__btn { align-self: flex-start; }
.pago__aviso { padding: 12px 14px; border-radius: 12px; background: var(--rosa); }
.pago__nota { font-size: 14px; }
.comprobante { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; padding-top: 14px; border-top: 1px solid var(--borde); }
.comprobante__titulo { margin: 0; font-size: 17px; font-weight: 600; }
.comprobante__texto { margin: 0; font-size: 14px; }
.comprobante__ok { margin: 0; display: flex; gap: 8px; align-items: flex-start; color: var(--exito); font-weight: 600; font-size: 15px; }
.comprobante__ok svg { flex: none; margin-top: 2px; }
/* El input de archivo queda invisible pero accesible: se usa con el botón (label) */
.comprobante__input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; }
.comprobante__input:focus-visible + .comprobante__boton { outline: 3px solid var(--magenta); outline-offset: 2px; }
.comprobante__boton { align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.comprobante__boton.deshabilitado { opacity: 0.6; cursor: wait; }
.cuenta { margin: 0; border: 1px solid var(--borde); border-radius: 12px; overflow: hidden; }
.cuenta div { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--borde); }
.cuenta div:last-child { border-bottom: 0; }
.cuenta dt { font-size: 13px; color: var(--texto-2); }
.cuenta dd { margin: 0; display: flex; align-items: center; gap: 10px; min-width: 0; text-align: right; }
.cuenta__valor { font-weight: 600; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.cuenta__copiar { flex: none; min-height: 34px; padding: 0 10px; border: 1px solid var(--borde); border-radius: 8px; background: var(--papel); font: inherit; font-size: 13px; cursor: pointer; }
.resumen__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px; }
.resumen__items li { display: flex; justify-content: space-between; gap: 12px; }
.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.resumen__lineas { margin: 0; display: flex; flex-direction: column; gap: 6px; padding-top: 10px; border-top: 1px solid var(--borde); }
.resumen__lineas div { display: flex; justify-content: space-between; gap: 12px; font-size: 15px; }
.resumen__lineas dd { margin: 0; font-variant-numeric: tabular-nums; }
.verde { color: var(--exito); }
.resumen__total { padding-top: 8px; border-top: 1px solid var(--borde); font-size: 19px !important; font-weight: 650; }
.resumen__datos { margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px; }
.resumen__datos dt { font-size: 12px; color: var(--texto-2); }
.resumen__datos dd { margin: 2px 0 0; overflow-wrap: anywhere; }
.pedido__links { display: flex; flex-wrap: wrap; gap: 8px 24px; }
.pedido__seguir { align-self: flex-start; min-height: 44px; display: inline-flex; align-items: center; }
.vacio { padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.vacio h1 { font-size: 28px; }

@media (min-width: 900px) {
  .pedido { padding-top: 48px; }
  .pedido__grid { grid-template-columns: 1.1fr 1fr; gap: 24px; }
}
.pedido__volver { display: inline-flex; align-items: center; min-height: 44px; align-self: flex-start; }
.pedido__repetir { margin-left: auto; }
</style>
