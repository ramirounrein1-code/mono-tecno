<template>
  <div class="contenedor admin">
    <header class="admin__cabecera">
      <div>
        <span class="eyebrow">Panel de administración</span>
        <h1 class="titulo-seccion">Productos</h1>
      </div>
      <div class="admin__acciones">
        <button type="button" class="btn btn--fantasma" @click="salir">Cerrar sesión</button>
        <router-link :to="{ name: 'alta' }" class="btn btn--primario">+ Agregar producto</router-link>
      </div>
    </header>

    <dl class="stats">
      <div class="tarjeta"><dt>Publicados</dt><dd>{{ productos.length }}</dd></div>
      <div class="tarjeta"><dt>Sin stock</dt><dd>{{ sinStock }}</dd></div>
      <div class="tarjeta"><dt>Valor del stock</dt><dd>{{ valorStock }}</dd></div>
      <div class="tarjeta"><dt>Pedidos</dt><dd>{{ pedidos.length }}</dd></div>
    </dl>

    <div class="tabs" role="tablist" aria-label="Secciones del panel">
      <button id="tab-productos" type="button" role="tab" :aria-selected="pestana === 'productos' ? 'true' : 'false'" aria-controls="panel-productos" @click="pestana = 'productos'">Productos</button>
      <button id="tab-pedidos" type="button" role="tab" :aria-selected="pestana === 'pedidos' ? 'true' : 'false'" aria-controls="panel-pedidos" @click="pestana = 'pedidos'">Pedidos ({{ pedidos.length }})</button>
    </div>

    <transition name="panel" mode="out-in">
      <!-- PRODUCTOS -->
      <section v-if="pestana === 'productos'" id="panel-productos" key="productos" role="tabpanel" aria-labelledby="tab-productos" class="panel">
        <div class="panel__barra">
          <label for="admin-buscar" class="sr-only">Buscar producto</label>
          <input id="admin-buscar" v-model="busqueda" type="search" placeholder="Buscar por nombre, marca o SKU…">
          <label for="admin-orden" class="sr-only">Ordenar</label>
          <select id="admin-orden" v-model="orden">
            <option value="recientes">Más recientes</option>
            <option value="nombre">Nombre</option>
            <option value="stock">Menos stock primero</option>
            <option value="precio">Precio</option>
          </select>
        </div>

        <div class="tabla-caja">
          <table class="tabla">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col">Condición</th>
                <th scope="col" class="num">Precio</th>
                <th scope="col" class="num">Stock</th>
                <th scope="col"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <transition-group tag="tbody" name="fila">
              <tr v-for="p in filtrados" :key="p.id">
                <td>
                  <div class="tabla__producto">
                    <img :src="foto(p)" alt="" width="64" height="48">
                    <div>
                      <router-link :to="{ name: 'detalle', params: { id: p.id } }" class="tabla__nombre">{{ p.nombre }}</router-link>
                      <span class="tabla__sku">{{ p.sku }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ p.categoria }}</td>
                <td>{{ p.condicion }}</td>
                <td class="num">{{ pesos(p.precio) }}</td>
                <td class="num">
                  <div class="stock-rapido">
                    <button type="button" :aria-label="'Restar una unidad de ' + p.nombre" :disabled="p.stock === 0" @click="cambiarStock(p, -1)">−</button>
                    <span :class="['stock', { 'stock--cero': p.stock === 0 }]" aria-live="polite">{{ p.stock }}</span>
                    <button type="button" :aria-label="'Sumar una unidad de ' + p.nombre" @click="cambiarStock(p, 1)">+</button>
                  </div>
                </td>
                <td>
                  <div class="tabla__acciones">
                    <button type="button" :class="['tabla__estrella', { activa: p.destacado }]" :aria-pressed="p.destacado ? 'true' : 'false'" :aria-label="(p.destacado ? 'Quitar de destacados: ' : 'Destacar en el inicio: ') + p.nombre" :title="p.destacado ? 'Destacado en el inicio' : 'Destacar en el inicio'" @click="cambiarDestacado(p)">
                      <svg width="18" height="18" viewBox="0 0 24 24" :fill="p.destacado ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" /></svg>
                    </button>
                    <router-link :to="{ name: 'edicion', params: { id: p.id } }" class="btn btn--fantasma btn--chico">Editar</router-link>
                    <router-link :to="{ name: 'alta', query: { desde: p.id } }" class="btn btn--fantasma btn--chico" :title="'Crear un producto nuevo a partir de ' + p.nombre">Duplicar</router-link>
                    <button type="button" class="btn btn--fantasma btn--chico tabla__borrar" @click="aEliminar = p">Eliminar</button>
                  </div>
                </td>
              </tr>
            </transition-group>
          </table>
        </div>
        <p v-if="!filtrados.length" class="texto-sec panel__vacio">No hay productos que coincidan.</p>

        <button type="button" class="panel__restaurar" @click="confirmarRestaurar = true">Restaurar el catálogo inicial (16 productos)</button>
      </section>

      <!-- PEDIDOS -->
      <section v-else id="panel-pedidos" key="pedidos" role="tabpanel" aria-labelledby="tab-pedidos" class="panel">
        <p v-if="!pedidos.length" class="texto-sec panel__vacio">Todavía no hay pedidos. Se registran cuando un cliente confirma su carrito.</p>
        <template v-else>
        <div class="filtro-pedidos" role="group" aria-label="Filtrar pedidos">
          <button v-for="f in filtrosPedidos" :key="f.id" type="button" :class="{ activo: filtroPedidos === f.id }" :aria-pressed="filtroPedidos === f.id ? 'true' : 'false'" @click="filtroPedidos = f.id">
            {{ f.nombre }} <span>{{ f.cantidad }}</span>
          </button>
        </div>
        <p v-if="!pedidosFiltrados.length" class="texto-sec panel__vacio">{{ filtroPedidos === 'activos' ? 'No hay pedidos pendientes. Los entregados y cancelados están en "Finalizados".' : 'No hay pedidos en esta lista.' }}</p>
        <transition-group :key="filtroPedidos" tag="ul" name="pedido-anim" class="pedidos">
          <li v-for="ped in pedidosFiltrados" :key="ped.numero" class="tarjeta pedido">
            <div class="pedido__cabecera">
              <strong>#{{ ped.numero }}</strong>
              <span class="texto-sec">{{ fecha(ped.fecha) }}</span>
              <span class="pedido__total">{{ pesos(ped.total) }}</span>
            </div>
            <p class="pedido__cliente">
              <strong>{{ ped.cliente.nombre }} {{ ped.cliente.apellido }}</strong> · DNI {{ ped.cliente.dni }} · {{ ped.cliente.telefono }} · {{ ped.cliente.email }}
            </p>
            <p class="pedido__cliente">{{ ped.entrega ? ped.entrega.descripcion : '' }} · Pago: {{ nombrePago(ped.pago) }}</p>
            <ul class="pedido__items">
              <li v-for="it in ped.items" :key="it.id">{{ it.cantidad }} × {{ it.nombre }}</li>
            </ul>
            <div class="pedido__estado">
              <label :for="'estado-' + ped.numero">Estado</label>
              <select :id="'estado-' + ped.numero" :value="ped.estado" :class="'estado--' + claseEstado(ped.estado)" @change="cambiarEstado(ped, $event.target.value)">
                <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
              </select>
              <button type="button" class="pedido__borrar" :aria-label="'Borrar pedido ' + ped.numero" @click="pedidoAEliminar = ped">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></svg>
                Borrar
              </button>
            </div>
          </li>
        </transition-group>
        </template>
      </section>
    </transition>

    <ConfirmModal
      :visible="!!aEliminar"
      titulo="¿Eliminar producto?"
      :mensaje="aEliminar ? `Vas a eliminar “${aEliminar.nombre}” del catálogo. Esta acción no se puede deshacer.` : ''"
      @confirmar="eliminar"
      @cancelar="aEliminar = null"
    />
    <ConfirmModal
      :visible="!!pedidoAEliminar"
      titulo="¿Borrar el pedido?"
      :mensaje="textoBorrarPedido"
      texto-confirmar="Borrar pedido"
      @confirmar="borrarPedido"
      @cancelar="pedidoAEliminar = null"
    />
    <ConfirmModal
      :visible="confirmarRestaurar"
      titulo="¿Restaurar el catálogo?"
      mensaje="Se borran los cambios y productos que agregaste, y vuelven los 16 productos iniciales."
      texto-confirmar="Restaurar"
      @confirmar="restaurar"
      @cancelar="confirmarRestaurar = false"
    />
  </div>
</template>

<script>
import ConfirmModal from '../components/ConfirmModal.vue'
import { obtenerProductos, eliminarProducto, restaurarProductos, obtenerPedidos, actualizarEstadoPedido, eliminarPedido, ajustarStock, alternarDestacado, ESTADOS_PEDIDO, ESTADOS_FINALIZADOS } from '../services/productosService'
import { cerrarSesion } from '../services/auth'
import { formatearPesos } from '../services/dolarService'
import { resolverImagen } from '../services/imagenes'
import { quitar } from '../services/carrito'

const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default {
  name: 'AdminView',
  components: { ConfirmModal },
  emits: ['notificar'],
  data () {
    return {
      productos: [],
      pedidos: [],
      busqueda: '',
      orden: 'recientes',
      pestana: 'productos',
      aEliminar: null,
      confirmarRestaurar: false,
      pedidoAEliminar: null,
      filtroPedidos: 'activos',
      estados: ESTADOS_PEDIDO
    }
  },
  computed: {
    filtrados () {
      const q = normalizar(this.busqueda.trim())
      const lista = this.productos.filter((p) => !q || normalizar(`${p.nombre} ${p.marca} ${p.sku}`).includes(q))
      const comparadores = {
        recientes: (a, b) => b.fechaAlta.localeCompare(a.fechaAlta),
        nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
        stock: (a, b) => a.stock - b.stock,
        precio: (a, b) => b.precio - a.precio
      }
      return [...lista].sort(comparadores[this.orden])
    },
    // Pendientes = todo lo que no está entregado ni cancelado.
    pedidosFiltrados () {
      if (this.filtroPedidos === 'todos') return this.pedidos
      const fin = (p) => ESTADOS_FINALIZADOS.includes(p.estado)
      return this.pedidos.filter((p) => (this.filtroPedidos === 'finalizados' ? fin(p) : !fin(p)))
    },
    filtrosPedidos () {
      const fin = this.pedidos.filter((p) => ESTADOS_FINALIZADOS.includes(p.estado)).length
      return [
        { id: 'activos', nombre: 'Pendientes', cantidad: this.pedidos.length - fin },
        { id: 'finalizados', nombre: 'Finalizados', cantidad: fin },
        { id: 'todos', nombre: 'Todos', cantidad: this.pedidos.length }
      ]
    },
    textoBorrarPedido () {
      const p = this.pedidoAEliminar
      if (!p) return ''
      const vuelve = !['Entregado', 'Enviado', 'Cancelado'].includes(p.estado)
      return `Vas a borrar el pedido #${p.numero} de ${p.cliente.nombre} ${p.cliente.apellido}. ${vuelve ? 'Como todavía no se entregó, sus productos vuelven a estar a la venta. ' : ''}Esta acción no se puede deshacer.`
    },
    sinStock () {
      return this.productos.filter((p) => p.stock === 0).length
    },
    valorStock () {
      return formatearPesos(this.productos.reduce((t, p) => t + p.precio * p.stock, 0))
    }
  },
  created () {
    this.cargar()
  },
  methods: {
    cargar () {
      this.productos = obtenerProductos()
      this.pedidos = obtenerPedidos()
    },
    pesos (v) { return formatearPesos(v) },
    foto (p) { return resolverImagen(p.imagen) },
    fecha (iso) {
      return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
    },
    nombrePago (p) {
      return { mercadoPago: 'Mercado Pago', transferencia: 'Transferencia', efectivo: 'Efectivo' }[p] || '—'
    },
    claseEstado (e) {
      return (e || '').toLowerCase().replace(/\s+/g, '-')
    },
    cambiarEstado (ped, estado) {
      const antes = ped.estado
      actualizarEstadoPedido(ped.numero, estado)
      this.cargar()
      let extra = ''
      if (ESTADOS_FINALIZADOS.includes(estado) && this.filtroPedidos === 'activos') extra = ' Pasó a "Finalizados".'
      if (estado === 'Cancelado') extra += ' Sus productos volvieron a estar a la venta.'
      if (antes === 'Cancelado' && estado !== 'Cancelado') extra += ' Se volvió a descontar el stock.'
      this.$emit('notificar', { mensaje: `Pedido #${ped.numero}: ${estado}.${extra}`, tipo: 'info' })
    },
    // Atajos de la tabla: se guardan al instante, sin entrar a "Editar".
    cambiarStock (p, cambio) {
      p.stock = ajustarStock(p.id, cambio)
    },
    cambiarDestacado (p) {
      p.destacado = alternarDestacado(p.id)
      this.$emit('notificar', { mensaje: p.destacado ? `“${p.nombre}” se muestra en Destacados del inicio.` : `“${p.nombre}” ya no está en Destacados.`, tipo: 'info' })
    },
    borrarPedido () {
      const n = this.pedidoAEliminar.numero
      eliminarPedido(n)
      this.pedidoAEliminar = null
      this.cargar()
      this.$emit('notificar', { mensaje: `Se borró el pedido #${n}.` })
    },
    salir () {
      cerrarSesion()
      this.$router.push({ name: 'inicio' })
      this.$emit('notificar', { mensaje: 'Cerraste sesión.', tipo: 'info' })
    },
    eliminar () {
      const { id, nombre } = this.aEliminar
      eliminarProducto(id)
      quitar(id) // si estaba en el carrito, se saca
      this.aEliminar = null
      this.cargar()
      this.$emit('notificar', { mensaje: `“${nombre}” se eliminó del catálogo.` })
    },
    restaurar () {
      restaurarProductos()
      this.confirmarRestaurar = false
      this.cargar()
      this.$emit('notificar', { mensaje: 'Se restauró el catálogo inicial.', tipo: 'info' })
    }
  }
}
</script>

<style scoped>
.admin { padding-top: 28px; padding-bottom: 48px; display: flex; flex-direction: column; gap: 20px; }
.admin__cabecera { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px; }
.admin__cabecera h1 { margin-top: 6px; }
.stats { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.stats div { padding: 14px 16px; }
.stats dt { font-size: 12px; color: var(--texto-2); }
.stats dd { margin: 2px 0 0; font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; }

.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--borde); }
.tabs button {
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  color: var(--texto-2);
  cursor: pointer;
}
.tabs button[aria-selected="true"] { color: var(--texto); border-bottom-color: var(--magenta); }

.admin > * { min-width: 0; max-width: 100%; }
.panel { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.panel__barra { display: flex; flex-wrap: wrap; gap: 10px; }
.panel__barra input,
.panel__barra select {
  font: inherit;
  font-size: 16px;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--borde);
  border-radius: 10px;
  background: var(--papel);
  color: var(--texto);
}
.panel__barra input { flex: 1 1 240px; min-width: 0; }
.panel__vacio { margin: 0; }
.panel__restaurar {
  align-self: flex-start;
  border: 0;
  background: none;
  padding: 8px 0;
  min-height: 44px;
  font: inherit;
  font-size: 14px;
  color: var(--magenta-texto);
  text-decoration: underline;
  cursor: pointer;
}

.tabla-caja { position: relative; max-width: 100%; overflow-x: auto; border: 1px solid var(--borde); border-radius: var(--radio); background: var(--papel); }
.tabla { width: 100%; min-width: 900px; border-collapse: collapse; font-size: 14px; }
.tabla th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--texto-2);
  padding: 12px 14px;
  border-bottom: 1px solid var(--borde);
  background: #faf8f8;
}
.tabla td { padding: 10px 14px; border-bottom: 1px solid var(--borde); vertical-align: middle; }
.tabla tr:last-child td { border-bottom: 0; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.tabla__producto { display: flex; align-items: center; gap: 12px; }
.tabla__producto img { width: 64px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid var(--borde); background: #fff; flex: none; }
.tabla__nombre { color: var(--texto); font-weight: 600; }
.tabla__sku { display: block; font-size: 12px; color: var(--texto-2); }
.stock { display: inline-block; min-width: 28px; padding: 2px 8px; border-radius: 999px; background: #e7f4ec; color: var(--exito); font-weight: 600; text-align: center; }
.stock--cero { background: #fdecea; color: var(--error); }
.stock-rapido { display: inline-flex; align-items: center; gap: 6px; }
.stock-rapido button { width: 32px; height: 32px; border: 1px solid var(--borde); border-radius: 8px; background: var(--papel); font: inherit; font-size: 18px; line-height: 1; color: var(--texto); cursor: pointer; }
.stock-rapido button:hover:not(:disabled) { border-color: var(--navy); }
.stock-rapido button:disabled { color: #c9c3c5; cursor: not-allowed; }
.tabla__estrella { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--borde); border-radius: 10px; background: var(--papel); color: #b9b3b5; cursor: pointer; }
.tabla__estrella.activa { color: #e0a100; border-color: #f1d27a; background: #fff8e1; }
/* Pedidos: al pasar a Finalizados (o borrarse) la tarjeta se desvanece y las demás suben suave */
.pedido-anim-move { transition: transform 0.35s ease; }
.pedido-anim-enter-active, .pedido-anim-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.pedido-anim-enter-from { opacity: 0; transform: translateY(8px); }
.pedido-anim-leave-to { opacity: 0; transform: scale(0.97); }
.pedido-anim-leave-active { position: absolute; left: 0; right: 0; }
.tabla__acciones { display: flex; gap: 6px; justify-content: flex-end; }
.tabla__borrar { color: var(--error); }

.fila-move,
.fila-enter-active,
.fila-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fila-enter-from,
.fila-leave-to { opacity: 0; transform: translateX(-16px); }

.pedidos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; position: relative; }
.filtro-pedidos { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.filtro-pedidos button { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border: 1px solid var(--borde); border-radius: 999px; background: var(--papel); font: inherit; font-size: 14px; color: var(--texto); cursor: pointer; }
.filtro-pedidos button span { min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; background: var(--fondo); font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }
.filtro-pedidos button.activo { background: var(--navy); border-color: var(--navy); color: #fff; }
.filtro-pedidos button.activo span { background: var(--magenta); color: #fff; }
.pedido__borrar { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 12px; border: 1px solid var(--borde); border-radius: 10px; background: var(--papel); font: inherit; font-size: 14px; color: var(--error); cursor: pointer; }
.pedido__borrar:hover { background: #fff5f4; border-color: var(--error); }
.pedido { padding: 16px; display: flex; flex-direction: column; gap: 6px; }
.pedido__cabecera { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; }
.pedido__total { margin-left: auto; font-weight: 650; font-variant-numeric: tabular-nums; }
.pedido__cliente { margin: 0; font-size: 14px; overflow-wrap: anywhere; }
.pedido__estado { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 14px; }
.pedido__estado select { font: inherit; font-size: 14px; min-height: 40px; padding: 0 10px; border: 1px solid var(--borde); border-radius: 10px; background: var(--papel); font-weight: 600; }
.estado--pendiente-de-pago { color: #9a5b00; background: #fff6e5 !important; }
.estado--pagado,
.estado--entregado { color: var(--exito); background: #e7f4ec !important; }
.estado--enviado { color: var(--sobre-rosa); background: var(--rosa) !important; }
.estado--cancelado { color: var(--error); background: #fdecea !important; }
.admin__acciones { display: flex; flex-wrap: wrap; gap: 10px; }
.pedido__items { margin: 0; padding-left: 18px; font-size: 14px; color: var(--texto-2); }

.panel-enter-active,
.panel-leave-active { transition: opacity 0.18s ease; }
.panel-enter-from,
.panel-leave-to { opacity: 0; }

@media (min-width: 768px) {
  .admin { padding-top: 40px; }
  .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
</style>
