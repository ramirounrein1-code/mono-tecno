<template>
  <div class="contenedor pedido">
    <div v-if="!pedido" class="tarjeta vacio">
      <h1>No encontramos ese pedido</h1>
      <p class="texto-sec">Si ya hiciste la compra, escribinos por Instagram con tu nombre.</p>
      <router-link to="/" class="btn btn--primario">Ir al inicio</router-link>
    </div>

    <template v-else>
      <header class="pedido__cabecera">
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

          <template v-if="pedido.pago === 'mercadoPago'">
            <p>Pagá <strong>{{ pesos(pedido.total) }}</strong> con tarjeta de crédito, débito o dinero en cuenta en el sitio seguro de Mercado Pago.</p>
            <a v-if="linkMP" :href="linkMP" target="_blank" rel="noopener" class="btn btn--primario pago__btn">Pagar con Mercado Pago</a>
            <p v-else class="pago__aviso">En unos minutos te mandamos el link de pago por WhatsApp o Instagram al {{ pedido.cliente.telefono }}.</p>
            <p class="texto-sec pago__nota">Cuando se acredite el pago te escribimos para coordinar la entrega.</p>
          </template>

          <template v-else-if="pedido.pago === 'transferencia'">
            <p>Transferí <strong>{{ pesos(pedido.total) }}</strong> a esta cuenta y mandanos el comprobante indicando el pedido <strong>#{{ pedido.numero }}</strong>.</p>
            <dl class="cuenta">
              <div v-for="dato in datosCuenta" :key="dato.etiqueta">
                <dt>{{ dato.etiqueta }}</dt>
                <dd>
                  <span class="cuenta__valor">{{ dato.valor }}</span>
                  <button v-if="dato.copiable" type="button" class="cuenta__copiar" @click="copiar(dato.valor, dato.etiqueta)">{{ copiado === dato.etiqueta ? 'Copiado' : 'Copiar' }}</button>
                </dd>
              </div>
            </dl>
            <a :href="linkInstagram" target="_blank" rel="noopener" class="btn btn--primario pago__btn">Enviar comprobante por Instagram</a>
            <p class="texto-sec pago__nota">Tenés 48 h para transferir. Después de ese plazo los productos vuelven a estar a la venta.</p>
          </template>

          <template v-else>
            <p>Pagás <strong>{{ pesos(pedido.total) }}</strong> en efectivo cuando retirás en {{ zona }}.</p>
            <p class="texto-sec pago__nota">Te escribimos al {{ pedido.cliente.telefono }} para coordinar día y horario ({{ horarios }}).</p>
            <a :href="linkInstagram" target="_blank" rel="noopener" class="btn btn--fantasma pago__btn">Escribirnos por Instagram</a>
          </template>
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
import { obtenerPedido } from '../services/productosService'
import { formatearPesos } from '../services/dolarService'
import { TIENDA } from '../config/tienda'
import { sesion } from '../services/cuentas'

export default {
  name: 'OrderView',
  props: {
    numero: { type: String, required: true }
  },
  data () {
    return {
      pedido: null,
      copiado: '',
      linkMP: TIENDA.pagos.mercadoPago.link,
      zona: TIENDA.zona,
      horarios: TIENDA.horarios,
      linkInstagram: `https://ig.me/m/${TIENDA.instagram}`
    }
  },
  computed: {
    hayCuenta () {
      return !!sesion.usuario
    },
    tituloPago () {
      return { mercadoPago: 'Pagá con Mercado Pago', transferencia: 'Datos para la transferencia', efectivo: 'Pago en efectivo al retirar' }[this.pedido.pago]
    },
    datosCuenta () {
      const t = TIENDA.pagos.transferencia
      return [
        { etiqueta: 'Monto', valor: formatearPesos(this.pedido.total), copiable: false },
        { etiqueta: 'Alias', valor: t.alias, copiable: true },
        { etiqueta: 'CBU / CVU', valor: t.cbu, copiable: true },
        { etiqueta: 'Titular', valor: t.titular, copiable: false },
        { etiqueta: 'Banco', valor: t.banco, copiable: false }
      ]
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
  created () {
    this.pedido = obtenerPedido(this.numero)
  },
  methods: {
    pesos (v) { return formatearPesos(v) },
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
.pedido__cabecera { display: flex; gap: 16px; align-items: center; }
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
</style>
