<template>
  <div class="google">
    <!-- Con el ID de cliente configurado, Google dibuja acá su botón oficial -->
    <div v-show="listo" ref="caja" class="google__oficial"></div>

    <!-- Sin configurar (o mientras carga): botón propio con el mismo aspecto -->
    <button v-if="!listo" type="button" class="google__boton" :disabled="cargando" @click="avisar">
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
      <span>{{ cargando ? 'Conectando con Google…' : 'Continuar con Google' }}</span>
    </button>
  </div>
</template>

<script>
// Botón "Continuar con Google". Emite "ingreso" con el perfil validado, o "error" con el motivo.
import { googleConfigurado, mostrarBotonGoogle } from '../services/google'

export default {
  name: 'GoogleButton',
  props: {
    // 'continue_with' | 'signup_with' | 'signin_with'
    texto: { type: String, default: 'continue_with' }
  },
  emits: ['ingreso', 'error'],
  data () {
    return { listo: false, cargando: false }
  },
  async mounted () {
    if (!googleConfigurado()) return
    this.cargando = true
    try {
      await mostrarBotonGoogle(this.$refs.caja, {
        texto: this.texto,
        alIngresar: (perfil) => this.$emit('ingreso', perfil),
        alError: (e) => this.$emit('error', e.message)
      })
      this.listo = true
    } catch (e) {
      this.$emit('error', e.message)
    } finally {
      this.cargando = false
    }
  },
  methods: {
    avisar () {
      this.$emit('error', 'El ingreso con Google todavía no está activado en esta página: falta cargar el ID de cliente de Google (ver README).')
    }
  }
}
</script>

<style scoped>
.google { width: 100%; }
.google__oficial { display: flex; justify-content: center; min-height: 44px; }
.google__boton {
  width: 100%;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
  border: 1px solid #dadce0;
  border-radius: 999px;
  background: #fff;
  color: #1f1f1f;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.google__boton:hover:not(:disabled) { background: #f8f9fa; }
.google__boton:disabled { opacity: 0.6; cursor: wait; }
</style>
