import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { aplicarSeo, DESCRIPCIONES } from '../services/seo'
import HomeView from '../views/HomeView.vue'
import { estaLogueado, registrarActividad } from '../services/auth'
import { estaLogueadoCliente } from '../services/cuentas'

// Rutas de la SPA. Las vistas secundarias se cargan "lazy" (code splitting).
const routes = [
  // ---- Tienda ----
  { path: '/', name: 'inicio', component: HomeView, meta: { titulo: 'Inicio' } },
  { path: '/productos', name: 'listado', component: () => import('../views/ProductsView.vue'), meta: { titulo: 'Catálogo' } },
  { path: '/productos/:id', name: 'detalle', component: () => import('../views/ProductDetailView.vue'), props: true, meta: { titulo: 'Producto' } },
  { path: '/carrito', name: 'carrito', component: () => import('../views/CartView.vue'), meta: { titulo: 'Carrito' } },
  { path: '/checkout', name: 'checkout', component: () => import('../views/CheckoutView.vue'), meta: { titulo: 'Finalizar compra' } },
  { path: '/pedido/:numero', name: 'pedido', component: () => import('../views/OrderView.vue'), props: true, meta: { titulo: 'Tu pedido' } },
  { path: '/cuenta', name: 'cuenta', component: () => import('../views/AccountView.vue'), meta: { titulo: 'Mi cuenta', soloCliente: true } },
  { path: '/cuenta/ingresar', name: 'ingresar', component: () => import('../views/AuthView.vue'), meta: { titulo: 'Ingresar', soloInvitado: true } },
  { path: '/cuenta/registro', name: 'registro', component: () => import('../views/AuthView.vue'), meta: { titulo: 'Crear cuenta', soloInvitado: true } },
  { path: '/comparar', name: 'comparar', component: () => import('../views/CompareView.vue'), meta: { titulo: 'Comparar' } },
  { path: '/arma-tu-pc', name: 'armado', component: () => import('../views/BuildView.vue'), meta: { titulo: 'Armá tu PC' } },
  { path: '/acerca', name: 'acerca', component: () => import('../views/AboutView.vue'), meta: { titulo: 'Nosotros' } },

  // ---- Administración (requiere iniciar sesión) ----
  { path: '/admin/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { titulo: 'Ingresar' } },
  { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue'), meta: { titulo: 'Panel de administración', soloAdmin: true } },
  { path: '/admin/productos/nuevo', name: 'alta', component: () => import('../views/ProductFormView.vue'), meta: { titulo: 'Agregar producto', soloAdmin: true } },
  { path: '/admin/productos/:id/editar', name: 'edicion', component: () => import('../views/ProductFormView.vue'), props: true, meta: { titulo: 'Editar producto', soloAdmin: true } },

  { path: '/:pathMatch(.*)*', name: 'no-encontrado', component: () => import('../views/NotFoundView.vue'), meta: { titulo: 'Página no encontrada' } }
]

const router = createRouter({
  // En Vercel se usa history normal; para la vista previa en un solo archivo se usa modo hash.
  history: process.env.VUE_APP_HASH ? createWebHashHistory() : createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Al cambiar solo los filtros del catálogo (?q=, ?categoria=) no se mueve la página.
    if (to.path === from.path) return false
    return { top: 0 }
  }
})

// Guardia de navegación: las rutas del panel piden sesión iniciada.
router.beforeEach(async (to) => {
  if (to.meta.soloAdmin && !(await estaLogueado())) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && (await estaLogueado())) return { name: 'admin' }
  // Cuentas de clientes
  if (to.meta.soloCliente && !estaLogueadoCliente()) return { name: 'ingresar', query: { redirect: to.fullPath } }
  if (to.meta.soloInvitado && estaLogueadoCliente()) return { name: 'cuenta' }
  return true
})

// Actualiza el título de la pestaña en cada navegación.
// Título, descripción y etiquetas para Google en cada navegación.
// (El detalle de producto las completa él mismo con los datos del producto.)
router.afterEach((to) => {
  registrarActividad()
  if (to.name === 'detalle') return
  // Las páginas privadas (panel, cuenta, pedidos, carrito) no se muestran en Google.
  const privada = to.path.startsWith('/admin') || to.path.startsWith('/cuenta') || to.path.startsWith('/pedido') || to.path === '/checkout' || to.path === '/carrito' || to.name === 'no-encontrado'
  const ruta = to.name === 'listado' && to.query.categoria ? `/productos?categoria=${encodeURIComponent(to.query.categoria)}` : to.path
  aplicarSeo({
    titulo: to.name === 'inicio' ? '' : (to.name === 'listado' && to.query.categoria ? `${to.query.categoria} usadas y nuevas` : to.meta.titulo),
    descripcion: DESCRIPCIONES[to.name],
    ruta,
    indexar: !privada
  })
})

export default router
