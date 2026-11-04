<template>
  <div class="contenedor legal">
    <nav class="legal__pestanas" aria-label="Documentos legales">
      <router-link to="/privacidad">Política de privacidad</router-link>
      <router-link to="/terminos">Condiciones de uso</router-link>
    </nav>

    <article v-if="tipo === 'privacidad'" class="legal__texto">
      <h1>Política de privacidad</h1>
      <p class="texto-sec">Última actualización: 4 de noviembre de 2026</p>

      <h2>Qué datos usamos</h2>
      <ul>
        <li><strong>Al crear una cuenta:</strong> nombre, apellido, email y teléfono. La contraseña nunca se guarda en texto: se guarda cifrada con un método de un solo sentido.</li>
        <li><strong>Al entrar con Google:</strong> tu nombre, tu email y tu foto de perfil. No accedemos a tus correos, archivos ni contactos.</li>
        <li><strong>Al hacer un pedido:</strong> los datos de contacto, el DNI (para envíos por correo) y la dirección de entrega.</li>
      </ul>

      <h2>Para qué los usamos</h2>
      <p>Solo para preparar y entregar tu pedido, avisarte cómo va y mostrarte tus compras anteriores. No vendemos ni compartimos tus datos con nadie, salvo con el correo o la moto que hace la entrega.</p>

      <h2>Dónde se guardan</h2>
      <p>Los productos y los pedidos se guardan en Supabase, un servicio de base de datos con conexión cifrada. Tu sesión y el carrito se guardan en tu propio navegador.</p>

      <h2>Cookies y seguimiento</h2>
      <p>No usamos cookies de publicidad ni herramientas de seguimiento. Google puede usar las suyas solo si elegís entrar con Google.</p>

      <h2>Tus derechos</h2>
      <p>Podés pedir ver, corregir o borrar tus datos cuando quieras escribiéndonos a <a :href="'https://instagram.com/' + tienda.instagram" target="_blank" rel="noopener noreferrer">@{{ tienda.instagram }}</a> o a {{ email }}. Según la Ley 25.326 de Protección de Datos Personales, la Agencia de Acceso a la Información Pública es el organismo de control.</p>
    </article>

    <article v-else class="legal__texto">
      <h1>Condiciones de uso</h1>
      <p class="texto-sec">Última actualización: 4 de noviembre de 2026</p>

      <h2>Precios y stock</h2>
      <p>Los precios están en pesos argentinos e incluyen impuestos. Pagando por transferencia o en efectivo tenés un {{ descuento }} % de descuento. El stock se reserva cuando confirmás el pedido.</p>

      <h2>Pedidos</h2>
      <ul>
        <li>Cada pedido puede llevar hasta {{ limites.porProducto }} unidades del mismo producto y hasta {{ limites.porPedido }} unidades en total.</li>
        <li>Si pagás por transferencia tenés {{ limites.horasReserva }} horas para enviar el comprobante. Después el pedido se cancela solo y los productos vuelven a estar a la venta.</li>
        <li>Podemos cancelar pedidos con datos falsos o que busquen acaparar stock.</li>
      </ul>

      <h2>Envíos y retiro</h2>
      <p>Podés retirar gratis en {{ tienda.zona }} o pedir envío en moto o por correo. El costo se muestra antes de confirmar la compra.</p>

      <h2>Garantía</h2>
      <p>{{ tienda.garantia }} Si algo falla, escribinos con tu número de pedido y lo revisamos.</p>

      <h2>Cuenta</h2>
      <p>Sos responsable de cuidar tu contraseña. Si entrás con Google, el acceso depende de tu cuenta de Google.</p>
    </article>
  </div>
</template>

<script>
// Política de privacidad y condiciones de uso (Google las pide para publicar el ingreso con Google).
import { TIENDA } from '../config/tienda'
import { LIMITES_PEDIDO } from '../config/limites'

export default {
  name: 'LegalView',
  props: {
    tipo: { type: String, default: 'privacidad' } // 'privacidad' | 'terminos'
  },
  data () {
    return { tienda: TIENDA, limites: LIMITES_PEDIDO }
  },
  computed: {
    email () { return TIENDA.email && !TIENDA.email.startsWith('[') ? TIENDA.email : 'nuestro Instagram' },
    descuento () { return Math.round(TIENDA.pagos.transferencia.descuento * 100) }
  }
}
</script>

<style scoped>
.legal { padding-top: 28px; padding-bottom: 64px; max-width: 760px; }
.legal__pestanas { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.legal__pestanas a { padding: 8px 14px; border: 1px solid var(--borde); border-radius: 999px; color: var(--texto); font-size: 14px; }
.legal__pestanas a.router-link-active { background: var(--texto); border-color: var(--texto); color: var(--fondo); }
.legal__texto h1 { font-size: clamp(30px, 5vw, 44px); margin: 0; }
.legal__texto h2 { font-size: 20px; margin: 28px 0 8px; }
.legal__texto p, .legal__texto li { line-height: 1.65; }
.legal__texto ul { padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
</style>
