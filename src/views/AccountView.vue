<template>
  <div class="contenedor cuenta">
    <header class="cuenta__cabecera">
      <span class="cuenta__avatar" aria-hidden="true">{{ iniciales }}</span>
      <div>
        <h1>Hola, {{ usuario.nombre }}</h1>
        <p class="texto-sec">{{ usuario.email }}</p>
      </div>
      <button type="button" class="btn btn--fantasma btn--chico cuenta__salir" @click="salir">Cerrar sesión</button>
    </header>

    <div class="cuenta__grid">
      <!-- Mis pedidos -->
      <section class="tarjeta bloque" aria-labelledby="t-pedidos">
        <h2 id="t-pedidos">Mis pedidos</h2>
        <p v-if="!pedidos.length" class="texto-sec">Todavía no hiciste compras. <router-link to="/productos">Ver el catálogo</router-link></p>
        <transition-group v-else tag="ul" name="lista" class="pedidos">
          <li v-for="p in pedidos" :key="p.numero">
            <router-link :to="{ name: 'pedido', params: { numero: p.numero } }" class="pedido">
              <div class="pedido__fila">
                <strong>Pedido #{{ p.numero }}</strong>
                <span :class="['estado', 'estado--' + clase(p.estado)]">{{ p.estado }}</span>
              </div>
              <span class="texto-sec pedido__meta">{{ fecha(p.fecha) }} · {{ unidades(p) }} {{ unidades(p) === 1 ? 'producto' : 'productos' }} · {{ pesos(p.total) }}</span>
              <span class="pedido__items">{{ p.items.map((i) => i.nombre).join(', ') }}</span>
            </router-link>
          </li>
        </transition-group>
      </section>

      <!-- Mis datos -->
      <section class="tarjeta bloque" aria-labelledby="t-datos">
        <h2 id="t-datos">Mis datos</h2>
        <form class="datos" novalidate @submit.prevent="guardar">
          <div class="campo">
            <label for="c-nombre">Nombre</label>
            <input id="c-nombre" v-model.trim="form.nombre" type="text" autocomplete="given-name" :aria-invalid="!!errores.nombre" @blur="validar('nombre')">
            <p v-if="errores.nombre" class="campo__error">{{ errores.nombre }}</p>
          </div>
          <div class="campo">
            <label for="c-apellido">Apellido</label>
            <input id="c-apellido" v-model.trim="form.apellido" type="text" autocomplete="family-name" :aria-invalid="!!errores.apellido" @blur="validar('apellido')">
            <p v-if="errores.apellido" class="campo__error">{{ errores.apellido }}</p>
          </div>
          <div class="campo">
            <label for="c-tel">Teléfono / WhatsApp</label>
            <input id="c-tel" v-model.trim="form.telefono" type="tel" autocomplete="tel" :aria-invalid="!!errores.telefono" @blur="validar('telefono')">
            <p v-if="errores.telefono" class="campo__error">{{ errores.telefono }}</p>
          </div>
          <div class="campo">
            <label for="c-dni">DNI <span class="campo__ayuda">Para envíos por correo</span></label>
            <input id="c-dni" v-model.trim="form.dni" type="text" inputmode="numeric" :aria-invalid="!!errores.dni" @blur="validar('dni')">
            <p v-if="errores.dni" class="campo__error">{{ errores.dni }}</p>
          </div>
          <button type="submit" class="btn btn--primario" @mousedown.prevent>Guardar cambios</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
import { sesion, cerrarSesion, actualizarPerfil, pedidosDelUsuario } from '../services/cuentas'
import { formatearPesos } from '../services/dolarService'

export default {
  name: 'AccountView',
  emits: ['notificar'],
  data () {
    const u = sesion.usuario || {}
    return {
      form: { nombre: u.nombre || '', apellido: u.apellido || '', telefono: u.telefono || '', dni: u.dni || '' },
      errores: {},
      pedidos: []
    }
  },
  computed: {
    usuario () {
      return sesion.usuario || { nombre: '', apellido: '', email: '' }
    },
    iniciales () {
      return ((this.usuario.nombre[0] || '') + (this.usuario.apellido[0] || '')).toUpperCase()
    }
  },
  created () {
    this.pedidos = pedidosDelUsuario()
  },
  methods: {
    pesos (v) { return formatearPesos(v) },
    unidades (p) { return p.items.reduce((t, i) => t + i.cantidad, 0) },
    fecha (iso) { return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) },
    clase (e) { return (e || '').toLowerCase().replace(/\s+/g, '-') },
    reglas (c) {
      const v = this.form[c]
      if (c === 'nombre' || c === 'apellido') {
        if (!v || v.length < 2) return 'Tiene que tener al menos 2 letras.'
        if (!/^[\p{L}\s'.-]+$/u.test(v)) return 'Usá solo letras y espacios.'
      }
      if (c === 'telefono') {
        const d = v.replace(/\D/g, '')
        if (!/^[\d\s()+-]+$/.test(v) || d.length < 8 || d.length > 13) return 'Teléfono inválido. Escribí entre 8 y 13 números.'
      }
      if (c === 'dni' && v && !/^\d{7,8}$/.test(v.replace(/\./g, ''))) return 'El DNI debe tener 7 u 8 números.'
      return ''
    },
    validar (c) {
      this.errores = { ...this.errores, [c]: this.reglas(c) }
    },
    guardar () {
      ['nombre', 'apellido', 'telefono', 'dni'].forEach((c) => this.validar(c))
      if (Object.values(this.errores).some(Boolean)) return
      actualizarPerfil({ ...this.form, dni: this.form.dni.replace(/\./g, '') })
      this.$emit('notificar', { mensaje: 'Guardaste tus datos.' })
    },
    salir () {
      cerrarSesion()
      this.$emit('notificar', { mensaje: 'Cerraste sesión.', tipo: 'info' })
      this.$router.push({ name: 'inicio' })
    }
  }
}
</script>

<style scoped>
.cuenta { padding-top: 28px; padding-bottom: 48px; display: flex; flex-direction: column; gap: 20px; }
.cuenta__cabecera { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.cuenta__cabecera h1 { font-size: clamp(26px, 5vw, 40px); }
.cuenta__cabecera p { margin: 4px 0 0; overflow-wrap: anywhere; }
.cuenta__avatar { flex: none; width: 60px; height: 60px; border-radius: 999px; background: var(--magenta); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 22px; }
.cuenta__salir { margin-left: auto; }
.cuenta__grid { display: grid; gap: 16px; align-items: start; }
.bloque { padding: 20px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.bloque h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
.bloque p { margin: 0; }
.pedidos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.pedido { display: flex; flex-direction: column; gap: 4px; padding: 14px; border: 1px solid var(--borde); border-radius: 12px; color: var(--texto); text-decoration: none !important; transition: border-color 0.15s ease; }
.pedido:hover { border-color: var(--magenta); }
.pedido__fila { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.pedido__meta { font-size: 13px; }
.pedido__items { font-size: 13px; color: var(--texto-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.estado { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: var(--rosa); white-space: nowrap; }
.estado--pendiente-de-pago { background: #fff6e5; color: #9a5b00; }
.estado--pagado,
.estado--entregado { background: #e7f4ec; color: var(--exito); }
.estado--cancelado { background: #fdecea; color: var(--error); }
.datos { display: flex; flex-direction: column; gap: 12px; }
.campo { display: flex; flex-direction: column; gap: 6px; }
.campo label { font-size: 14px; font-weight: 600; }
.campo__ayuda { font-weight: 400; font-size: 12px; color: var(--texto-2); }
.campo input { width: 100%; font: inherit; font-size: 16px; min-height: 46px; padding: 10px 14px; border: 1px solid var(--borde); border-radius: 12px; background: var(--fondo); color: var(--texto); }
.campo input:focus { border-color: var(--navy); background: var(--papel); outline: none; box-shadow: 0 0 0 3px rgba(214, 51, 132, 0.25); }
[aria-invalid="true"] { border-color: var(--error) !important; background: #fff5f4 !important; }
.campo__error { margin: 0; font-size: 13px; color: var(--error); }
.lista-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.lista-enter-from { opacity: 0; transform: translateY(8px); }

@media (min-width: 900px) {
  .cuenta { padding-top: 40px; }
  .cuenta__grid { grid-template-columns: 1.4fr 1fr; gap: 24px; }
}
</style>
