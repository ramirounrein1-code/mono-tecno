<template>
  <div class="stepper" role="group" :aria-label="etiqueta">
    <button type="button" :disabled="modelValue <= min" aria-label="Restar uno" @click="cambiar(-1)">−</button>
    <output aria-live="polite">{{ modelValue }}</output>
    <button type="button" :disabled="modelValue >= max" aria-label="Sumar uno" @click="cambiar(1)">+</button>
  </div>
</template>

<script>
// Selector de cantidad reutilizable. Se usa con v-model y respeta el stock (max).
export default {
  name: 'QuantityStepper',
  props: {
    modelValue: { type: Number, required: true },
    min: { type: Number, default: 1 },
    max: { type: Number, default: 99 },
    etiqueta: { type: String, default: 'Cantidad' }
  },
  emits: ['update:modelValue'],
  methods: {
    cambiar (delta) {
      const nuevo = Math.min(this.max, Math.max(this.min, this.modelValue + delta))
      this.$emit('update:modelValue', nuevo)
    }
  }
}
</script>

<style scoped>
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--borde);
  border-radius: 12px;
  background: var(--papel);
  overflow: hidden;
}
button {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  font-size: 20px;
  color: var(--texto);
  cursor: pointer;
}
button:hover:not(:disabled) { background: var(--fondo); }
button:disabled { color: #b9b3b5; cursor: not-allowed; }
output {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 859px) {
  button { width: 50px; height: 50px; }
  button:active:not(:disabled) { background: var(--fondo); }
}
</style>
