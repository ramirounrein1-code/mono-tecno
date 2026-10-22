<template>
  <div class="contenedor login">
    <form class="tarjeta login__caja" novalidate @submit.prevent="entrar">
      <img :src="logo" alt="" width="56" height="56" class="login__logo">
      <h1>Panel de administración</h1>
      <p class="texto-sec">Acceso solo para el equipo de mono.tecno.</p>

      <div class="campo">
        <label for="l-pass">Contraseña</label>
        <div class="campo__pass">
          <input id="l-pass" ref="pass" v-model="contrasena" :type="ver ? 'text' : 'password'" autocomplete="current-password" :aria-invalid="!!error" aria-describedby="l-error" :disabled="cargando">
          <button type="button" class="campo__ver" :aria-label="ver ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="ver = !ver">{{ ver ? 'Ocultar' : 'Ver' }}</button>
        </div>
        <transition name="aviso">
          <p v-if="error" id="l-error" class="campo__error" role="alert">{{ error }}</p>
        </transition>
      </div>

      <button type="submit" class="btn btn--primario" :disabled="cargando || bloqueadoHasta > ahora">
        {{ cargando ? 'Verificando…' : bloqueadoHasta > ahora ? `Esperá ${Math.ceil((bloqueadoHasta - ahora) / 1000)} s` : 'Entrar' }}
      </button>
      <router-link to="/" class="login__volver">Volver a la tienda</router-link>
    </form>
  </div>
</template>

<script>
import logo from '../assets/logo-circulo.png'
import { iniciarSesion } from '../services/auth'

export default {
  name: 'LoginView',
  emits: ['notificar'],
  data () {
    return { logo, contrasena: '', ver: false, error: '', cargando: false, intentos: 0, bloqueadoHasta: 0, ahora: Date.now(), reloj: null }
  },
  mounted () {
    this.$refs.pass.focus()
  },
  beforeUnmount () {
    clearInterval(this.reloj)
  },
  methods: {
    async entrar () {
      this.error = ''
      if (!this.contrasena) {
        this.error = 'Escribí la contraseña.'
        return
      }
      if (this.contrasena.length < 4) {
        this.error = 'La contraseña tiene al menos 4 caracteres.'
        return
      }
      this.cargando = true
      const ok = await iniciarSesion(this.contrasena)
      this.cargando = false
      if (ok) {
        this.$emit('notificar', { mensaje: 'Entraste al panel de administración.' })
        const destino = this.$route.query.redirect
        this.$router.replace(typeof destino === 'string' && destino.startsWith('/admin') ? destino : { name: 'admin' })
        return
      }
      this.intentos++
      this.contrasena = ''
      this.error = 'Contraseña incorrecta.'
      // Después de 3 intentos fallidos, espera 30 segundos.
      if (this.intentos % 3 === 0) {
        this.bloqueadoHasta = Date.now() + 30000
        clearInterval(this.reloj)
        this.reloj = setInterval(() => {
          this.ahora = Date.now()
          if (this.ahora >= this.bloqueadoHasta) clearInterval(this.reloj)
        }, 500)
        this.error = 'Demasiados intentos. Esperá 30 segundos.'
      }
      this.$nextTick(() => this.$refs.pass.focus())
    }
  }
}
</script>

<style scoped>
.login { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding-top: 40px; padding-bottom: 40px; }
.login__caja { width: 100%; max-width: 400px; padding: 28px; display: flex; flex-direction: column; gap: 14px; }
.login__logo { border-radius: 999px; }
.login__caja h1 { font-size: 28px; }
.login__caja p { margin: 0; }
.campo { display: flex; flex-direction: column; gap: 6px; }
.campo label { font-size: 14px; font-weight: 600; }
.campo__pass { position: relative; }
.campo__pass input {
  width: 100%;
  font: inherit;
  font-size: 16px;
  min-height: 48px;
  padding: 10px 76px 10px 14px;
  border: 1px solid var(--borde);
  border-radius: 12px;
  background: var(--fondo);
  color: var(--texto);
}
.campo__pass input:focus { border-color: var(--navy); background: var(--papel); outline: none; box-shadow: 0 0 0 3px rgba(214, 51, 132, 0.25); }
[aria-invalid="true"] { border-color: var(--error) !important; background: #fff5f4 !important; }
.campo__ver { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); min-height: 44px; min-width: 52px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; font: inherit; font-size: 13px; color: var(--magenta-texto); cursor: pointer; }
.campo__error { margin: 0; font-size: 13px; color: var(--error); }
.campo__error::before { content: '⚠ '; }
.login__volver { align-self: center; min-height: 44px; display: inline-flex; align-items: center; font-size: 14px; }
.aviso-enter-active,
.aviso-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.aviso-enter-from,
.aviso-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
