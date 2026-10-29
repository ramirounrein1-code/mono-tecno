<template>
  <figure v-show="soportado" class="gpu3d">
    <div
      ref="lienzo"
      class="gpu3d__lienzo"
      role="img"
      aria-label="Placa de video en 3D. Arrastrala con el mouse para girarla."
      @pointerdown="empezar"
    ></div>
    <figcaption class="gpu3d__ayuda">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" /><path d="M18 3v4h-4M6 21v-4h4" /></svg>
      Arrastrala para girarla
    </figcaption>
  </figure>
</template>

<script>
// Placa de video en 3D hecha con three.js (formas simples, sin marcas).
// Solo se usa en computadora. Se gira arrastrando con el mouse; si nadie la toca, gira sola despacio.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export default {
  name: 'GpuModel3D',
  data () {
    return { soportado: true }
  },
  mounted () {
    try {
      this.iniciar()
    } catch (e) {
      this.soportado = false // sin WebGL no se muestra
    }
  },
  beforeUnmount () {
    cancelAnimationFrame(this.cuadro)
    window.removeEventListener('pointermove', this.mover)
    window.removeEventListener('pointerup', this.soltar)
    if (this.observadorTam) this.observadorTam.disconnect()
    if (this.observadorVista) this.observadorVista.disconnect()
    if (this.escena) {
      this.escena.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) o.material.dispose()
      })
    }
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer.domElement.remove()
    }
  },
  methods: {
    iniciar () {
      const el = this.$refs.lienzo
      this.quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      el.appendChild(renderer.domElement)
      this.renderer = renderer

      const escena = new THREE.Scene()
      this.escena = escena
      const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
      camara.position.set(0, 0.15, 5.0)
      this.camara = camara

      // Luces: ambiente suave, una principal y un contraluz magenta de la marca.
      escena.add(new THREE.HemisphereLight(0xffffff, 0x30283a, 1.6))
      const principal = new THREE.DirectionalLight(0xffffff, 3.2)
      principal.position.set(3, 4, 5)
      escena.add(principal)
      const contraluz = new THREE.DirectionalLight(0xd63384, 2.4)
      contraluz.position.set(-4, 1, -3)
      escena.add(contraluz)

      this.placa = this.armarPlaca()
      this.placa.rotation.set(0.32, -0.55, 0)
      escena.add(this.placa)

      this.giro = { x: 0.32, y: -0.55 }
      this.velocidad = { x: 0, y: 0 }
      this.arrastrando = false
      this.visible = true

      this.ajustarTamano()
      this.observadorTam = new ResizeObserver(() => this.ajustarTamano())
      this.observadorTam.observe(el)
      // No dibuja mientras la placa no está en pantalla.
      this.observadorVista = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting
        if (this.visible) this.animar()
      })
      this.observadorVista.observe(el)
      this.animar()
    },

    armarPlaca () {
      const g = new THREE.Group()
      const mat = (color, metal = 0.3, rugosidad = 0.5, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rugosidad, ...extra })

      const carcasa = mat(0x1b1a22, 0.45, 0.45)
      const negro = mat(0x0c0b10, 0.2, 0.8)
      const metal = mat(0xb9bcc6, 0.95, 0.3)
      const oro = mat(0xd9b04c, 1, 0.3)
      const magenta = mat(0xd63384, 0.2, 0.4, { emissive: 0xd63384, emissiveIntensity: 0.55 })
      const pcb = mat(0x14281f, 0.1, 0.7)

      // Placa (PCB), backplate y carcasa
      const placaPcb = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.08, 0.05), pcb)
      placaPcb.position.z = -0.17
      g.add(placaPcb)
      const backplate = new THREE.Mesh(new RoundedBoxGeometry(2.9, 1.08, 0.05, 2, 0.02), mat(0x2a2933, 0.8, 0.35))
      backplate.position.z = -0.23
      g.add(backplate)
      const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(2.86, 1.12, 0.26, 4, 0.08), carcasa)
      cuerpo.position.z = 0.0
      g.add(cuerpo)

      // Disipador: aletas que asoman por arriba y por abajo
      const aleta = new THREE.BoxGeometry(0.012, 0.06, 0.2)
      for (let i = 0; i < 70; i++) {
        const x = -1.3 + i * (2.6 / 69)
        for (const y of [0.585, -0.585]) {
          const a = new THREE.Mesh(aleta, metal)
          a.position.set(x, y, -0.06)
          g.add(a)
        }
      }

      // Franja de luz magenta
      const franja = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.03, 0.02), magenta)
      franja.position.set(0.1, 0.5, 0.135)
      g.add(franja)

      // Tres ventiladores
      this.ventiladores = []
      const aspa = new THREE.BoxGeometry(0.31, 0.11, 0.012)
      for (const x of [-0.92, 0.02, 0.96]) {
        const hueco = new THREE.Mesh(new THREE.CircleGeometry(0.43, 48), negro)
        hueco.position.set(x, 0, 0.131)
        g.add(hueco)
        const aro = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 12, 64), metal)
        aro.position.set(x, 0, 0.14)
        g.add(aro)
        const rotor = new THREE.Group()
        rotor.position.set(x, 0, 0.145)
        for (let i = 0; i < 9; i++) {
          const pivote = new THREE.Group()
          pivote.rotation.z = (i / 9) * Math.PI * 2
          const a = new THREE.Mesh(aspa, mat(0x24232c, 0.3, 0.55))
          a.position.x = 0.25
          a.rotation.x = 0.45
          pivote.add(a)
          rotor.add(pivote)
        }
        const centro = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 32), carcasa)
        centro.rotation.x = Math.PI / 2
        centro.position.z = 0.01
        rotor.add(centro)
        const punto = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), magenta)
        punto.position.z = 0.032
        rotor.add(punto)
        g.add(rotor)
        this.ventiladores.push(rotor)
      }

      // Chapa de conexiones (salidas de video)
      const chapa = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.28, 0.52), metal)
      chapa.position.set(-1.47, -0.02, -0.05)
      g.add(chapa)
      for (let i = 0; i < 4; i++) {
        const puerto = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.09, 0.16), negro)
        puerto.position.set(-1.49, 0.32 - i * 0.2, -0.08)
        g.add(puerto)
      }

      // Conector PCI Express dorado y conector de energía
      const pcie = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 0.03), oro)
      pcie.position.set(-0.55, -0.6, -0.17)
      g.add(pcie)
      const energia = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.12), negro)
      energia.position.set(0.85, 0.6, -0.13)
      g.add(energia)

      g.position.x = 0.04
      return g
    },

    ajustarTamano () {
      const el = this.$refs.lienzo
      if (!el || !this.renderer) return
      const w = el.clientWidth
      const h = el.clientHeight
      this.renderer.setSize(w, h, false)
      this.camara.aspect = w / h
      // Si el espacio es angosto se aleja la cámara para que entre la placa entera.
      this.camara.position.z = w / h < 1.2 ? 6.6 : 5.0
      this.camara.updateProjectionMatrix()
      if (!this.cuadro) this.renderer.render(this.escena, this.camara)
    },

    animar () {
      cancelAnimationFrame(this.cuadro)
      const paso = () => {
        if (!this.visible) { this.cuadro = 0; return }
        if (!this.arrastrando) {
          // Inercia después de soltar y giro lento cuando nadie la toca
          this.giro.y += this.velocidad.y
          this.giro.x += this.velocidad.x
          this.velocidad.y *= 0.94
          this.velocidad.x *= 0.94
          if (!this.quieto && Math.abs(this.velocidad.y) < 0.002) this.giro.y += 0.0035
          // Vuelve suave a una inclinación cómoda
          this.giro.x += (0.3 - this.giro.x) * 0.02
        }
        this.placa.rotation.y = this.giro.y
        this.placa.rotation.x = this.giro.x
        if (!this.quieto) this.ventiladores.forEach((v) => { v.rotation.z -= 0.09 })
        this.renderer.render(this.escena, this.camara)
        this.cuadro = requestAnimationFrame(paso)
      }
      this.cuadro = requestAnimationFrame(paso)
    },

    empezar (e) {
      this.arrastrando = true
      this.ultimo = { x: e.clientX, y: e.clientY }
      this.velocidad = { x: 0, y: 0 }
      this.$refs.lienzo.classList.add('agarrando')
      window.addEventListener('pointermove', this.mover)
      window.addEventListener('pointerup', this.soltar)
      window.addEventListener('pointercancel', this.soltar)
    },
    mover (e) {
      if (!this.arrastrando) return
      const dx = e.clientX - this.ultimo.x
      const dy = e.clientY - this.ultimo.y
      this.ultimo = { x: e.clientX, y: e.clientY }
      this.velocidad = { x: dy * 0.008, y: dx * 0.01 }
      this.giro.y += dx * 0.01
      this.giro.x = Math.max(-0.9, Math.min(1.2, this.giro.x + dy * 0.008))
    },
    soltar () {
      this.arrastrando = false
      if (this.$refs.lienzo) this.$refs.lienzo.classList.remove('agarrando')
      window.removeEventListener('pointermove', this.mover)
      window.removeEventListener('pointerup', this.soltar)
      window.removeEventListener('pointercancel', this.soltar)
    }
  }
}
</script>

<style scoped>
.gpu3d { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.gpu3d__lienzo {
  width: 100%;
  height: 400px;
  cursor: grab;
  user-select: none;
}
.gpu3d__lienzo.agarrando { cursor: grabbing; }
.gpu3d__lienzo :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
.gpu3d__ayuda { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--texto-2); }
</style>
