<template>
  <figure v-show="soportado" class="gpu3d">
    <div
      ref="lienzo"
      :class="['gpu3d__lienzo', { cargando: !cargada }]"
      role="img"
      aria-label="Placa de video en 3D. Se puede girar arrastrándola con el mouse."
      @pointerdown="empezar"
    ></div>
  </figure>
</template>

<script>
// Placa de video real en 3D (modelo de Sketchfab con licencia CC BY 4.0; crédito en CREDITOS.md), con three.js.
// El archivo original pesaba 12 MB: se comprimió a 1 MB (geometría con meshopt y texturas en WebP).
// Solo se usa en computadora. Se gira arrastrando con el mouse; no gira sola.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const MODELO = '/modelos/rtx-3080.glb'
const LARGO = 3 // largo que va a tener la placa en la escena

export default {
  name: 'GpuModel3D',
  data () {
    return { soportado: true, cargada: false }
  },
  mounted () {
    try {
      this.iniciar()
    } catch (e) {
      this.soportado = false // sin WebGL no se muestra
    }
  },
  beforeUnmount () {
    this.desmontado = true
    cancelAnimationFrame(this.cuadro)
    this.soltar()
    if (this.observadorTam) this.observadorTam.disconnect()
    if (this.observadorVista) this.observadorVista.disconnect()
    if (this.escena) {
      this.escena.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])
        mats.forEach((m) => {
          Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose() })
          m.dispose()
        })
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
      renderer.toneMappingExposure = 1.1
      el.appendChild(renderer.domElement)
      this.renderer = renderer

      const escena = new THREE.Scene()
      // Reflejos de "estudio" para que el metal se vea real
      const pmrem = new THREE.PMREMGenerator(renderer)
      escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()
      this.escena = escena

      const principal = new THREE.DirectionalLight(0xffffff, 1.4)
      principal.position.set(3, 5, 6)
      escena.add(principal)
      const contraluz = new THREE.DirectionalLight(0xd63384, 0.9)
      contraluz.position.set(-5, 2, -4)
      escena.add(contraluz)

      this.camara = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
      this.camara.position.set(0, 0, 8)
      this.reloj = new THREE.Clock()

      // "pivote" gira con el mouse; adentro va el modelo acostado y centrado
      this.pivote = new THREE.Group()
      escena.add(this.pivote)
      this.radio = LARGO / 2
      this.giro = { x: 0.42, y: 3.6 } // arranca mostrando el ventilador y el logo
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

      const cargador = new GLTFLoader()
      cargador.setMeshoptDecoder(MeshoptDecoder)
      cargador.load(MODELO, (gltf) => {
        if (this.desmontado) return
        this.colocarModelo(gltf)
      }, undefined, () => { this.soportado = false })
    },

    colocarModelo (gltf) {
      const modelo = gltf.scene
      // El modelo viene parado: se acuesta para que se vea como en una vidriera.
      modelo.rotation.z = Math.PI / 2
      modelo.updateMatrixWorld(true)
      // Escala para que mida LARGO y centrado en el origen (así gira sobre su centro)
      const caja = new THREE.Box3().setFromObject(modelo)
      const tam = caja.getSize(new THREE.Vector3())
      const escala = LARGO / Math.max(tam.x, tam.y, tam.z)
      const ajuste = new THREE.Group()
      ajuste.add(modelo)
      ajuste.scale.setScalar(escala)
      const centro = caja.getCenter(new THREE.Vector3()).multiplyScalar(escala)
      ajuste.position.sub(centro)
      this.pivote.add(ajuste)

      // Radio de la esfera que envuelve la placa: con eso la cámara la encuadra sin cortarla en ningún ángulo
      const esfera = new THREE.Box3().setFromObject(this.pivote).getBoundingSphere(new THREE.Sphere())
      this.radio = esfera.radius
      this.ajustarTamano()

      // Animación de los ventiladores que trae el modelo
      if (gltf.animations && gltf.animations.length && !this.quieto) {
        this.mezclador = new THREE.AnimationMixer(modelo)
        // El modelo trae varias velocidades: se usa solo la de 1500 rpm
        const clip = gltf.animations.find((a) => /1500/.test(a.name)) || gltf.animations[0]
        this.mezclador.clipAction(clip).play()
      }
      this.cargada = true
    },

    ajustarTamano () {
      const el = this.$refs.lienzo
      if (!el || !this.renderer) return
      const w = el.clientWidth
      const h = el.clientHeight
      this.renderer.setSize(w, h, false)
      this.camara.aspect = w / h
      const fovV = THREE.MathUtils.degToRad(this.camara.fov)
      const fovH = 2 * Math.atan(Math.tan(fovV / 2) * this.camara.aspect)
      const distancia = (this.radio * 0.9) / Math.sin(Math.min(fovV, fovH) / 2)
      this.camara.position.set(0, 0, distancia)
      this.camara.lookAt(0, 0, 0)
      this.camara.updateProjectionMatrix()
      this.renderer.render(this.escena, this.camara)
    },

    animar () {
      cancelAnimationFrame(this.cuadro)
      const paso = () => {
        if (!this.visible || this.desmontado) { this.cuadro = 0; return }
        const dt = this.reloj.getDelta()
        if (!this.arrastrando) {
          // Un poco de inercia al soltar, y después queda quieta
          this.giro.y += this.velocidad.y
          this.giro.x = Math.max(-1, Math.min(1.1, this.giro.x + this.velocidad.x))
          this.velocidad.y *= 0.9
          this.velocidad.x *= 0.9
        }
        this.pivote.rotation.y = this.giro.y
        this.pivote.rotation.x = this.giro.x
        if (this.mezclador) this.mezclador.update(dt)
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
.gpu3d { margin: 0; display: flex; flex-direction: column; gap: 6px; }
.gpu3d__lienzo {
  width: 100%;
  height: 500px;
  cursor: grab;
  user-select: none;
  transition: opacity 0.4s ease;
}
.gpu3d__lienzo.cargando { opacity: 0; }
.gpu3d__lienzo.agarrando { cursor: grabbing; }
.gpu3d__lienzo :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
@media (prefers-reduced-motion: reduce) { .gpu3d__lienzo { transition: none; } }
</style>
