import { FICHAS } from './fichas'

// Catálogo inicial (16 productos). Se carga en LocalStorage la primera vez.
// Las 8 placas de video son el stock real que publicaba mono.tecno; el resto son productos de ejemplo.
// Precios en pesos argentinos (ARS).

export const CATEGORIAS = [
  'Placas de video',
  'Procesadores',
  'Memorias RAM',
  'Almacenamiento',
  'Fuentes',
  'Refrigeración',
  'Motherboards',
  'Gabinetes'
]

export const CONDICIONES = ['Nuevo', 'Usado', 'Reacondicionado']

// Las fotos incluidas en el proyecto se guardan como "asset:<nombre>" y se resuelven en services/imagenes.js
const base = [
  { id: 'p01', sku: 'MT-0001', nombre: 'NVIDIA GeForce RTX 3060 12GB', marca: 'NVIDIA', categoria: 'Placas de video', condicion: 'Usado', precio: 320000, stock: 2, destacado: true, fechaAlta: '2026-10-18', imagen: 'asset:rtx-3060', specs: '12 GB GDDR6 · 192-bit', descripcion: 'Rinde bien en 1080p alto y 1440p medio. Ideal para armar un equipo gamer sin gastar de más.' },
  { id: 'p02', sku: 'MT-0002', nombre: 'NVIDIA GeForce RTX 3070 8GB', marca: 'NVIDIA', categoria: 'Placas de video', condicion: 'Usado', precio: 450000, stock: 1, destacado: true, fechaAlta: '2026-10-16', imagen: 'asset:rtx-3070', specs: '8 GB GDDR6 · 256-bit', descripcion: 'Mueve 1440p alto sin problemas y entra cómoda en 4K con ajustes medios.' },
  { id: 'p03', sku: 'MT-0003', nombre: 'AMD Radeon RX 6700 XT 12GB', marca: 'AMD', categoria: 'Placas de video', condicion: 'Usado', precio: 330000, stock: 1, destacado: true, fechaAlta: '2026-10-14', imagen: 'asset:rx-6700-xt', specs: '12 GB GDDR6 · 192-bit', descripcion: 'Buena relación precio-rendimiento para 1440p, con memoria de sobra para texturas altas.' },
  { id: 'p04', sku: 'MT-0004', nombre: 'AMD Radeon RX 6600 8GB', marca: 'AMD', categoria: 'Placas de video', condicion: 'Usado', precio: 210000, stock: 1, destacado: false, fechaAlta: '2026-10-12', imagen: 'asset:rx-6600', specs: '8 GB GDDR6 · 128-bit', descripcion: 'Placa de entrada eficiente, pensada para 1080p alto con buen consumo eléctrico.' },
  { id: 'p05', sku: 'MT-0005', nombre: 'NVIDIA GeForce RTX 3060 Ti 8GB', marca: 'NVIDIA', categoria: 'Placas de video', condicion: 'Usado', precio: 380000, stock: 0, destacado: false, fechaAlta: '2026-10-10', imagen: 'asset:rtx-3060-ti', specs: '8 GB GDDR6 · 256-bit', descripcion: 'Un escalón arriba de la 3060 en rendimiento puro, muy pedida para 1440p.' },
  { id: 'p06', sku: 'MT-0006', nombre: 'NVIDIA GeForce GTX 1660 Super 6GB', marca: 'NVIDIA', categoria: 'Placas de video', condicion: 'Usado', precio: 150000, stock: 1, destacado: false, fechaAlta: '2026-10-08', imagen: 'asset:gtx-1660-super', specs: '6 GB GDDR6 · 192-bit', descripcion: 'La opción más accesible del catálogo, sólida para 1080p en la mayoría de los juegos.' },
  { id: 'p07', sku: 'MT-0007', nombre: 'NVIDIA GeForce RTX 3080 10GB', marca: 'NVIDIA', categoria: 'Placas de video', condicion: 'Reacondicionado', precio: 550000, stock: 1, destacado: true, fechaAlta: '2026-10-19', imagen: 'asset:rtx-3080', specs: '10 GB GDDR6X · 320-bit', descripcion: 'La más potente del catálogo. Pasó por reacondicionamiento completo antes de publicarse.' },
  { id: 'p08', sku: 'MT-0008', nombre: 'AMD Radeon RX 6600 XT 8GB', marca: 'AMD', categoria: 'Placas de video', condicion: 'Usado', precio: 245000, stock: 1, destacado: false, fechaAlta: '2026-10-06', imagen: 'asset:rx-6600-xt', specs: '8 GB GDDR6 · 128-bit', descripcion: 'Un paso arriba de la 6600, buen rendimiento en 1080p con margen para 1440p bajo.' },
  { id: 'p09', sku: 'MT-0009', nombre: 'AMD Ryzen 5 5600X', marca: 'AMD', categoria: 'Procesadores', condicion: 'Usado', precio: 140000, stock: 2, destacado: false, fechaAlta: '2026-10-04', imagen: 'asset:ryzen-5-5600x', specs: '6 núcleos / 12 hilos · AM4', descripcion: 'Procesador de 6 núcleos para socket AM4. Ideal para actualizar un equipo sin cambiar la motherboard.' },
  { id: 'p10', sku: 'MT-0010', nombre: 'AMD Ryzen 5 7600', marca: 'AMD', categoria: 'Procesadores', condicion: 'Nuevo', precio: 290000, stock: 3, destacado: true, fechaAlta: '2026-10-17', imagen: 'asset:ryzen-5-7600', specs: '6 núcleos / 12 hilos · AM5 · DDR5', descripcion: 'Procesador de 6 núcleos para socket AM5 con gráficos integrados. Base sólida para un equipo nuevo.' },
  { id: 'p11', sku: 'MT-0011', nombre: 'Intel Core i5-12400F', marca: 'Intel', categoria: 'Procesadores', condicion: 'Nuevo', precio: 185000, stock: 2, destacado: false, fechaAlta: '2026-10-02', imagen: 'asset:core-i5', specs: '6 núcleos / 12 hilos · LGA1700', descripcion: 'Procesador de 6 núcleos para socket LGA1700. Requiere placa de video dedicada.' },
  { id: 'p12', sku: 'MT-0012', nombre: 'G.Skill Ripjaws V 16GB (2x8) DDR4 3200', marca: 'G.Skill', categoria: 'Memorias RAM', condicion: 'Usado', precio: 45000, stock: 3, destacado: false, fechaAlta: '2026-09-30', imagen: 'asset:ddr4-ripjaws', specs: '16 GB · DDR4 · 3200 MHz · dual channel', descripcion: 'Kit de dos módulos de 8 GB con disipador. Probado con memtest antes de publicarse.' },
  { id: 'p13', sku: 'MT-0013', nombre: 'Corsair Vengeance RGB 32GB (2x16) DDR5 6000', marca: 'Corsair', categoria: 'Memorias RAM', condicion: 'Nuevo', precio: 160000, stock: 2, destacado: false, fechaAlta: '2026-09-28', imagen: 'asset:ddr5-vengeance', specs: '32 GB · DDR5 · 6000 MT/s · CL36 · blanca', descripcion: 'Kit de memoria DDR5 de 32 GB en dual channel, en color blanco, para plataformas AM5 e Intel de 12ª gen en adelante.' },
  { id: 'p14', sku: 'MT-0014', nombre: 'Samsung 980 PRO 1TB NVMe', marca: 'Samsung', categoria: 'Almacenamiento', condicion: 'Nuevo', precio: 135000, stock: 4, destacado: false, fechaAlta: '2026-09-26', imagen: 'asset:ssd-980-pro', specs: '1 TB · M.2 PCIe 4.0 · hasta 7000 MB/s', descripcion: 'Disco sólido M.2 de alta velocidad. Los juegos y el sistema cargan en segundos.' },
  { id: 'p15', sku: 'MT-0015', nombre: 'be quiet! Straight Power 12 1200W', marca: 'be quiet!', categoria: 'Fuentes', condicion: 'Nuevo', precio: 310000, stock: 1, destacado: false, fechaAlta: '2026-09-24', imagen: 'asset:fuente-modular', specs: '1200 W · 80 Plus Platinum · full modular', descripcion: 'Fuente silenciosa y full modular, con cables desmontables para un armado prolijo. Alcanza de sobra para cualquier placa del catálogo.' },
  { id: 'p16', sku: 'MT-0016', nombre: 'Cooler Master Hyper 212 EVO', marca: 'Cooler Master', categoria: 'Refrigeración', condicion: 'Nuevo', precio: 45000, stock: 5, destacado: false, fechaAlta: '2026-09-22', imagen: 'asset:cooler-hyper-212', specs: 'Torre · 4 heatpipes · ventilador 120 mm', descripcion: 'Disipador por aire clásico y silencioso. Baja varios grados respecto del cooler que viene con el procesador.' }
]

// Cada producto suma su ficha técnica y para qué uso es ideal.
export const productosIniciales = base.map((p) => ({ ...p, ficha: FICHAS[p.id] ? FICHAS[p.id].ficha : [], ideal: FICHAS[p.id] ? FICHAS[p.id].ideal : [] }))
