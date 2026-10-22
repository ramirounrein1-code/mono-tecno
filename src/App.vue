<template>
  <div class="app">
    <NavBar />

    <main class="app__main">
      <!-- Transición Vue entre páginas -->
      <router-view v-slot="{ Component, route }">
        <transition name="pagina" mode="out-in">
          <component :is="Component" :key="route.path" @notificar="mostrarToast" />
        </transition>
      </router-view>
    </main>

    <AppFooter />
    <BottomNav />

    <ToastMessage
      :visible="toast.visible"
      :mensaje="toast.mensaje"
      :tipo="toast.tipo"
      :accion="toast.accion"
      @cerrar="toast.visible = false"
    />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
import ToastMessage from './components/ToastMessage.vue'
import BottomNav from './components/BottomNav.vue'

export default {
  name: 'App',
  components: { NavBar, AppFooter, ToastMessage, BottomNav },
  data () {
    return {
      toast: { visible: false, mensaje: '', tipo: 'exito', accion: null },
      timer: null
    }
  },
  methods: {
    // Las vistas emiten "notificar" y App muestra el aviso.
    mostrarToast ({ mensaje, tipo = 'exito', accion = null }) {
      this.toast = { visible: true, mensaje, tipo, accion }
      clearTimeout(this.timer)
      this.timer = setTimeout(() => { this.toast.visible = false }, 3200)
    }
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app__main {
  flex: 1;
  /* El contenido ocupa al menos toda la pantalla: el footer solo aparece al bajar. */
  min-height: calc(100vh - 60px);
  min-height: calc(100dvh - 60px);
}
/* En celular deja lugar para la barra inferior */
@media (max-width: 859px) {
  .app { padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)); }
}
.pagina-enter-active,
.pagina-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.pagina-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.pagina-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
