<template>
  <div
    v-show="soportado"
    ref="lienzo"
    class="gpu3d"
    role="img"
    aria-label="Placa de video en 3D. Se puede girar arrastrándola con el mouse."
    @pointerdown="empezar"
  ></div>
</template>

<script>
// Placa de video en 3D hecha con three.js (modelo propio, genérico, sin marcas).
// Solo se usa en computadora. Se gira arrastrando con el mouse; no gira sola.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Medidas aproximadas de una placa de 3 ventiladores (en unidades de la escena)
const LARGO = 3.1
const ALTO = 1.22
const GROSOR_CARCASA = 0.2

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
    this.soltar()
    if (this.observadorTam) this.observadorTam.disconnect()
    if (this.observadorVista) this.observadorVista.disconnect()
    if (this.escena) {
      this.escena.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) o.material.dispose()
      })
      if (this.escena.environment) this.escena.environment.dispose()
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
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.35
      el.appendChild(renderer.domElement)
      this.renderer = renderer

      const escena = new THREE.Scene()
      // Reflejos de "estudio" para que los metales se vean reales
      const pmrem = new THREE.PMREMGenerator(renderer)
      escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()
      this.escena = escena

      const principal = new THREE.DirectionalLight(0xffffff, 2.4)
      principal.position.set(3, 5, 6)
      escena.add(principal)
      const relleno = new THREE.DirectionalLight(0xdfe6ff, 1.0)
      relleno.position.set(-4, -2, 5)
      escena.add(relleno)
      const trasera = new THREE.DirectionalLight(0xffffff, 1.8)
      trasera.position.set(2, 3, -6)
      escena.add(trasera)
      const contraluz = new THREE.DirectionalLight(0xd63384, 1.2)
      contraluz.position.set(-5, 2, -4)
      escena.add(contraluz)

      this.camara = new THREE.PerspectiveCamera(30, 1, 0.1, 60)

      this.placa = this.armarPlaca()
      escena.add(this.placa)
      // Radio de la esfera que envuelve la placa: sirve para que nunca se corte al girarla.
      const caja = new THREE.Box3().setFromObject(this.placa)
      this.radio = caja.getBoundingSphere(new THREE.Sphere()).radius

      this.giro = { x: 0.28, y: -0.6 }
      this.velocidad = { x: 0, y: 0 }
      this.arrastrando = false
      this.visible = true

      this.ajustarTamano()
      this.observadorTam = new ResizeObserver(() => this.ajustarTamano())
      this.observadorTam.observe(el)
      this.observadorVista = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting
        if (this.visible) this.animar()
      })
      this.observadorVista.observe(el)
      this.animar()
    },

    armarPlaca () {
      const g = new THREE.Group()
      const mat = (color, metalness, roughness, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })

      const carcasa = mat(0x3a3d46, 0.75, 0.32)
      const plata = mat(0xc8ccd4, 1, 0.22)
      const aluminio = mat(0xd2d6dd, 0.95, 0.28)
      const negro = mat(0x08080b, 0.3, 0.6)
      const plastico = mat(0x141418, 0.1, 0.55)
      const cobre = mat(0xc77b4a, 1, 0.28)
      const oro = mat(0xe0b553, 1, 0.25)
      const pcb = mat(0x10241a, 0.15, 0.55)
      const backplateMat = mat(0x5a5e68, 0.5, 0.45)
      const rgb = mat(0xd63384, 0, 0.4, { emissive: 0xd63384, emissiveIntensity: 1.4 })

      // ---- Carcasa delantera (cubre los ventiladores) ----
      const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(LARGO, ALTO, GROSOR_CARCASA, 5, 0.06), carcasa)
      cuerpo.position.z = 0.06
      g.add(cuerpo)
      // Molduras plateadas en diagonal entre los ventiladores
      for (const x of [-0.5, 0.5]) {
        const moldura = new THREE.Mesh(new THREE.BoxGeometry(0.035, ALTO * 0.92, 0.012), plata)
        moldura.position.set(x, 0, 0.165)
        moldura.rotation.z = 0.32
        g.add(moldura)
      }
      // Tira de luz RGB en el borde superior
      const tira = new THREE.Mesh(new THREE.BoxGeometry(LARGO * 0.7, 0.025, 0.03), rgb)
      tira.position.set(0.15, ALTO / 2 - 0.01, 0.1)
      g.add(tira)

      // ---- Ventiladores con aspas curvas ----
      const formaAspa = new THREE.Shape()
      formaAspa.moveTo(0.11, -0.035)
      formaAspa.quadraticCurveTo(0.27, -0.11, 0.425, -0.05)
      formaAspa.lineTo(0.43, 0.07)
      formaAspa.quadraticCurveTo(0.28, 0.045, 0.11, 0.05)
      formaAspa.closePath()
      const aspaGeo = new THREE.ExtrudeGeometry(formaAspa, { depth: 0.008, bevelEnabled: false, curveSegments: 10 })
      const aspaMat = mat(0x24252b, 0.2, 0.42)
      this.ventiladores = []
      for (const x of [-1.0, 0.0, 1.0]) {
        const hueco = new THREE.Mesh(new THREE.CylinderGeometry(0.455, 0.455, 0.05, 64), negro)
        hueco.rotation.x = Math.PI / 2
        hueco.position.set(x, 0, 0.145)
        g.add(hueco)
        const aro = new THREE.Mesh(new THREE.TorusGeometry(0.465, 0.016, 12, 80), plata)
        aro.position.set(x, 0, 0.168)
        g.add(aro)
        const rotor = new THREE.Group()
        rotor.position.set(x, 0, 0.152)
        for (let i = 0; i < 11; i++) {
          const pivote = new THREE.Group()
          pivote.rotation.z = (i / 11) * Math.PI * 2
          const aspa = new THREE.Mesh(aspaGeo, aspaMat)
          aspa.rotation.x = 0.38 // inclinación del aspa
          pivote.add(aspa)
          rotor.add(pivote)
        }
        const buje = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.12, 0.05, 48), carcasa)
        buje.rotation.x = Math.PI / 2
        buje.position.z = 0.012
        rotor.add(buje)
        const tapa = new THREE.Mesh(new THREE.CircleGeometry(0.085, 40), plata)
        tapa.position.z = 0.038
        rotor.add(tapa)
        g.add(rotor)
        this.ventiladores.push(rotor)
      }

      // ---- Disipador: aletas de aluminio (instanciadas para que sea liviano) ----
      const cantidadAletas = 120
      const aletas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.008, ALTO * 0.9, 0.16), aluminio, cantidadAletas)
      const m = new THREE.Matrix4()
      for (let i = 0; i < cantidadAletas; i++) {
        m.makeTranslation(-LARGO / 2 + 0.12 + i * ((LARGO - 0.24) / (cantidadAletas - 1)), 0, -0.12)
        aletas.setMatrixAt(i, m)
      }
      g.add(aletas)
      // Heatpipes de cobre que asoman por arriba
      for (let i = 0; i < 4; i++) {
        const z = -0.17 + i * 0.035
        const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, LARGO * 0.62, 16), cobre)
        tubo.rotation.z = Math.PI / 2
        tubo.position.set(-0.15 + i * 0.05, ALTO * 0.45 + 0.03, z)
        g.add(tubo)
        const codo = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 10, 20, Math.PI / 2), cobre)
        codo.position.set(-0.15 + i * 0.05 - LARGO * 0.31, ALTO * 0.45 - 0.03, z)
        codo.rotation.z = Math.PI / 2
        g.add(codo)
      }

      // ---- PCB y backplate ----
      const placaPcb = new THREE.Mesh(new THREE.BoxGeometry(LARGO * 0.94, ALTO * 0.98, 0.035), pcb)
      placaPcb.position.set(-0.08, -0.02, -0.215)
      g.add(placaPcb)
      const backplate = new THREE.Mesh(new RoundedBoxGeometry(LARGO * 0.98, ALTO, 0.03, 3, 0.012), backplateMat)
      backplate.position.set(0, 0, -0.25)
      g.add(backplate)
      // Ranuras de ventilación en el backplate
      for (let i = 0; i < 9; i++) {
        const ranura = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.42, 0.01), negro)
        ranura.position.set(0.85 + i * 0.065, 0.12, -0.268)
        g.add(ranura)
      }

      // ---- Chapa con las salidas de video ----
      const chapa = new THREE.Mesh(new THREE.BoxGeometry(0.02, ALTO * 1.12, 0.62), plata)
      chapa.position.set(-LARGO / 2 - 0.02, 0.0, -0.06)
      g.add(chapa)
      const salidas = [
        { y: 0.36, alto: 0.08, ancho: 0.16 }, // DisplayPort
        { y: 0.16, alto: 0.08, ancho: 0.16 }, // DisplayPort
        { y: -0.04, alto: 0.08, ancho: 0.16 }, // DisplayPort
        { y: -0.25, alto: 0.07, ancho: 0.2 } // HDMI
      ]
      for (const s of salidas) {
        const marco = new THREE.Mesh(new THREE.BoxGeometry(0.026, s.alto + 0.02, s.ancho + 0.02), aluminio)
        marco.position.set(-LARGO / 2 - 0.025, s.y, -0.12)
        g.add(marco)
        const boca = new THREE.Mesh(new THREE.BoxGeometry(0.03, s.alto, s.ancho), negro)
        boca.position.set(-LARGO / 2 - 0.027, s.y, -0.12)
        g.add(boca)
      }
      // Agujeros de ventilación de la chapa
      for (let fila = 0; fila < 6; fila++) {
        for (let col = 0; col < 2; col++) {
          const agujero = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.05, 0.05), negro)
          agujero.position.set(-LARGO / 2 - 0.022, 0.42 - fila * 0.13, 0.12 + col * 0.08)
          g.add(agujero)
        }
      }

      // ---- Conector PCI Express con contactos dorados ----
      const peine = new THREE.Group()
      for (let i = 0; i < 46; i++) {
        const contacto = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.1, 0.038), oro)
        contacto.position.x = i * 0.022 + (i > 10 ? 0.03 : 0)
        peine.add(contacto)
      }
      peine.position.set(-1.25, -ALTO / 2 - 0.06, -0.215)
      g.add(peine)

      // ---- Dos conectores de energía de 8 pines ----
      for (const x of [0.62, 0.86]) {
        const conector = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.1), plastico)
        conector.position.set(x, ALTO / 2 + 0.035, -0.17)
        g.add(conector)
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 2; j++) {
            const pin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.03), negro)
            pin.position.set(x - 0.066 + i * 0.044, ALTO / 2 + 0.081, -0.195 + j * 0.045)
            g.add(pin)
          }
        }
      }

      // Centra la placa en el origen para que gire sobre su centro
      const centro = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3())
      g.children.forEach((c) => c.position.sub(centro))
      return g
    },

    ajustarTamano () {
      const el = this.$refs.lienzo
      if (!el || !this.renderer) return
      const w = el.clientWidth
      const h = el.clientHeight
      this.renderer.setSize(w, h, false)
      this.camara.aspect = w / h
      // Distancia para que la esfera que envuelve la placa entre completa en cualquier ángulo.
      const fovV = THREE.MathUtils.degToRad(this.camara.fov)
      const fovH = 2 * Math.atan(Math.tan(fovV / 2) * this.camara.aspect)
      const distancia = (this.radio * 1.06) / Math.sin(Math.min(fovV, fovH) / 2)
      this.camara.position.set(0, 0, distancia)
      this.camara.lookAt(0, 0, 0)
      this.camara.updateProjectionMatrix()
      this.renderer.render(this.escena, this.camara)
    },

    animar () {
      cancelAnimationFrame(this.cuadro)
      const paso = () => {
        if (!this.visible) { this.cuadro = 0; return }
        if (!this.arrastrando) {
          // Un poco de inercia al soltar, y después queda quieta
          this.giro.y += this.velocidad.y
          this.giro.x = Math.max(-1, Math.min(1.1, this.giro.x + this.velocidad.x))
          this.velocidad.y *= 0.9
          this.velocidad.x *= 0.9
        }
        this.placa.rotation.y = this.giro.y
        this.placa.rotation.x = this.giro.x
        if (!this.quieto) this.ventiladores.forEach((v) => { v.rotation.z -= 0.08 })
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
      this.velocidad = { x: dy * 0.006, y: dx * 0.008 }
      this.giro.y += dx * 0.008
      this.giro.x = Math.max(-1, Math.min(1.1, this.giro.x + dy * 0.006))
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
.gpu3d {
  width: 100%;
  height: 420px;
  cursor: grab;
  user-select: none;
}
.gpu3d.agarrando { cursor: grabbing; }
.gpu3d :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
</style>
