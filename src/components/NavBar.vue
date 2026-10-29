<template>
  <header class="nav">
    <div class="contenedor nav__barra">
      <router-link to="/" class="nav__marca">
        <img :src="logo" alt="" width="36" height="36">
        <span>mono.tecno</span>
      </router-link>

      <!-- Buscador global: lleva al catálogo con ?q= -->
      <form class="nav__buscar" role="search" @submit.prevent="buscar">
        <label for="buscar-global" class="sr-only">Buscar productos</label>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input id="buscar-global" v-model="texto" type="search" placeholder="Buscar placas, procesadores, memorias…" autocomplete="off">
        <button type="submit" class="nav__buscar-btn" aria-label="Buscar"><span class="nav__buscar-txt">Buscar</span></button>
      </form>

      <nav class="nav__links" aria-label="Principal">
        <router-link to="/productos" class="nav__link">Catálogo</router-link>
        <router-link to="/arma-tu-pc" class="nav__link">Armá tu PC</router-link>
        <router-link to="/acerca" class="nav__link">Nosotros</router-link>
        <router-link v-if="usuario" to="/cuenta" class="nav__link nav__cuenta"><span class="nav__avatar" aria-hidden="true">{{ usuario.nombre[0] }}</span>{{ usuario.nombre }}</router-link>
        <router-link v-else :to="{ name: 'ingresar' }" class="nav__link">Ingresar</router-link>
      </nav>

      <button type="button" class="nav__tema" :aria-label="oscuro ? 'Pasar a modo claro' : 'Pasar a modo oscuro'" :aria-pressed="oscuro ? 'true' : 'false'" @click="alternarTema">
        <svg v-if="oscuro" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
      </button>

      <router-link to="/carrito" class="nav__carrito" :aria-label="`Carrito, ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}`">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20.5" r="1.2" /><circle cx="17" cy="20.5" r="1.2" /></svg>
        <transition name="pop" mode="out-in">
          <span v-if="cantidad" :key="cantidad" class="nav__badge">{{ cantidad }}</span>
        </transition>
      </router-link>
    </div>
  </header>
</template>

<script>
import logo from '../assets/logo-circulo.png'
import { carrito } from '../services/carrito'
import { sesion } from '../services/cuentas'
import { tema, temaActual, alternarTema } from '../services/tema'

export default {
  name: 'NavBar',
  data () {
    return { logo, texto: '' }
  },
  computed: {
    oscuro () {
      return tema && temaActual() === 'dark'
    },
    usuario () {
      return sesion.usuario
    },
    // El contador se actualiza solo porque "carrito" es reactivo.
    cantidad () {
      return carrito.items.reduce((t, i) => t + i.cantidad, 0)
    }
  },
  watch: {
    // Si la URL trae ?q=, el buscador la muestra.
    '$route.query.q': {
      immediate: true,
      handler (q) { this.texto = q || '' }
    }
  },
  methods: {
    alternarTema () { alternarTema() },
    buscar () {
      const q = this.texto.trim()
      this.$router.push({ name: 'listado', query: q ? { q } : {} })
    }
  }
}
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--fondo) 90%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--borde);
}
.nav__barra {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas: "marca buscar tema";
  align-items: center;
  gap: 10px 16px;
  padding-top: 10px;
  padding-bottom: 10px;
}
.nav__marca {
  grid-area: marca;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--texto);
  font-weight: 600;
  font-size: 17px;
  text-decoration: none !important;
}
.nav__marca img { border-radius: 999px; }
.nav__marca { min-height: 48px; min-width: 48px; }
.nav__marca span { display: none; }
@media (min-width: 420px) {
  .nav__marca span { display: inline; }
}
.nav__buscar {
  grid-area: buscar;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 4px 0 14px;
  border: 1px solid var(--borde);
  border-radius: 14px;
  background: var(--papel);
  color: var(--texto-2);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.nav__buscar:focus-within { border-color: var(--navy); box-shadow: 0 0 0 3px rgba(214, 51, 132, 0.2); }
.nav__buscar input {
  flex: 1;
  align-self: stretch; /* se puede tocar en toda la altura de la caja */
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 16px;
  color: var(--texto);
}
.nav__buscar-btn {
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: var(--navy);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.nav__links { display: none; }
@media (max-width: 519px) {
  .nav__buscar-btn { display: none; }
  .nav__buscar { padding-right: 14px; }
}
.nav__link {
  color: var(--texto);
  font-size: 15px;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  text-decoration: none !important;
}
.nav__link.router-link-active { border-bottom-color: var(--magenta); }
.nav__cuenta { display: inline-flex; align-items: center; gap: 8px; }
.nav__avatar { width: 28px; height: 28px; border-radius: 999px; background: var(--magenta); color: #fff; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; text-transform: uppercase; }
.nav__tema {
  grid-area: tema;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--borde);
  border-radius: 14px;
  background: var(--papel);
  color: var(--texto);
  cursor: pointer;
}
.nav__tema:hover { border-color: var(--texto-2); }
.nav__carrito {
  display: none !important;
  grid-area: carrito;
  position: relative;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--borde);
  border-radius: 14px;
  background: var(--papel);
  color: var(--texto);
}
.nav__carrito.router-link-active { border-color: var(--navy); }
.nav__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--magenta);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}
.pop-enter-active { transition: transform 0.25s cubic-bezier(0.3, 1.6, 0.6, 1); }
.pop-enter-from { transform: scale(0.4); }

@media (min-width: 860px) {
  .nav__barra {
    grid-template-columns: auto minmax(0, 1fr) auto auto auto;
    grid-template-areas: "marca buscar links tema carrito";
    gap: 24px;
    min-height: 72px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .nav__buscar { max-width: 560px; width: 100%; justify-self: center; }
  .nav__links { grid-area: links; display: flex; gap: 24px; }
  .nav__carrito { display: inline-flex !important; }
  .nav__marca span { display: inline; }
}
</style>
