<template>
  <div class="toast-zona" aria-live="polite">
    <transition name="toast">
      <div v-if="visible" :class="['toast', 'toast--' + tipo]" role="status">
        <span class="toast__texto">{{ mensaje }}</span>
        <router-link v-if="accion" :to="accion.to" class="toast__accion" @click="$emit('cerrar')">{{ accion.texto }}</router-link>
        <button type="button" class="toast__cerrar" aria-label="Cerrar aviso" @click="$emit('cerrar')">×</button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ToastMessage',
  props: {
    visible: { type: Boolean, default: false },
    mensaje: { type: String, default: '' },
    tipo: { type: String, default: 'exito', validator: (v) => ['exito', 'error', 'info'].includes(v) },
    // Botón opcional dentro del aviso, ej: { texto: 'Ver carrito', to: '/carrito' }
    accion: { type: Object, default: null }
  },
  emits: ['cerrar']
}
</script>

<style scoped>
.toast-zona {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 120;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  width: 100%;
  padding: 10px 10px 10px 18px;
  border-radius: 14px;
  background: var(--navy);
  color: #fff;
  font-size: 15px;
  box-shadow: 0 10px 30px rgba(11, 11, 42, 0.25);
}
.toast--exito { border-left: 4px solid var(--magenta); }
.toast--error { background: var(--error); }
.toast__texto { flex: 1; min-width: 0; }
.toast__accion {
  flex: none;
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  background: var(--magenta);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none !important;
}
.toast__cerrar {
  flex: none;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}
@media (max-width: 859px) {
  .toast-zona { bottom: calc(76px + env(safe-area-inset-bottom, 0px)); }
}
.toast-enter-active,
.toast-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>
