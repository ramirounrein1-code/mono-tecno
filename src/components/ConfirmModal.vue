<template>
  <transition name="modal">
    <div v-if="visible" class="modal" @click.self="$emit('cancelar')" @keydown.esc="$emit('cancelar')">
      <div class="modal__caja" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" aria-describedby="modal-texto">
        <div class="modal__icono" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" /></svg>
        </div>
        <h2 id="modal-titulo">{{ titulo }}</h2>
        <p id="modal-texto">{{ mensaje }}</p>
        <div class="modal__acciones">
          <button ref="cancelar" type="button" class="btn btn--fantasma" @click="$emit('cancelar')">Cancelar</button>
          <button type="button" class="btn btn--peligro" @click="$emit('confirmar')">{{ textoConfirmar }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    visible: { type: Boolean, default: false },
    titulo: { type: String, default: '¿Estás seguro?' },
    mensaje: { type: String, default: '' },
    textoConfirmar: { type: String, default: 'Eliminar' }
  },
  emits: ['confirmar', 'cancelar'],
  watch: {
    // Al abrir, el foco va al botón "Cancelar" (la opción segura).
    visible (abierto) {
      if (abierto) this.$nextTick(() => this.$refs.cancelar && this.$refs.cancelar.focus())
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgba(11, 11, 42, 0.55);
}
.modal__caja {
  width: 100%;
  max-width: 420px;
  padding: 24px;
  border-radius: var(--radio-lg);
  background: var(--papel);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal__icono {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #fdecea;
  color: var(--error);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal__caja h2 { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
.modal__caja p { margin: 0; color: var(--texto-2); }
.modal__acciones { display: flex; gap: 10px; margin-top: 12px; }
.modal__acciones .btn { flex: 1; }

.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal__caja,
.modal-leave-active .modal__caja { transition: transform 0.25s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal__caja,
.modal-leave-to .modal__caja { transform: translateY(40px); }

@media (min-width: 640px) {
  .modal { align-items: center; }
}
</style>
