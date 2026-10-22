<template>
  <div ref="caja" class="particulas" role="img" :aria-label="descripcion">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
// Dibuja una imagen (el logo) como una grilla de puntitos en un <canvas>.
// Cada punto recuerda su posición original: el puntero lo empuja y un "resorte" lo devuelve.
export default {
  name: 'LogoParticles',
  props: {
    src: { type: String, required: true },
    descripcion: { type: String, default: 'Logo de mono.tecno hecho de puntitos' },
    color: { type: String, default: '#d63384' },
    separacion: { type: Number, default: 6 },   // distancia entre puntos (px)
    radioInfluencia: { type: Number, default: 90 } // alcance del puntero (px)
  },
  data () {
    return {
      // Datos no reactivos a propósito: se actualizan 60 veces por segundo.
      puntos: [],
      puntero: { x: -9999, y: -9999, activo: false },
      tamano: 0,
      alto: 0,
      anchoCanvas: 0,
      margen: 0,
      recorte: null,
      dpr: 1,
      frame: null,
      imagen: null,
      observador: null,
      sinMovimiento: false
    }
  },
  mounted () {
    this.sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.imagen = new Image()
    this.imagen.onload = () => {
      this.construir(true)
      // Si cambia el ancho de la caja (rotar el celular, achicar la ventana), se rearma la grilla.
      if (window.ResizeObserver) {
        this.observador = new ResizeObserver(() => this.construir(false))
        this.observador.observe(this.$refs.caja)
      }
    }
    this.imagen.src = this.src
    // El canvas no recibe clics (se superpone con el texto del inicio), así que escuchamos el puntero en la ventana.
    window.addEventListener('pointermove', this.moverPuntero, { passive: true })
    window.addEventListener('pointerdown', this.moverPuntero, { passive: true })
    window.addEventListener('pointercancel', this.soltarPuntero)
    document.addEventListener('pointerleave', this.soltarPuntero)
  },
  beforeUnmount () {
    window.removeEventListener('pointermove', this.moverPuntero)
    window.removeEventListener('pointerdown', this.moverPuntero)
    window.removeEventListener('pointercancel', this.soltarPuntero)
    document.removeEventListener('pointerleave', this.soltarPuntero)
    cancelAnimationFrame(this.frame)
    if (this.observador) this.observador.disconnect()
  },
  methods: {
    construir (conIntro) {
      const caja = this.$refs.caja
      const canvas = this.$refs.canvas
      if (!caja || !canvas) return
      const ancho = Math.round(caja.clientWidth)
      if (!ancho || ancho === this.tamano) return
      this.tamano = ancho

      // Recorte: buscamos el rectángulo que ocupa el mono (la parte oscura) para que llene el ancho.
      if (!this.recorte) this.recorte = this.buscarRecorte()
      const { bx, by, bw, bh } = this.recorte
      // El canvas es más grande que la caja (se sale "margen" px por cada lado, sin ocupar lugar):
      // así los puntos empujados tienen espacio de sobra y nunca se ven cortados.
      const margen = 160
      this.margen = margen
      const W = ancho + margen * 2
      const H = Math.round((ancho * bh) / bw) + margen * 2
      this.anchoCanvas = W
      this.alto = H
      this.dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = W * this.dpr
      canvas.height = H * this.dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      canvas.style.margin = -margen + 'px'

      // Dibujamos el recorte del logo en un canvas oculto y leemos el color de cada pixel.
      const aux = document.createElement('canvas')
      aux.width = W
      aux.height = H
      const ctxAux = aux.getContext('2d')
      ctxAux.drawImage(this.imagen, bx, by, bw, bh, margen, margen, W - margen * 2, H - margen * 2)
      const datos = ctxAux.getImageData(0, 0, W, H).data

      // En pantallas chicas los puntos van un poco más juntos para que se lea el logo.
      const paso = ancho < 360 ? Math.max(4, this.separacion - 2) : this.separacion
      const intro = conIntro && !this.sinMovimiento
      const puntos = []
      for (let y = paso / 2; y < H; y += paso) {
        for (let x = paso / 2; x < W; x += paso) {
          const i = (Math.floor(y) * W + Math.floor(x)) * 4
          // Solo la silueta del mono: el fondo rosa y lo transparente se descartan.
          if (!this.esSilueta(datos[i], datos[i + 1], datos[i + 2], datos[i + 3])) continue
          puntos.push({
            ox: x,
            oy: y,
            x: intro ? W / 2 + (Math.random() - 0.5) * ancho * 1.4 : x,
            y: intro ? H / 2 + (Math.random() - 0.5) * (H - margen * 2) * 2 : y,
            vx: 0,
            vy: 0
          })
        }
      }
      this.puntos = puntos
      this.radioPunto = paso * 0.4
      this.arrancar()
    },
    esSilueta (r, g, b, a) {
      return a > 128 && 0.299 * r + 0.587 * g + 0.114 * b < 90
    },
    buscarRecorte () {
      const iw = this.imagen.naturalWidth
      const ih = this.imagen.naturalHeight
      const c = document.createElement('canvas')
      c.width = iw
      c.height = ih
      const ctx = c.getContext('2d')
      ctx.drawImage(this.imagen, 0, 0)
      const d = ctx.getImageData(0, 0, iw, ih).data
      let x0 = iw; let y0 = ih; let x1 = 0; let y1 = 0
      for (let y = 0; y < ih; y++) {
        for (let x = 0; x < iw; x++) {
          const i = (y * iw + x) * 4
          if (this.esSilueta(d[i], d[i + 1], d[i + 2], d[i + 3])) {
            if (x < x0) x0 = x
            if (x > x1) x1 = x
            if (y < y0) y0 = y
            if (y > y1) y1 = y
          }
        }
      }
      if (x1 <= x0) return { bx: 0, by: 0, bw: iw, bh: ih } // por si la imagen no tiene zona oscura
      return { bx: x0, by: y0, bw: x1 - x0 + 1, bh: y1 - y0 + 1 }
    },
    arrancar () {
      if (this.sinMovimiento) {
        this.dibujar()
        return
      }
      if (!this.frame) this.frame = requestAnimationFrame(this.paso)
    },
    paso () {
      const R = this.radioInfluencia
      const { x: px, y: py, activo } = this.puntero
      let enMovimiento = false

      for (const p of this.puntos) {
        if (activo) {
          const dx = p.x - px
          const dy = p.y - py
          const d2 = dx * dx + dy * dy
          if (d2 < R * R && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const fuerza = (R - d) / R
            p.vx += (dx / d) * fuerza * 3.2
            p.vy += (dy / d) * fuerza * 3.2
          }
        }
        // Resorte hacia la posición original + rozamiento.
        p.vx = (p.vx + (p.ox - p.x) * 0.06) * 0.84
        p.vy = (p.vy + (p.oy - p.y) * 0.06) * 0.84
        p.x += p.vx
        p.y += p.vy
        if (Math.abs(p.vx) + Math.abs(p.vy) > 0.02 || Math.abs(p.ox - p.x) + Math.abs(p.oy - p.y) > 0.3) enMovimiento = true
      }

      this.dibujar()

      // Si todo está quieto y el puntero no está encima, frenamos la animación para no gastar batería.
      if (enMovimiento || activo) {
        this.frame = requestAnimationFrame(this.paso)
      } else {
        this.frame = null
      }
    },
    dibujar () {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      ctx.clearRect(0, 0, this.anchoCanvas, this.alto)
      const r = this.radioPunto
      // Un solo trazo para todos los puntos: mucho más rápido que pintar uno por uno.
      ctx.beginPath()
      for (const p of this.puntos) {
        ctx.moveTo(p.x + r, p.y)
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      }
      ctx.fillStyle = this.color
      ctx.fill()
    },
    moverPuntero (e) {
      if (this.sinMovimiento) return
      if (!this.$refs.canvas || !this.$refs.caja) return
      // Solo reacciona cuando el puntero anda cerca del logo.
      const caja = this.$refs.caja.getBoundingClientRect()
      const cerca = 40
      if (e.clientX < caja.left - cerca || e.clientX > caja.right + cerca || e.clientY < caja.top - cerca || e.clientY > caja.bottom + cerca) {
        if (this.puntero.activo) this.soltarPuntero()
        return
      }
      const rect = this.$refs.canvas.getBoundingClientRect()
      this.puntero = { x: e.clientX - rect.left, y: e.clientY - rect.top, activo: true }
      this.arrancar()
    },
    soltarPuntero () {
      this.puntero = { x: -9999, y: -9999, activo: false }
      this.arrancar()
    }
  }
}
</script>

<style scoped>
.particulas {
  width: 100%;
  max-width: 100%;
  position: relative;
}
canvas {
  display: block;
  position: relative;
  pointer-events: none; /* deja hacer clic en lo que quede debajo */
}
</style>
