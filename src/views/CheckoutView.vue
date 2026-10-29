<template>
  <div class="contenedor checkout">
    <router-link :to="{ name: 'carrito' }" class="checkout__volver">← Volver al carrito</router-link>
    <h1 class="titulo-seccion">Finalizar compra</h1>

    <div v-if="!items.length" class="tarjeta vacio">
      <h2>No hay productos en el carrito</h2>
      <router-link to="/productos" class="btn btn--primario">Ir al catálogo</router-link>
    </div>

    <div v-else class="checkout__grid">
      <form class="pasos" novalidate @submit.prevent="confirmar">
        <p v-if="!usuario" class="invitado">
          ¿Tenés cuenta? <router-link :to="{ name: 'ingresar', query: { redirect: '/checkout' } }">Ingresá</router-link> y completamos tus datos. También podés comprar como invitado.
        </p>
        <p v-else class="invitado invitado--ok">Comprando como <strong>{{ usuario.nombre }} {{ usuario.apellido }}</strong> ({{ usuario.email }}).</p>

        <!-- Indicador de pasos -->
        <ol class="progreso" aria-label="Pasos de la compra">
          <li v-for="(nombre, i) in nombresPasos" :key="nombre" :class="{ activo: paso === i + 1, hecho: paso > i + 1 }" :aria-current="paso === i + 1 ? 'step' : null">
            <span class="progreso__num">{{ paso > i + 1 ? '✓' : i + 1 }}</span>
            <span class="progreso__txt">{{ nombre }}</span>
          </li>
        </ol>

        <!-- PASO 1: DATOS -->
        <section class="paso tarjeta" aria-labelledby="t-paso1">
          <header class="paso__cabecera">
            <h2 id="t-paso1">1. Tus datos</h2>
            <button v-if="paso > 1" type="button" class="paso__editar" @click="paso = 1">Editar</button>
          </header>
          <transition name="paso" mode="out-in">
            <div v-if="paso === 1" key="f1" class="campos">
              <div class="campo">
                <label for="d-nombre">Nombre *</label>
                <input id="d-nombre" v-model.trim="datos.nombre" type="text" autocomplete="given-name" :aria-invalid="!!errores.nombre" aria-describedby="e-nombre" @blur="validar('nombre')">
                <p v-if="errores.nombre" id="e-nombre" class="campo__error">{{ errores.nombre }}</p>
              </div>
              <div class="campo">
                <label for="d-apellido">Apellido *</label>
                <input id="d-apellido" v-model.trim="datos.apellido" type="text" autocomplete="family-name" :aria-invalid="!!errores.apellido" aria-describedby="e-apellido" @blur="validar('apellido')">
                <p v-if="errores.apellido" id="e-apellido" class="campo__error">{{ errores.apellido }}</p>
              </div>
              <div class="campo">
                <label for="d-email">Email *</label>
                <input id="d-email" v-model.trim="datos.email" type="email" autocomplete="email" placeholder="nombre@mail.com" :aria-invalid="!!errores.email" aria-describedby="e-email" @blur="validar('email')">
                <p v-if="errores.email" id="e-email" class="campo__error">{{ errores.email }}</p>
              </div>
              <div class="campo">
                <label for="d-tel">Teléfono / WhatsApp *</label>
                <input id="d-tel" v-model.trim="datos.telefono" type="tel" inputmode="tel" autocomplete="tel" placeholder="11 2345-6789" :aria-invalid="!!errores.telefono" aria-describedby="e-tel" @blur="validar('telefono')">
                <p v-if="errores.telefono" id="e-tel" class="campo__error">{{ errores.telefono }}</p>
              </div>
              <div class="campo">
                <label for="d-dni">DNI * <span class="campo__ayuda">Lo pide el correo para el envío y la factura</span></label>
                <input id="d-dni" v-model.trim="datos.dni" type="text" inputmode="numeric" placeholder="35123456" :aria-invalid="!!errores.dni" aria-describedby="e-dni" @blur="validar('dni')">
                <p v-if="errores.dni" id="e-dni" class="campo__error">{{ errores.dni }}</p>
              </div>
              <div class="paso__acciones">
                <button type="button" class="btn btn--primario" @mousedown.prevent @click="siguiente(['nombre', 'apellido', 'email', 'telefono', 'dni'])">Continuar</button>
              </div>
            </div>
            <p v-else key="r1" class="paso__resumen">{{ datos.nombre }} {{ datos.apellido }} · {{ datos.email }} · {{ datos.telefono }}</p>
          </transition>
        </section>

        <!-- PASO 2: ENTREGA -->
        <section class="paso tarjeta" :class="{ 'paso--bloqueado': paso < 2 }" aria-labelledby="t-paso2">
          <header class="paso__cabecera">
            <h2 id="t-paso2">2. Entrega</h2>
            <button v-if="paso > 2" type="button" class="paso__editar" @click="paso = 2">Editar</button>
          </header>
          <transition name="paso" mode="out-in">
            <div v-if="paso === 2" key="f2" class="campos">
              <fieldset class="opciones campo--ancho">
                <legend class="sr-only">Forma de entrega</legend>
                <label v-for="e in envios" :key="e.id" :class="['opcion', { 'opcion--activa': entrega.tipo === e.id }]">
                  <input v-model="entrega.tipo" type="radio" name="entrega" :value="e.id">
                  <span class="opcion__texto">
                    <strong>{{ e.nombre }}</strong>
                    <span>{{ e.detalle }}</span>
                  </span>
                  <span class="opcion__precio">{{ e.costo ? pesos(e.costo) : 'Gratis' }}</span>
                </label>
              </fieldset>

              <transition name="desplegar">
                <div v-if="entrega.tipo !== 'retiro'" class="campos campos--sub campo--ancho">
                  <div class="campo campo--ancho">
                    <label for="d-calle">Calle *</label>
                    <input id="d-calle" v-model.trim="entrega.calle" type="text" autocomplete="address-line1" :aria-invalid="!!errores.calle" aria-describedby="e-calle" @blur="validar('calle')">
                    <p v-if="errores.calle" id="e-calle" class="campo__error">{{ errores.calle }}</p>
                  </div>
                  <div class="campo">
                    <label for="d-numero">Número *</label>
                    <input id="d-numero" v-model.trim="entrega.numero" type="text" inputmode="numeric" :aria-invalid="!!errores.numero" aria-describedby="e-numero" @blur="validar('numero')">
                    <p v-if="errores.numero" id="e-numero" class="campo__error">{{ errores.numero }}</p>
                  </div>
                  <div class="campo">
                    <label for="d-piso">Piso / depto <span class="campo__ayuda">Opcional</span></label>
                    <input id="d-piso" v-model.trim="entrega.piso" type="text" autocomplete="address-line2">
                  </div>
                  <div class="campo">
                    <label for="d-localidad">Localidad *</label>
                    <input id="d-localidad" v-model.trim="entrega.localidad" type="text" autocomplete="address-level2" :aria-invalid="!!errores.localidad" aria-describedby="e-localidad" @blur="validar('localidad')">
                    <p v-if="errores.localidad" id="e-localidad" class="campo__error">{{ errores.localidad }}</p>
                  </div>
                  <div class="campo">
                    <label for="d-provincia">Provincia *</label>
                    <select id="d-provincia" v-model="entrega.provincia" autocomplete="address-level1" :aria-invalid="!!errores.provincia" aria-describedby="e-provincia" @change="validar('provincia')">
                      <option value="" disabled>Elegí la provincia</option>
                      <option v-for="p in provincias" :key="p" :value="p">{{ p }}</option>
                    </select>
                    <p v-if="errores.provincia" id="e-provincia" class="campo__error">{{ errores.provincia }}</p>
                  </div>
                  <div class="campo">
                    <label for="d-cp">Código postal *</label>
                    <input id="d-cp" v-model.trim="entrega.cp" type="text" autocomplete="postal-code" placeholder="1714" :aria-invalid="!!errores.cp" aria-describedby="e-cp" @blur="validar('cp')" @input="entrega.cp = entrega.cp.toUpperCase()">
                    <p v-if="errores.cp" id="e-cp" class="campo__error">{{ errores.cp }}</p>
                  </div>
                  <div class="campo campo--ancho">
                    <label for="d-notas">Aclaraciones para la entrega <span class="campo__ayuda">Opcional · ej: timbre, entre calles</span></label>
                    <input id="d-notas" v-model.trim="entrega.notas" type="text" maxlength="120">
                  </div>
                </div>
              </transition>

              <div class="paso__acciones">
                <button type="button" class="btn btn--primario" @mousedown.prevent @click="siguiente(camposEntrega)">Continuar</button>
              </div>
            </div>
            <p v-else-if="paso > 2" key="r2" class="paso__resumen">{{ textoEntrega }}</p>
          </transition>
        </section>

        <!-- PASO 3: PAGO -->
        <section class="paso tarjeta" :class="{ 'paso--bloqueado': paso < 3 }" aria-labelledby="t-paso3">
          <header class="paso__cabecera">
            <h2 id="t-paso3">3. Pago</h2>
          </header>
          <transition name="paso">
            <div v-if="paso === 3" class="campos">
              <fieldset class="opciones campo--ancho">
                <legend class="sr-only">Medio de pago</legend>
                <label :class="['opcion', { 'opcion--activa': pago === 'mercadoPago' }]">
                  <input v-model="pago" type="radio" name="pago" value="mercadoPago">
                  <span class="opcion__texto">
                    <strong>Mercado Pago</strong>
                    <span>Tarjeta de crédito, débito o dinero en cuenta. Pagás en el sitio seguro de Mercado Pago.</span>
                  </span>
                  <span class="opcion__precio">{{ pesos(totalCon('mercadoPago')) }}</span>
                </label>
                <label :class="['opcion', { 'opcion--activa': pago === 'transferencia' }]">
                  <input v-model="pago" type="radio" name="pago" value="transferencia">
                  <span class="opcion__texto">
                    <strong>Transferencia bancaria <em class="off">{{ off('transferencia') }} OFF</em></strong>
                    <span>Te mostramos el alias y el CBU al confirmar.</span>
                  </span>
                  <span class="opcion__precio">{{ pesos(totalCon('transferencia')) }}</span>
                </label>
                <label :class="['opcion', { 'opcion--activa': pago === 'efectivo', 'opcion--off': entrega.tipo !== 'retiro' }]">
                  <input v-model="pago" type="radio" name="pago" value="efectivo" :disabled="entrega.tipo !== 'retiro'">
                  <span class="opcion__texto">
                    <strong>Efectivo <em class="off">{{ off('efectivo') }} OFF</em></strong>
                    <span>{{ entrega.tipo === 'retiro' ? 'Pagás cuando retirás.' : 'Disponible solo si retirás en persona.' }}</span>
                  </span>
                  <span class="opcion__precio">{{ pesos(totalCon('efectivo')) }}</span>
                </label>
              </fieldset>
              <p v-if="errores.pago" class="campo__error campo--ancho">{{ errores.pago }}</p>

              <label class="check campo--ancho">
                <input v-model="acepta" type="checkbox" :aria-invalid="!!errores.acepta" aria-describedby="e-acepta" @change="validar('acepta')">
                <span>Entiendo que el pedido se confirma cuando se acredita el pago y que las placas usadas tienen 3 meses de garantía.</span>
              </label>
              <p v-if="errores.acepta" id="e-acepta" class="campo__error campo--ancho">{{ errores.acepta }}</p>

              <div class="paso__acciones">
                <button type="submit" class="btn btn--primario btn--grande" @mousedown.prevent>Confirmar compra · {{ pesos(totales.total) }}</button>
              </div>
            </div>
          </transition>
        </section>
      </form>

      <!-- RESUMEN -->
      <aside class="resumen tarjeta" aria-label="Tu pedido">
        <h2>Tu pedido</h2>
        <ul class="resumen__items">
          <li v-for="i in items" :key="i.producto.id">
            <img :src="foto(i.producto)" alt="" width="56" height="42">
            <span class="resumen__nombre">{{ i.cantidad }} × {{ i.producto.nombre }}</span>
            <span class="resumen__precio">{{ pesos(i.producto.precio * i.cantidad) }}</span>
          </li>
        </ul>
        <dl class="resumen__lineas">
          <div><dt>Productos</dt><dd>{{ pesos(totales.subtotal) }}</dd></div>
          <div v-if="totales.descuento"><dt>Descuento {{ off(pago) }}</dt><dd class="verde">− {{ pesos(totales.descuento) }}</dd></div>
          <div><dt>Envío</dt><dd>{{ totales.envio ? pesos(totales.envio) : 'Gratis' }}</dd></div>
          <div class="resumen__total"><dt>Total</dt><dd>{{ pesos(totales.total) }}</dd></div>
        </dl>
        <p v-if="totalUsd" class="resumen__usd">≈ {{ totalUsd }} al dólar oficial</p>
      </aside>
    </div>
  </div>
</template>

<script>
import { detalleCarrito, vaciar } from '../services/carrito'
import { registrarPedido } from '../services/productosService'
import { recordarPedidoInvitado } from '../services/cuentas'
import { obtenerCotizaciones, formatearPesos, formatearDolares } from '../services/dolarService'
import { resolverImagen } from '../services/imagenes'
import { calcularTotales, descuentoPorPago } from '../services/precios'
import { TIENDA } from '../config/tienda'
import { sesion } from '../services/cuentas'

const PROVINCIAS = ['Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán']

// Intenta recuperar los datos de una compra anterior en este navegador (para no volver a escribirlos).
function datosGuardados () {
  try {
    return JSON.parse(localStorage.getItem('monotecno_cliente')) || {}
  } catch (e) {
    return {}
  }
}

export default {
  name: 'CheckoutView',
  emits: ['notificar'],
  data () {
    const guardado = datosGuardados()
    // Si hay sesión iniciada, los datos de la cuenta tienen prioridad.
    const u = sesion.usuario
    const deCuenta = u ? { nombre: u.nombre, apellido: u.apellido, email: u.email, telefono: u.telefono, ...(u.dni ? { dni: u.dni } : {}) } : {}
    return {
      usuario: u,
      paso: 1,
      nombresPasos: ['Datos', 'Entrega', 'Pago'],
      envios: TIENDA.envios,
      provincias: PROVINCIAS,
      datos: { nombre: '', apellido: '', email: '', telefono: '', dni: '', ...(guardado.datos || {}), ...deCuenta },
      entrega: { tipo: 'retiro', calle: '', numero: '', piso: '', localidad: '', provincia: '', cp: '', notas: '', ...(guardado.entrega || {}) },
      pago: 'mercadoPago',
      acepta: false,
      errores: {},
      dolar: null
    }
  },
  computed: {
    items () {
      return detalleCarrito()
    },
    subtotal () {
      return this.items.reduce((t, i) => t + i.producto.precio * i.cantidad, 0)
    },
    totales () {
      return calcularTotales(this.subtotal, this.entrega.tipo, this.pago)
    },
    totalUsd () {
      return this.dolar ? formatearDolares(Math.round(this.totales.total / this.dolar)) : ''
    },
    camposEntrega () {
      return this.entrega.tipo === 'retiro' ? [] : ['calle', 'numero', 'localidad', 'provincia', 'cp']
    },
    textoEntrega () {
      const e = this.envios.find((x) => x.id === this.entrega.tipo)
      if (this.entrega.tipo === 'retiro') return e.nombre
      return `${e.nombre} · ${this.entrega.calle} ${this.entrega.numero}${this.entrega.piso ? ', ' + this.entrega.piso : ''}, ${this.entrega.localidad}, ${this.entrega.provincia} (${this.entrega.cp})`
    }
  },
  watch: {
    // El efectivo solo se puede usar retirando en persona.
    'entrega.tipo' (tipo) {
      if (tipo !== 'retiro' && this.pago === 'efectivo') this.pago = 'mercadoPago'
    },
    // Al cambiar de paso, la página se desplaza hasta el paso actual.
    paso () {
      setTimeout(() => {
        const actual = this.$el.querySelectorAll('.paso')[this.paso - 1]
        if (actual) actual.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 250)
    }
  },
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
    pesos (v) { return formatearPesos(v) },
    foto (p) { return resolverImagen(p.imagen) },
    off (metodo) { return Math.round(descuentoPorPago(metodo) * 100) + ' %' },
    totalCon (metodo) { return calcularTotales(this.subtotal, this.entrega.tipo, metodo).total },

    // Validaciones personalizadas de cada campo.
    reglas (campo) {
      const d = this.datos
      const e = this.entrega
      switch (campo) {
        case 'nombre':
        case 'apellido': {
          const v = d[campo]
          const etiqueta = campo === 'nombre' ? 'el nombre' : 'el apellido'
          if (!v) return `Escribí ${etiqueta}.`
          if (v.length < 2) return `${campo === 'nombre' ? 'El nombre' : 'El apellido'} debe tener al menos 2 letras.`
          if (!/^[\p{L}\s'.-]+$/u.test(v)) return 'Usá solo letras y espacios.'
          return ''
        }
        case 'email':
          if (!d.email) return 'Escribí tu email.'
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return 'El email no es válido (ej: nombre@mail.com).'
          return ''
        case 'telefono': {
          const digitos = d.telefono.replace(/\D/g, '')
          if (!d.telefono) return 'Necesitamos un teléfono para coordinar.'
          if (!/^[\d\s()+-]+$/.test(d.telefono) || digitos.length < 8 || digitos.length > 13) return 'Teléfono inválido. Escribí entre 8 y 13 números (ej: 11 2345-6789).'
          return ''
        }
        case 'dni': {
          const v = d.dni.replace(/\./g, '')
          if (!v) return 'Escribí tu DNI.'
          if (!/^\d{7,8}$/.test(v)) return 'El DNI debe tener 7 u 8 números, sin puntos.'
          return ''
        }
        case 'calle':
          if (!e.calle) return 'Escribí la calle.'
          if (e.calle.length < 3) return 'La calle debe tener al menos 3 caracteres.'
          return ''
        case 'numero':
          if (!e.numero) return 'Escribí la altura.'
          if (!/^\d{1,5}$/.test(e.numero) && !/^s\/?n$/i.test(e.numero)) return 'Escribí solo números (o S/N si no tiene).'
          return ''
        case 'localidad':
          if (!e.localidad) return 'Escribí la localidad.'
          if (e.localidad.length < 3) return 'La localidad debe tener al menos 3 caracteres.'
          return ''
        case 'provincia':
          return e.provincia ? '' : 'Elegí la provincia.'
        case 'cp':
          if (!e.cp) return 'Escribí el código postal.'
          if (!/^(\d{4}|[A-Z]\d{4}[A-Z]{3})$/.test(e.cp)) return 'Código postal inválido. Usá 4 números (1714) o el formato nuevo (B1714ABC).'
          return ''
        case 'pago':
          if (!this.pago) return 'Elegí un medio de pago.'
          if (this.pago === 'efectivo' && e.tipo !== 'retiro') return 'El efectivo es solo para retiro en persona.'
          return ''
        case 'acepta':
          return this.acepta ? '' : 'Tenés que aceptar las condiciones para confirmar.'
        default:
          return ''
      }
    },
    validar (campo) {
      this.errores = { ...this.errores, [campo]: this.reglas(campo) }
    },
    validarVarios (campos) {
      campos.forEach((c) => this.validar(c))
      const conError = campos.filter((c) => this.errores[c])
      if (conError.length) {
        this.$nextTick(() => {
          const el = this.$el.querySelector('[aria-invalid="true"]')
          if (el) el.focus()
        })
      }
      return !conError.length
    },
    siguiente (campos) {
      if (this.validarVarios(campos)) this.paso++
    },
    confirmar () {
      if (this.paso !== 3) return
      if (!this.validarVarios(['pago', 'acepta'])) return
      // Guardamos los datos del cliente para la próxima compra en este navegador.
      try {
        localStorage.setItem('monotecno_cliente', JSON.stringify({ datos: this.datos, entrega: this.entrega }))
      } catch (e) { /* no es grave */ }

      const pedido = registrarPedido({
        items: this.items.map((i) => ({ id: i.producto.id, nombre: i.producto.nombre, precio: i.producto.precio, cantidad: i.cantidad })),
        ...this.totales,
        cliente: { ...this.datos },
        entrega: { ...this.entrega, descripcion: this.textoEntrega },
        pago: this.pago,
        usuario: this.usuario ? this.usuario.email : null
      })
      if (!this.usuario) recordarPedidoInvitado(pedido.numero)
      vaciar()
      this.$router.push({ name: 'pedido', params: { numero: pedido.numero }, query: { nuevo: '1' } })
    }
  }
}
</script>

<style scoped>
.checkout { padding-top: 20px; padding-bottom: 48px; display: flex; flex-direction: column; gap: 16px; }
.checkout__volver { display: inline-flex; align-items: center; min-height: 44px; align-self: flex-start; }
.checkout__grid { display: grid; gap: 20px; align-items: start; }
.pasos { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.invitado { margin: 0; padding: 12px 14px; border-radius: 12px; background: var(--rosa); font-size: 14px; }
.invitado--ok { background: #e7f4ec; }

.progreso { list-style: none; margin: 0 0 4px; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.progreso li { display: flex; align-items: center; gap: 8px; padding-bottom: 8px; border-bottom: 3px solid var(--borde); color: var(--texto-2); font-size: 14px; transition: border-color 0.3s ease, color 0.3s ease; }
.progreso li.activo { border-color: var(--magenta); color: var(--texto); font-weight: 600; }
.progreso li.hecho { border-color: var(--navy); color: var(--texto); }
.progreso__num { width: 24px; height: 24px; flex: none; border-radius: 999px; background: var(--borde); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.activo .progreso__num { background: var(--magenta); color: #fff; }
.hecho .progreso__num { background: var(--navy); color: #fff; }

.paso { padding: 18px; scroll-margin-top: 140px; }
.paso--bloqueado { opacity: 0.55; }
.paso__cabecera { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.paso__cabecera h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
.paso__editar { border: 0; background: none; font: inherit; font-size: 14px; color: var(--magenta-texto); text-decoration: underline; cursor: pointer; min-height: 44px; }
.paso__resumen { margin: 6px 0 0; font-size: 14px; color: var(--texto-2); overflow-wrap: anywhere; }
.campos { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; margin-top: 14px; }
.campos--sub { margin-top: 0; }
.campo { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.campo label { font-size: 14px; font-weight: 600; }
.campo__ayuda { display: block; font-weight: 400; font-size: 12px; color: var(--texto-2); margin-top: 2px; }
.campo input,
.campo select {
  width: 100%;
  font: inherit;
  font-size: 16px;
  min-height: 48px;
  padding: 10px 14px;
  border: 1px solid var(--borde);
  border-radius: 12px;
  background: var(--fondo);
  color: var(--texto);
}
.campo input:focus,
.campo select:focus { border-color: var(--navy); background: var(--papel); outline: none; box-shadow: 0 0 0 3px rgba(214, 51, 132, 0.25); }
[aria-invalid="true"] { border-color: var(--error) !important; background: #fff5f4 !important; }
.campo__error { margin: 0; font-size: 13px; color: var(--error); }
.campo__error::before { content: '⚠ '; }

.opciones { border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.opcion {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border: 1px solid var(--borde);
  border-radius: 12px;
  background: var(--papel);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.opcion input { width: 18px; height: 18px; margin-top: 2px; accent-color: var(--magenta); }
.opcion--activa { border-color: var(--navy); background: #faf6f8; box-shadow: inset 0 0 0 1px var(--navy); }
.opcion--off { opacity: 0.55; cursor: not-allowed; }
.opcion__texto { display: flex; flex-direction: column; gap: 2px; font-size: 15px; }
.opcion__texto span { font-size: 13px; color: var(--texto-2); }
.opcion__precio { font-weight: 650; font-variant-numeric: tabular-nums; white-space: nowrap; }
.off { font-style: normal; margin-left: 6px; padding: 1px 6px; border-radius: 6px; background: #e7f4ec; color: var(--exito); font-size: 12px; }
.check { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; cursor: pointer; }
.check input { width: 20px; height: 20px; flex: none; margin-top: 1px; accent-color: var(--magenta); }
.paso__acciones { display: flex; justify-content: flex-end; }
.paso__acciones .btn { width: 100%; }
.btn--grande { min-height: 54px; font-size: 16px; }

.resumen { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.resumen h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
.resumen__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.resumen__items li { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; gap: 10px; align-items: center; font-size: 14px; }
.resumen__items img { width: 56px; height: 42px; object-fit: cover; border-radius: 8px; border: 1px solid var(--borde); background: #fff; }
.resumen__precio { font-variant-numeric: tabular-nums; white-space: nowrap; }
.resumen__lineas { margin: 0; display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid var(--borde); }
.resumen__lineas div { display: flex; justify-content: space-between; gap: 12px; font-size: 15px; }
.resumen__lineas dd { margin: 0; font-variant-numeric: tabular-nums; }
.verde { color: var(--exito); }
.resumen__total { padding-top: 10px; border-top: 1px solid var(--borde); font-size: 20px !important; font-weight: 650; }
.resumen__usd { margin: -4px 0 0; font-size: 13px; color: var(--texto-2); text-align: right; }
.vacio { padding: 36px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }

.paso-enter-active,
.paso-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.paso-enter-from { opacity: 0; transform: translateY(8px); }
.paso-leave-to { opacity: 0; }
.desplegar-enter-active,
.desplegar-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.desplegar-enter-from,
.desplegar-leave-to { opacity: 0; transform: translateY(-6px); }

@media (min-width: 640px) {
  .campos { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .campo--ancho,
  .paso__acciones,
  .campos--sub { grid-column: 1 / -1; }
  .paso__acciones .btn { width: auto; min-width: 220px; }
  .paso { padding: 24px; }
}
@media (min-width: 960px) {
  .checkout { padding-top: 32px; }
  .checkout__grid { grid-template-columns: minmax(0, 1fr) 380px; gap: 28px; }
  .resumen { position: sticky; top: 96px; }
}
</style>
