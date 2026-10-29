<template>
  <div class="contenedor form-vista">
    <router-link :to="{ name: 'admin' }" class="form-vista__volver">← Volver al panel</router-link>

    <div v-if="esEdicion && !producto" class="tarjeta vacio">
      <h1>Producto no encontrado</h1>
      <router-link :to="{ name: 'admin' }" class="btn btn--primario">Ir al panel</router-link>
    </div>

    <template v-else>
      <header class="form-vista__cabecera">
        <span class="eyebrow">Panel de administración</span>
        <h1 class="titulo-seccion">{{ esEdicion ? 'Editar producto' : producto ? 'Duplicar producto' : 'Agregar producto' }}</h1>
        <p class="texto-sec">Los campos con * son obligatorios.</p>
      </header>

      <!-- El mismo componente sirve para alta y edición -->
      <ProductForm
        :producto-inicial="producto"
        :modo="esEdicion ? 'edicion' : 'alta'"
        :error-general="errorGuardado"
        @guardar="guardar"
        @cancelar="$router.push({ name: 'admin' })"
      />
    </template>
  </div>
</template>

<script>
import ProductForm from '../components/ProductForm.vue'
import { obtenerProducto, crearProducto, actualizarProducto, siguienteSku } from '../services/productosService'

export default {
  name: 'ProductFormView',
  components: { ProductForm },
  props: {
    id: { type: String, default: null } // solo existe en /admin/productos/:id/editar
  },
  emits: ['notificar'],
  data () {
    return { producto: null, errorGuardado: '' }
  },
  computed: {
    esEdicion () {
      return !!this.id
    }
  },
  created () {
    if (this.esEdicion) {
      this.producto = obtenerProducto(this.id)
      return
    }
    // "Duplicar": el alta arranca con los datos de otro producto (nombre marcado como copia, SKU nuevo).
    const base = this.$route.query.desde ? obtenerProducto(String(this.$route.query.desde)) : null
    if (base) {
      const { id, fechaAlta, ...resto } = base
      this.producto = { ...resto, nombre: `${base.nombre} (copia)`.slice(0, 80), sku: siguienteSku(), stock: 1, destacado: false }
    }
  },
  methods: {
    guardar (datos) {
      this.errorGuardado = ''
      try {
        if (this.esEdicion) {
          actualizarProducto(this.id, datos)
          this.$emit('notificar', { mensaje: `Guardaste los cambios de “${datos.nombre}”.` })
        } else {
          crearProducto(datos)
          this.$emit('notificar', { mensaje: `“${datos.nombre}” ya está publicado en la tienda.` })
        }
        this.$router.push({ name: 'admin' })
      } catch (e) {
        this.errorGuardado = e.message
      }
    }
  }
}
</script>

<style scoped>
.form-vista { padding-top: 24px; padding-bottom: 48px; max-width: 880px; }
.form-vista__volver { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: 8px; }
.form-vista__cabecera { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.form-vista__cabecera p { margin: 0; }
.vacio { padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.vacio h1 { font-size: 28px; }
</style>
