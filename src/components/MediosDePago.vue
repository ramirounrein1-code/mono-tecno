<template>
  <section :class="['medios', { 'medios--compacto': compacto }]" aria-labelledby="medios-titulo">
    <h2 :id="'medios-titulo'" class="medios__titulo">Medios de pago</h2>
    <ul class="medios__lista">
      <li>
        <span class="medios__icono" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></svg>
        </span>
        <div>
          <strong>Mercado Pago</strong>
          <span>Tarjetas de crédito, débito y dinero en cuenta.</span>
        </div>
      </li>
      <li>
        <span class="medios__icono" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" /></svg>
        </span>
        <div>
          <strong>Transferencia bancaria <em class="medios__off">{{ off(TIENDA.pagos.transferencia.descuento) }} OFF</em></strong>
          <span>Desde cualquier banco o billetera virtual.</span>
        </div>
      </li>
      <li>
        <span class="medios__icono" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></svg>
        </span>
        <div>
          <strong>Efectivo <em class="medios__off">{{ off(TIENDA.pagos.efectivo.descuento) }} OFF</em></strong>
          <span>Solo retirando en {{ TIENDA.zona.split(',')[0] }}.</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
import { TIENDA } from '../config/tienda'

// Bloque reutilizable con los medios de pago (detalle de producto y carrito).
export default {
  name: 'MediosDePago',
  props: {
    compacto: { type: Boolean, default: false }
  },
  data () {
    return { TIENDA }
  },
  methods: {
    off (v) { return Math.round(v * 100) + ' %' }
  }
}
</script>

<style scoped>
.medios { display: flex; flex-direction: column; gap: 10px; }
.medios__titulo { font-size: 15px; font-weight: 700; letter-spacing: 0; }
.medios__lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.medios__lista li { display: flex; gap: 12px; align-items: flex-start; }
.medios__lista div { display: flex; flex-direction: column; gap: 1px; font-size: 14px; }
.medios__lista span:not(.medios__icono) { color: var(--texto-2); font-size: 13px; }
.medios__icono {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--rosa);
  color: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
}
.medios__off {
  font-style: normal;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 6px;
  background: #e7f4ec;
  color: var(--exito);
  font-size: 12px;
}
.medios--compacto { padding-top: 14px; border-top: 1px solid var(--borde); }
.medios--compacto .medios__icono { width: 30px; height: 30px; }
</style>
