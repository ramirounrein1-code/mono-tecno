# mono.tecno — Tienda online de hardware (SPA en Vue)

Trabajo Práctico Integrador Final · **Práctica Profesionalizante Desarrollo Web y Mobile**
Tecnicatura Superior en Diseño Multimedial · Docente: Facundo Romero

## Integrantes

- Ramiro Unrein

## Descripción del proyecto

SPA (Single Page Application) orientada a celulares para **mono.tecno**, un servicio técnico de PC de Ituzaingó que vende placas de video usadas (revisadas antes de publicarse) y otros componentes.

La app tiene dos partes:

- **Cuentas de clientes**: registro, inicio de sesión y "Mi cuenta" con historial de pedidos; los datos se completan solos al comprar.
- **Tienda**: catálogo con buscador, filtros y orden, detalle de cada producto, carrito y compra en 3 pasos (datos, entrega y pago) con Mercado Pago, transferencia o efectivo.
- **Panel de administración** (`/admin`, con contraseña): alta, edición y baja de productos con foto (subida desde la computadora o por link), control de stock y pedidos con su estado.

Todo se guarda en **LocalStorage**, y la cotización del dólar se trae en vivo con **Fetch** desde DolarAPI para mostrar el precio aproximado en dólares.

Temática: **Catálogo de Productos**. Diseño basado en el estilo "Superhuman" de [Refero Styles](https://styles.refero.design/), con los colores del logo (azul noche `#0B0B2A` y magenta `#D63384`).

**Deploy:** [URL DE VERCEL]
**Repositorio:** [URL DE GITHUB]

## Tecnologías utilizadas

- Vue 3 (Options API)
- Vue CLI 5
- Vue Router 4
- LocalStorage
- Fetch API → [DolarAPI](https://dolarapi.com)
- Canvas API (logo de puntitos interactivo y achicado de fotos subidas)
- HTML5 + CSS3 (mobile-first, sin frameworks de CSS)

## Instrucciones de instalación

Requisitos: Node.js 18 o superior.

```bash
npm install        # instalar dependencias
npm run serve      # servidor de desarrollo en http://localhost:8080
npm run build      # versión de producción en /dist
```

### Deploy en Vercel

1. Subir el repositorio a GitHub.
2. En Vercel: **Add New → Project** e importar el repositorio. Vercel detecta Vue CLI (build `npm run build`, salida `dist`).
3. El archivo `vercel.json` redirige todas las rutas a `index.html`, así funcionan los links directos como `/productos/p04`.

## Configurar la tienda antes de publicar

Todos los datos del negocio están en `src/config/tienda.js`. Hay que completar lo que está entre [CORCHETES]:

- **Transferencia**: alias, CBU/CVU, titular y banco (se muestran al cliente al confirmar la compra).
- **Mercado Pago**: pegar un *link de pago* (se crea gratis desde la app de Mercado Pago → "Link de pago"). Si queda vacío, la página le avisa al cliente que le mandan el link por mensaje.
- **Envíos**: nombres y costos de cada forma de entrega.
- **Descuentos**: porcentaje por transferencia y por efectivo.
- WhatsApp, email y horarios.

> La página no procesa tarjetas por su cuenta: el pago con tarjeta se hace en el sitio de Mercado Pago, que es lo seguro. Para cobrar automáticamente (sin link manual) hace falta un pequeño servidor que cree el pago con la API de Mercado Pago.

## Panel de administración

- Se entra desde `/admin` (no hay links visibles en la tienda).
- Contraseña de prueba: `isec`
- Para cambiarla, generá el hash nuevo y reemplazá `ADMIN_HASH` en `src/config/tienda.js`:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('monotecno:' + process.argv[1]).digest('hex'))" "NUEVA-CONTRASEÑA"
```

- La sesión dura 8 horas y se cierra al cerrar el navegador. Después de 3 intentos fallidos hay que esperar 30 segundos.
- Importante: como la página no tiene servidor, la protección es del lado del navegador y los productos/pedidos se guardan en el navegador de quien los carga. Para varios administradores o pedidos centralizados hace falta un backend.

## Páginas (Vue Router)

| Ruta | Página |
|---|---|
| `/` | Inicio: logo interactivo, categorías, destacados, "cómo revisamos", cotización del dólar |
| `/productos` | Listado / catálogo (acepta `?q=` y `?categoria=` en la URL) |
| `/productos/:id` | Detalle del producto |
| `/carrito` | Carrito |
| `/checkout` | Finalizar compra: datos, entrega y pago |
| `/pedido/:numero` | Pedido confirmado con las instrucciones de pago |
| `/cuenta/registro` · `/cuenta/ingresar` | Crear cuenta e iniciar sesión (clientes) |
| `/cuenta` | Mi cuenta: mis pedidos y mis datos (requiere sesión) |
| `/acerca` | Acerca de / Nosotros, con créditos de las fotos |
| `/admin/login` | Ingreso al panel |
| `/admin` | Panel de administración: productos y pedidos (requiere ingresar) |
| `/admin/productos/nuevo` | Alta de producto |
| `/admin/productos/:id/editar` | Edición de producto |
| cualquier otra | Página 404 |

## Funcionalidades implementadas

| Requisito | Dónde está |
|---|---|
| **Crear** | `/admin/productos/nuevo` → `ProductForm.vue` → `crearProducto()` |
| **Visualizar** | Catálogo, detalle y tabla del panel |
| **Modificar** | `/admin/productos/:id/editar` → `actualizarProducto()` |
| **Eliminar** | Botón Eliminar del panel + `ConfirmModal.vue` → `eliminarProducto()` |
| **Mínimo 15 elementos** | 16 productos iniciales en `data/productosIniciales.js` (las 8 placas son el stock real que publicaba mono.tecno; el resto son ejemplos) |
| **Buscador por texto** | En el encabezado (todas las páginas) y en el catálogo; busca por nombre, marca, categoría, specs o SKU, sin importar tildes |
| **Filtro por categoría** | `SearchBar.vue`. Además: filtro por condición (nuevo/usado/reacondicionado) y "solo con stock" |
| **Ordenamiento** | Más recientes (fecha), precio ascendente/descendente, nombre A-Z / Z-A |
| **Formularios con v-model** | Registro e inicio de sesión de clientes, Mi cuenta, alta/edición de producto, checkout (datos, entrega y pago) e ingreso al panel |
| **Validaciones personalizadas** | Obligatorios; longitud mínima (nombre, apellido, calle, localidad, descripción); formatos: email, DNI de 7 u 8 números, teléfono de 8 a 13 números, código postal (1714 o B1714ABC), SKU `MT-0000`, precio entero, stock entero, link https a imagen, foto JPG/PNG/WEBP de hasta 5 MB; SKU no repetido; efectivo solo con retiro; aceptar condiciones |
| **Mensajes de error visibles** | Debajo de cada campo + resumen al enviar; el foco va al primer campo con error |
| **LocalStorage** | Productos, carrito, pedidos, cuentas de clientes (contraseña guardada como hash SHA-256 con sal), datos del cliente para la próxima compra y caché de la cotización (30 min). La sesión del admin va en sessionStorage |
| **Consumo de API con Fetch** | `services/dolarService.js` → `DolarWidget.vue` (Inicio) y precio aproximado en USD en tarjetas, detalle y carrito |
| **Responsive** | Mobile-first; 2 productos por fila en celular; probado en 390 px, 768 px y 1366 px |
| **Transición Vue** | Cambio de página (`App.vue`), modal, aviso (toast), contador del carrito, pestañas del panel, campo de dirección |
| **transition-group** | Grilla del catálogo al filtrar/ordenar, destacados, filas del carrito, tabla del panel, cotizaciones |

### Componentes reutilizables (13)

| Componente | Props | Emits |
|---|---|---|
| `NavBar` | — | — |
| `AppFooter` | — | — |
| `ProductCard` | `producto`, `dolar` | `agregar` |
| `SearchBar` | `busqueda`, `categoria`, `condicion`, `orden`, `soloStock`, `categorias`, `condiciones` | `update:*` (v-model múltiple) |
| `ProductForm` | `productoInicial`, `modo`, `errorGeneral` | `guardar`, `cancelar` |
| `ConfirmModal` | `visible`, `titulo`, `mensaje`, `textoConfirmar` | `confirmar`, `cancelar` |
| `QuantityStepper` | `modelValue`, `min`, `max`, `etiqueta` | `update:modelValue` (v-model) |
| `DolarWidget` | — | `cotizacion` |
| `ToastMessage` | `visible`, `mensaje`, `tipo`, `accion` | `cerrar` |
| `CategoryIcon` | `categoria`, `tamano` | — |
| `MediosDePago` | `compacto` | — |
| `BottomNav` | — | — (barra inferior estilo app en celular) |
| `LogoParticles` | `src`, `descripcion`, `color`, `separacion`, `radioInfluencia` | — |

Además, las vistas emiten `notificar` hacia `App.vue`, que muestra el aviso.

### Computed properties (algunas)

- `ProductsView`: `productosFiltrados` (filtra + ordena), `hayFiltros`, `textoResultados`
- `CartView`: `items`, `unidades`, `total`, `totalUsd`, `mensajePedido`
- `AdminView`: `filtrados`, `sinStock`, `valorStock`
- `ProductForm`: `cantidadErrores`, `hayErrores`, `vistaPrevia`
- `NavBar`: `cantidad` (contador del carrito)

### Hooks del ciclo de vida

- `created()`: carga de productos desde LocalStorage (Inicio, Catálogo, Detalle, Panel, Alta/Edición), precarga del formulario en edición, pedido a la API en `DolarWidget`.
- `mounted()`: pedido de la cotización en Catálogo, Detalle y Carrito; `LogoParticles` lee los píxeles del logo y arma la grilla de puntitos en el `<canvas>`.
- `beforeUnmount()`: limpieza del temporizador del aviso (`App.vue`) y de la animación del logo (`LogoParticles`).

## Flujo de datos

```
LocalStorage ⇄ productosService.js ⇄ Vistas (created) ──props──▶ Componentes
                    ▲                       ▲                        │
                    │                       └──────── emits ─────────┘
              carrito.js (reactive) ◀── ProductCard / Detalle / Carrito
                    │
                    └──▶ NavBar (contador)

DolarAPI ──fetch──▶ dolarService.js (caché 30 min) ──▶ DolarWidget / vistas ──▶ precio ≈ USD
```

1. Las vistas leen y escriben productos solo a través de `productosService.js`.
2. El carrito es un objeto `reactive` compartido (`services/carrito.js`): cuando una tarjeta agrega un producto, el contador del encabezado se actualiza solo.
3. Los componentes avisan acciones con **emits** (ej: `ProductCard` emite `agregar`; la vista lo suma al carrito y emite `notificar` para mostrar el aviso).
4. Al confirmar un pedido se descuenta el stock y el pedido aparece en el panel de administración.
5. Si la API del dólar no responde, la tienda sigue funcionando con los precios en pesos.

## Estructura del proyecto

```
mono-tecno/
├── public/              index.html, favicon
├── src/
│   ├── assets/          logos, fotos de productos (productos/*.webp) y estilos globales
│   ├── components/      13 componentes reutilizables
│   ├── data/            productos iniciales, categorías y créditos de fotos
│   ├── router/          rutas (Vue Router)
│   ├── config/          datos de la tienda: envíos, medios de pago, contraseña del panel
│   ├── services/        productosService (LocalStorage), carrito, cuentas, precios, auth, imagenes, dolarService (Fetch)
│   ├── views/           Inicio, Catálogo, Detalle, Carrito, Checkout, Pedido, Cuenta (ingresar/registro), Mi cuenta, Acerca de, Login admin, Admin, Alta/Edición, 404
│   ├── App.vue
│   └── main.js
├── docs/capturas/       capturas de pantalla
├── vercel.json
├── vue.config.js
└── package.json
```

## Capturas de pantalla

| Inicio | Catálogo | Catálogo (celular) |
|---|---|---|
| ![Inicio](docs/capturas/inicio.png) | ![Catálogo](docs/capturas/catalogo.png) | ![Catálogo celular](docs/capturas/catalogo-mobile.png) |

| Checkout | Pedido confirmado | Ingreso al panel |
|---|---|---|
| ![Checkout](docs/capturas/checkout.png) | ![Pedido](docs/capturas/pedido.png) | ![Login](docs/capturas/login.png) |

| Panel de administración | Alta de producto | Panel (celular) |
|---|---|---|
| ![Admin](docs/capturas/admin.png) | ![Alta](docs/capturas/admin-alta.png) | ![Admin mobile](docs/capturas/admin-mobile.png) |

## Notas

- **Fotos**: todas en 1200×900, sobre fondo blanco. La RTX 3060 usa la foto original de mono.tecno; las demás son de Wikimedia Commons con licencias libres, con el fondo quitado (créditos en `CREDITOS.md`). Algunas son ilustrativas de un modelo parecido.
- **Precios**: los de las placas de video son los que publicaba mono.tecno; los del resto de los productos son de ejemplo.
- Para volver al catálogo inicial: Panel → "Restaurar el catálogo inicial".
