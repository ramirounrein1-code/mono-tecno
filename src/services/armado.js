// "Armá tu PC": guarda la selección y revisa la compatibilidad leyendo la ficha técnica de cada producto.
import { reactive } from 'vue'
import { leerJSON, guardarJSON } from './seguridad'

const CLAVE = 'monotecno_armado'

// Cada lugar del armado, la categoría del catálogo que usa y si es obligatorio.
export const LUGARES = [
  { id: 'cpu', titulo: 'Procesador', categoria: 'Procesadores', obligatorio: true },
  { id: 'gpu', titulo: 'Placa de video', categoria: 'Placas de video', obligatorio: false },
  { id: 'ram', titulo: 'Memoria RAM', categoria: 'Memorias RAM', obligatorio: true },
  { id: 'disco', titulo: 'Almacenamiento', categoria: 'Almacenamiento', obligatorio: true },
  { id: 'fuente', titulo: 'Fuente', categoria: 'Fuentes', obligatorio: true },
  { id: 'cooler', titulo: 'Refrigeración', categoria: 'Refrigeración', obligatorio: false }
]

const vacio = () => Object.fromEntries(LUGARES.map((l) => [l.id, null]))

export const armado = reactive({
  sel: { ...vacio(), ...leerJSON(CLAVE, (v) => v && typeof v === 'object' && !Array.isArray(v), {}) }
})

function guardar () { guardarJSON(CLAVE, armado.sel) }

export function elegir (lugar, id) {
  armado.sel[lugar] = armado.sel[lugar] === id ? null : id
  guardar()
}

export function vaciarArmado () {
  armado.sel = vacio()
  guardar()
}

// ---- Lectura de la ficha ----
function dato (p, re) {
  const f = (p && p.ficha || []).find(([d]) => re.test(d))
  return f ? f[1] : ''
}
function watts (texto) {
  const m = String(texto).match(/(\d+)\s*W/)
  return m ? parseInt(m[1], 10) : 0
}

export function infoCpu (p) {
  const memoria = dato(p, /^memoria compatible/i)
  return {
    socket: dato(p, /^socket$/i),
    ddr: ['DDR4', 'DDR5'].filter((t) => memoria.includes(t)),
    // Para Intel se toma la potencia turbo (el segundo número) porque es lo que puede llegar a pedir.
    consumo: Math.max(...(dato(p, /^tdp$|^potencia base/i).match(/\d+/g) || ['65']).map(Number)),
    graficos: /^sí/i.test(dato(p, /^gráficos integrados/i))
  }
}
export function infoGpu (p) {
  return { consumo: watts(dato(p, /^consumo/i)), recomendada: watts(dato(p, /^fuente recomendada/i)) }
}
export function infoRam (p) {
  const t = dato(p, /^tipo$/i)
  return { ddr: t.includes('DDR5') ? 'DDR5' : t.includes('DDR4') ? 'DDR4' : '' }
}
export function infoFuente (p) {
  return { potencia: watts(dato(p, /^potencia$/i)) }
}
export function infoCooler (p) {
  return { sockets: dato(p, /^sockets$/i) }
}

// Watts que necesita el equipo: CPU + GPU + ~75 W del resto, con 40 % de margen, redondeado a 50 W.
export function consumoEstimado (cpu, gpu) {
  const c = cpu ? infoCpu(cpu).consumo : 0
  const g = gpu ? infoGpu(gpu).consumo : 0
  return { carga: c + g + 75, fuente: Math.ceil(((c + g + 75) * 1.4) / 50) * 50 }
}

// ¿El cooler soporta este socket? Devuelve 'si', 'kit' o 'no'.
function coolerSoporta (cooler, socket) {
  const { sockets } = infoCooler(cooler)
  const conKit = /([A-Z0-9]+)\s+con kit/i.exec(sockets)
  if (conKit && conKit[1] === socket) return 'kit'
  const limpio = sockets.replace(/\([^)]*\)/g, '')
  return limpio.includes(socket) ? 'si' : 'no'
}

// Compatibilidad de un candidato con lo que ya está elegido: { estado: 'ok'|'aviso'|'error', motivo }.
export function compatibilidad (lugar, candidato, elegidos) {
  const { cpu, gpu, ram, fuente, cooler } = elegidos
  if (lugar === 'ram' && cpu) {
    const tipo = infoRam(candidato).ddr
    if (!infoCpu(cpu).ddr.includes(tipo)) return { estado: 'error', motivo: `${cpu.nombre} no usa ${tipo}` }
  }
  if (lugar === 'cpu') {
    const i = infoCpu(candidato)
    if (ram && !i.ddr.includes(infoRam(ram).ddr)) return { estado: 'error', motivo: `No usa ${infoRam(ram).ddr}` }
    if (cooler && coolerSoporta(cooler, i.socket) === 'no') return { estado: 'error', motivo: 'El cooler elegido no entra en ' + i.socket }
    if (!i.graficos && !gpu) return { estado: 'aviso', motivo: 'Necesita placa de video' }
  }
  if (lugar === 'cooler' && cpu) {
    const s = infoCpu(cpu).socket
    const r = coolerSoporta(candidato, s)
    if (r === 'no') return { estado: 'error', motivo: 'No entra en ' + s }
    if (r === 'kit') return { estado: 'aviso', motivo: `Para ${s} necesita un kit de montaje` }
  }
  if (lugar === 'fuente') {
    const necesita = Math.max(gpu ? infoGpu(gpu).recomendada : 0, consumoEstimado(cpu, gpu).fuente)
    if (infoFuente(candidato).potencia < necesita) return { estado: 'error', motivo: `Se queda corta: hacen falta ${necesita} W` }
  }
  if (lugar === 'gpu' && fuente) {
    const necesita = Math.max(infoGpu(candidato).recomendada, consumoEstimado(cpu, candidato).fuente)
    if (infoFuente(fuente).potencia < necesita) return { estado: 'error', motivo: `Tu fuente no alcanza (pide ${necesita} W)` }
  }
  return { estado: 'ok', motivo: '' }
}

// Lista de chequeos del armado completo, para el resumen.
export function revisarArmado (e) {
  const r = []
  const { cpu, gpu, ram, disco, fuente, cooler } = e
  if (!cpu) r.push({ estado: 'pendiente', texto: 'Elegí un procesador para empezar.' })
  if (cpu && ram) {
    const ok = infoCpu(cpu).ddr.includes(infoRam(ram).ddr)
    r.push(ok
      ? { estado: 'ok', texto: `Memoria ${infoRam(ram).ddr} compatible con el procesador.` }
      : { estado: 'error', texto: `El procesador usa ${infoCpu(cpu).ddr.join(' o ')} y la memoria es ${infoRam(ram).ddr}.` })
  }
  if (cpu && !infoCpu(cpu).graficos && !gpu) r.push({ estado: 'error', texto: 'Este procesador no tiene gráficos integrados: sin placa de video no hay imagen.' })
  if (fuente) {
    const necesita = Math.max(gpu ? infoGpu(gpu).recomendada : 0, consumoEstimado(cpu, gpu).fuente)
    const tiene = infoFuente(fuente).potencia
    r.push(tiene >= necesita
      ? { estado: 'ok', texto: `La fuente de ${tiene} W alcanza (se recomiendan ${necesita} W).` }
      : { estado: 'error', texto: `La fuente de ${tiene} W se queda corta: se recomiendan ${necesita} W.` })
  }
  if (cpu && cooler) {
    const s = infoCpu(cpu).socket
    const c = coolerSoporta(cooler, s)
    if (c === 'si') r.push({ estado: 'ok', texto: `El cooler es compatible con ${s}.` })
    else if (c === 'kit') r.push({ estado: 'aviso', texto: `El cooler entra en ${s}, pero necesita un kit de montaje aparte.` })
    else r.push({ estado: 'error', texto: `El cooler no es compatible con ${s}.` })
  }
  if (cpu && !disco) r.push({ estado: 'aviso', texto: 'Falta un disco para instalar el sistema.' })
  if (cpu) r.push({ estado: 'info', texto: `Motherboard: no está en el catálogo. Necesitás una ${infoCpu(cpu).socket} compatible con ${ram ? infoRam(ram).ddr : infoCpu(cpu).ddr.join(' o ')}; consultanos y te ayudamos a conseguirla.` })
  return r
}
