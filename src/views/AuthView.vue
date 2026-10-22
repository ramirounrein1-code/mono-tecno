<template>
  <div class="contenedor auth">
    <div class="tarjeta auth__caja">
      <!-- Pestañas Ingresar / Crear cuenta -->
      <div class="auth__tabs" role="tablist" aria-label="Ingresar o crear cuenta">
        <router-link :to="{ name: 'ingresar', query: $route.query }" role="tab" :aria-selected="modo === 'ingresar' ? 'true' : 'false'" :class="{ activa: modo === 'ingresar' }">Ingresar</router-link>
        <router-link :to="{ name: 'registro', query: $route.query }" role="tab" :aria-selected="modo === 'registro' ? 'true' : 'false'" :class="{ activa: modo === 'registro' }">Crear cuenta</router-link>
      </div>

      <transition name="auth" mode="out-in">
        <!-- INGRESAR -->
        <form v-if="modo === 'ingresar'" key="ingresar" class="auth__form" novalidate @submit.prevent="ingresar">
          <h1>Hola de nuevo</h1>
          <p class="texto-sec">Ingresá para ver tus pedidos y comprar más rápido.</p>
          <div class="campo">
            <label for="a-email">Email</label>
            <input id="a-email" v-model.trim="login.email" type="email" autocomplete="email" :aria-invalid="!!errores.email" aria-describedby="ae-email" @blur="validar('email')">
            <p v-if="errores.email" id="ae-email" class="campo__error">{{ errores.email }}</p>
          </div>
          <div class="campo">
            <label for="a-pass">Contraseña</label>
            <div class="campo__pass">
              <input id="a-pass" v-model="login.contrasena" :type="ver ? 'text' : 'password'" autocomplete="current-password" :aria-invalid="!!errores.contrasena" aria-describedby="ae-pass" @blur="validar('contrasena')">
              <button type="button" class="campo__ver" :aria-label="ver ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="ver = !ver">{{ ver ? 'Ocultar' : 'Ver' }}</button>
            </div>
            <p v-if="errores.contrasena" id="ae-pass" class="campo__error">{{ errores.contrasena }}</p>
          </div>
          <transition name="aviso"><p v-if="errorGeneral" class="auth__error" role="alert">{{ errorGeneral }}</p></transition>
          <button type="submit" class="btn btn--primario" :disabled="cargando" @mousedown.prevent>{{ cargando ? 'Ingresando…' : 'Ingresar' }}</button>
          <p class="auth__cambio">¿No tenés cuenta? <router-link :to="{ name: 'registro', query: $route.query }">Creala en un minuto</router-link></p>
        </form>

        <!-- REGISTRO -->
        <form v-else key="registro" class="auth__form" novalidate @submit.prevent="crearCuenta">
          <h1>Creá tu cuenta</h1>
          <p class="texto-sec">Guardamos tus datos para la próxima compra y podés seguir tus pedidos.</p>
          <div class="auth__fila">
            <div class="campo">
              <label for="r-nombre">Nombre *</label>
              <input id="r-nombre" v-model.trim="reg.nombre" type="text" autocomplete="given-name" :aria-invalid="!!errores.nombre" aria-describedby="re-nombre" @blur="validar('nombre')">
              <p v-if="errores.nombre" id="re-nombre" class="campo__error">{{ errores.nombre }}</p>
            </div>
            <div class="campo">
              <label for="r-apellido">Apellido *</label>
              <input id="r-apellido" v-model.trim="reg.apellido" type="text" autocomplete="family-name" :aria-invalid="!!errores.apellido" aria-describedby="re-apellido" @blur="validar('apellido')">
              <p v-if="errores.apellido" id="re-apellido" class="campo__error">{{ errores.apellido }}</p>
            </div>
          </div>
          <div class="campo">
            <label for="r-email">Email *</label>
            <input id="r-email" v-model.trim="reg.email" type="email" autocomplete="email" :aria-invalid="!!errores.regEmail" aria-describedby="re-email" @blur="validar('regEmail')">
            <p v-if="errores.regEmail" id="re-email" class="campo__error">{{ errores.regEmail }}</p>
          </div>
          <div class="campo">
            <label for="r-tel">Teléfono / WhatsApp *</label>
            <input id="r-tel" v-model.trim="reg.telefono" type="tel" inputmode="tel" autocomplete="tel" placeholder="11 2345-6789" :aria-invalid="!!errores.telefono" aria-describedby="re-tel" @blur="validar('telefono')">
            <p v-if="errores.telefono" id="re-tel" class="campo__error">{{ errores.telefono }}</p>
          </div>
          <div class="campo">
            <label for="r-pass">Contraseña * <span class="campo__ayuda">Mínimo 8 caracteres, con letras y números</span></label>
            <div class="campo__pass">
              <input id="r-pass" v-model="reg.contrasena" :type="ver ? 'text' : 'password'" autocomplete="new-password" :aria-invalid="!!errores.regContrasena" aria-describedby="re-pass re-fuerza" @blur="validar('regContrasena')">
              <button type="button" class="campo__ver" :aria-label="ver ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="ver = !ver">{{ ver ? 'Ocultar' : 'Ver' }}</button>
            </div>
            <div v-if="reg.contrasena" id="re-fuerza" class="fuerza" :data-nivel="fuerza.nivel">
              <span class="fuerza__barra"><span :style="{ width: fuerza.nivel * 25 + '%' }"></span></span>
              <span class="fuerza__texto">{{ fuerza.texto }}</span>
            </div>
            <p v-if="errores.regContrasena" id="re-pass" class="campo__error">{{ errores.regContrasena }}</p>
          </div>
          <div class="campo">
            <label for="r-pass2">Repetí la contraseña *</label>
            <input id="r-pass2" v-model="reg.confirmacion" :type="ver ? 'text' : 'password'" autocomplete="new-password" :aria-invalid="!!errores.confirmacion" aria-describedby="re-pass2" @blur="validar('confirmacion')">
            <p v-if="errores.confirmacion" id="re-pass2" class="campo__error">{{ errores.confirmacion }}</p>
          </div>
          <label class="check">
            <input v-model="reg.acepta" type="checkbox" :aria-invalid="!!errores.acepta" aria-describedby="re-acepta" @change="validar('acepta')">
            <span>Acepto que mono.tecno guarde mis datos para gestionar mis compras.</span>
          </label>
          <p v-if="errores.acepta" id="re-acepta" class="campo__error">{{ errores.acepta }}</p>
          <transition name="aviso"><p v-if="errorGeneral" class="auth__error" role="alert">{{ errorGeneral }}</p></transition>
          <button type="submit" class="btn btn--primario" :disabled="cargando" @mousedown.prevent>{{ cargando ? 'Creando cuenta…' : 'Crear cuenta' }}</button>
          <p class="auth__cambio">¿Ya tenés cuenta? <router-link :to="{ name: 'ingresar', query: $route.query }">Ingresá</router-link></p>
        </form>
      </transition>
    </div>
  </div>
</template>

<script>
import { registrar, iniciarSesion, emailRegistrado } from '../services/cuentas'

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default {
  name: 'AuthView',
  emits: ['notificar'],
  data () {
    return {
      login: { email: '', contrasena: '' },
      reg: { nombre: '', apellido: '', email: '', telefono: '', contrasena: '', confirmacion: '', acepta: false },
      errores: {},
      errorGeneral: '',
      cargando: false,
      ver: false
    }
  },
  computed: {
    modo () {
      return this.$route.name === 'registro' ? 'registro' : 'ingresar'
    },
    // Indicador de qué tan segura es la contraseña (0 a 4).
    fuerza () {
      const c = this.reg.contrasena
      let n = 0
      if (c.length >= 8) n++
      if (/[a-zA-Z]/.test(c) && /\d/.test(c)) n++
      if (/[A-Z]/.test(c) && /[a-z]/.test(c)) n++
      if (/[^a-zA-Z0-9]/.test(c) || c.length >= 12) n++
      return { nivel: n, texto: ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Muy buena'][n] }
    }
  },
  watch: {
    // Si un campo ya marcó error, se vuelve a validar mientras escribís (así el mensaje desaparece al corregirlo).
    'reg.contrasena' () {
      if (this.errores.regContrasena) this.validar('regContrasena')
      if (this.errores.confirmacion && this.reg.confirmacion) this.validar('confirmacion')
    },
    'reg.confirmacion' () {
      if (this.errores.confirmacion) this.validar('confirmacion')
    },
    modo () {
      this.errores = {}
      this.errorGeneral = ''
    }
  },
  methods: {
    reglas (campo) {
      const r = this.reg
      switch (campo) {
        case 'email':
          if (!this.login.email) return 'Escribí tu email.'
          if (!EMAIL_OK.test(this.login.email)) return 'El email no es válido.'
          return ''
        case 'contrasena':
          return this.login.contrasena ? '' : 'Escribí tu contraseña.'
        case 'nombre':
        case 'apellido':
          if (!r[campo]) return campo === 'nombre' ? 'Escribí tu nombre.' : 'Escribí tu apellido.'
          if (r[campo].length < 2) return 'Tiene que tener al menos 2 letras.'
          if (!/^[\p{L}\s'.-]+$/u.test(r[campo])) return 'Usá solo letras y espacios.'
          return ''
        case 'regEmail':
          if (!r.email) return 'Escribí tu email.'
          if (!EMAIL_OK.test(r.email)) return 'El email no es válido (ej: nombre@mail.com).'
          if (emailRegistrado(r.email)) return 'Ya hay una cuenta con ese email.'
          return ''
        case 'telefono': {
          const d = r.telefono.replace(/\D/g, '')
          if (!r.telefono) return 'Escribí un teléfono.'
          if (!/^[\d\s()+-]+$/.test(r.telefono) || d.length < 8 || d.length > 13) return 'Teléfono inválido. Escribí entre 8 y 13 números.'
          return ''
        }
        case 'regContrasena':
          if (!r.contrasena) return 'Elegí una contraseña.'
          if (r.contrasena.length < 8) return 'Tiene que tener al menos 8 caracteres.'
          if (!/[a-zA-Z]/.test(r.contrasena) || !/\d/.test(r.contrasena)) return 'Tiene que tener letras y números.'
          return ''
        case 'confirmacion':
          if (!r.confirmacion) return 'Repetí la contraseña.'
          return r.confirmacion === r.contrasena ? '' : 'Las contraseñas no coinciden.'
        case 'acepta':
          return r.acepta ? '' : 'Tenés que aceptar para crear la cuenta.'
        default:
          return ''
      }
    },
    validar (campo) {
      this.errores = { ...this.errores, [campo]: this.reglas(campo) }
    },
    validarVarios (campos) {
      campos.forEach((c) => this.validar(c))
      const ok = campos.every((c) => !this.errores[c])
      if (!ok) this.$nextTick(() => { const el = this.$el.querySelector('[aria-invalid="true"]'); if (el) el.focus() })
      return ok
    },
    volver () {
      const destino = this.$route.query.redirect
      this.$router.replace(typeof destino === 'string' && destino.startsWith('/') && !destino.startsWith('//') ? destino : { name: 'cuenta' })
    },
    async ingresar () {
      this.errorGeneral = ''
      if (!this.validarVarios(['email', 'contrasena'])) return
      this.cargando = true
      try {
        const u = await iniciarSesion(this.login.email, this.login.contrasena)
        this.$emit('notificar', { mensaje: `¡Hola, ${u.nombre}!` })
        this.volver()
      } catch (e) {
        this.errorGeneral = e.message
        this.login.contrasena = ''
      } finally {
        this.cargando = false
      }
    },
    async crearCuenta () {
      this.errorGeneral = ''
      if (!this.validarVarios(['nombre', 'apellido', 'regEmail', 'telefono', 'regContrasena', 'confirmacion', 'acepta'])) return
      this.cargando = true
      try {
        const u = await registrar(this.reg)
        this.$emit('notificar', { mensaje: `¡Bienvenido/a, ${u.nombre}! Tu cuenta está lista.` })
        this.volver()
      } catch (e) {
        this.errorGeneral = e.message
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
.auth { padding-top: 32px; padding-bottom: 48px; display: flex; justify-content: center; }
.auth__caja { width: 100%; max-width: 460px; padding: 8px 24px 28px; }
.auth__tabs { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--borde); margin: 0 -24px 22px; }
.auth__tabs a { display: flex; align-items: center; justify-content: center; min-height: 52px; color: var(--texto-2); font-weight: 500; border-bottom: 2px solid transparent; text-decoration: none !important; }
.auth__tabs a.activa { color: var(--texto); font-weight: 600; border-bottom-color: var(--magenta); }
.auth__form { display: flex; flex-direction: column; gap: 14px; }
.auth__form h1 { font-size: 28px; }
.auth__form > p { margin: 0; }
.auth__fila { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.campo { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.campo label { font-size: 14px; font-weight: 600; }
.campo__ayuda { display: block; font-weight: 400; font-size: 12px; color: var(--texto-2); margin-top: 2px; }
.campo input {
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
.campo input:focus { border-color: var(--navy); background: var(--papel); outline: none; box-shadow: 0 0 0 3px rgba(214, 51, 132, 0.25); }
[aria-invalid="true"] { border-color: var(--error) !important; background: #fff5f4 !important; }
.campo__pass { position: relative; }
.campo__pass input { padding-right: 76px; }
.campo__ver { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); min-height: 44px; min-width: 52px; padding: 0 12px; border: 0; background: transparent; font: inherit; font-size: 13px; color: var(--magenta-texto); cursor: pointer; }
.campo__error { margin: 0; font-size: 13px; color: var(--error); }
.campo__error::before { content: '⚠ '; }
.fuerza { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--texto-2); }
.fuerza__barra { flex: 1; height: 6px; border-radius: 999px; background: var(--borde); overflow: hidden; }
.fuerza__barra span { display: block; height: 100%; border-radius: 999px; background: var(--error); transition: width 0.25s ease, background 0.25s ease; }
.fuerza[data-nivel="2"] .fuerza__barra span { background: #c77700; }
.fuerza[data-nivel="3"] .fuerza__barra span,
.fuerza[data-nivel="4"] .fuerza__barra span { background: var(--exito); }
.check { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; cursor: pointer; }
.check input { width: 20px; height: 20px; flex: none; margin-top: 1px; accent-color: var(--magenta); }
.auth__error { margin: 0; padding: 12px 14px; border-radius: 12px; background: #fdecea; color: var(--error); font-size: 14px; font-weight: 500; }
.auth__cambio { text-align: center; font-size: 14px; }
.auth-enter-active,
.auth-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.auth-enter-from { opacity: 0; transform: translateX(10px); }
.auth-leave-to { opacity: 0; transform: translateX(-10px); }
.aviso-enter-active,
.aviso-leave-active { transition: opacity 0.2s ease; }
.aviso-enter-from,
.aviso-leave-to { opacity: 0; }
</style>
