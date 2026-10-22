<template>
  <div class="contenedor no-encontrado">
    <img :src="logo" alt="" width="120" height="120">
    <h1>Esta página no existe</h1>
    <p class="texto-sec">El mono buscó por todos lados y no la encontró.</p>
    <router-link to="/" class="btn btn--primario">Volver al inicio</router-link>
  </div>
</template>

<script>
import logo from '../assets/logo-circulo.png'

export default {
  name: 'NotFoundView',
  data () {
    return { logo }
  }
}
</script>

<style scoped>
.no-encontrado {
  padding-top: 80px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
}
.no-encontrado h1 { font-size: clamp(30px, 6vw, 48px); }
.no-encontrado p { margin: 0 0 8px; }
</style>
