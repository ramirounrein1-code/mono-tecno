// Ficha técnica y uso recomendado de cada producto del catálogo inicial.
// Datos de referencia del fabricante (pueden variar levemente según la marca/modelo de la placa).

export const FICHAS = {
  // ---------------- Placas de video ----------------
  p01: {
    ficha: [
      ['Chip gráfico', 'NVIDIA GA106 (Ampere)'],
      ['Núcleos CUDA', '3584'],
      ['Frecuencia boost', '1777 MHz'],
      ['Memoria', '12 GB GDDR6'],
      ['Bus / ancho de banda', '192-bit · 360 GB/s'],
      ['Interfaz', 'PCIe 4.0 x16'],
      ['Consumo (TGP)', '170 W'],
      ['Fuente recomendada', '550 W'],
      ['Salidas de video', '3× DisplayPort 1.4a, 1× HDMI 2.1'],
      ['Tecnologías', 'Ray tracing, DLSS, NVIDIA Reflex, NVENC']
    ],
    ideal: ['Gaming en 1080p con calidad alta', '1440p con calidad media', 'Edición de video y streaming (NVENC)']
  },
  p02: {
    ficha: [
      ['Chip gráfico', 'NVIDIA GA104 (Ampere)'],
      ['Núcleos CUDA', '5888'],
      ['Frecuencia boost', '1725 MHz'],
      ['Memoria', '8 GB GDDR6'],
      ['Bus / ancho de banda', '256-bit · 448 GB/s'],
      ['Interfaz', 'PCIe 4.0 x16'],
      ['Consumo (TGP)', '220 W'],
      ['Fuente recomendada', '650 W'],
      ['Salidas de video', '3× DisplayPort 1.4a, 1× HDMI 2.1'],
      ['Tecnologías', 'Ray tracing, DLSS, NVIDIA Reflex, NVENC']
    ],
    ideal: ['Gaming en 1440p con calidad alta', '4K con ajustes medios', 'Juegos competitivos a muchos FPS']
  },
  p03: {
    ficha: [
      ['Chip gráfico', 'AMD Navi 22 (RDNA 2)'],
      ['Procesadores de flujo', '2560 (40 unidades de cómputo)'],
      ['Frecuencia boost', 'Hasta 2581 MHz'],
      ['Memoria', '12 GB GDDR6'],
      ['Bus / ancho de banda', '192-bit · 384 GB/s'],
      ['Infinity Cache', '96 MB'],
      ['Interfaz', 'PCIe 4.0 x16'],
      ['Consumo (TBP)', '230 W'],
      ['Fuente recomendada', '650 W'],
      ['Tecnologías', 'Ray tracing, FSR, Radeon Anti-Lag']
    ],
    ideal: ['Gaming en 1440p con calidad alta', 'Juegos con texturas pesadas (12 GB)', 'Muy buena relación precio/rendimiento']
  },
  p04: {
    ficha: [
      ['Chip gráfico', 'AMD Navi 23 (RDNA 2)'],
      ['Procesadores de flujo', '1792 (28 unidades de cómputo)'],
      ['Frecuencia boost', 'Hasta 2491 MHz'],
      ['Memoria', '8 GB GDDR6'],
      ['Bus / ancho de banda', '128-bit · 224 GB/s'],
      ['Infinity Cache', '32 MB'],
      ['Interfaz', 'PCIe 4.0 x8'],
      ['Consumo (TBP)', '132 W'],
      ['Fuente recomendada', '450 W'],
      ['Tecnologías', 'Ray tracing, FSR, Radeon Anti-Lag']
    ],
    ideal: ['Gaming en 1080p con calidad alta', 'Equipos con fuentes chicas (bajo consumo)', 'Primera PC gamer']
  },
  p05: {
    ficha: [
      ['Chip gráfico', 'NVIDIA GA104 (Ampere)'],
      ['Núcleos CUDA', '4864'],
      ['Frecuencia boost', '1665 MHz'],
      ['Memoria', '8 GB GDDR6'],
      ['Bus / ancho de banda', '256-bit · 448 GB/s'],
      ['Interfaz', 'PCIe 4.0 x16'],
      ['Consumo (TGP)', '200 W'],
      ['Fuente recomendada', '600 W'],
      ['Salidas de video', '3× DisplayPort 1.4a, 1× HDMI 2.1'],
      ['Tecnologías', 'Ray tracing, DLSS, NVIDIA Reflex, NVENC']
    ],
    ideal: ['Gaming en 1440p', '1080p a alta tasa de refresco', 'Streaming con NVENC']
  },
  p06: {
    ficha: [
      ['Chip gráfico', 'NVIDIA TU116 (Turing)'],
      ['Núcleos CUDA', '1408'],
      ['Frecuencia boost', '1785 MHz'],
      ['Memoria', '6 GB GDDR6'],
      ['Bus / ancho de banda', '192-bit · 336 GB/s'],
      ['Interfaz', 'PCIe 3.0 x16'],
      ['Consumo (TDP)', '125 W'],
      ['Fuente recomendada', '450 W'],
      ['Tecnologías', 'NVENC (Turing), NVIDIA Reflex · sin ray tracing ni DLSS']
    ],
    ideal: ['Gaming en 1080p (calidad media/alta)', 'Juegos competitivos: Valorant, CS2, Fortnite', 'Actualizar una PC de oficina']
  },
  p07: {
    ficha: [
      ['Chip gráfico', 'NVIDIA GA102 (Ampere)'],
      ['Núcleos CUDA', '8704'],
      ['Frecuencia boost', '1710 MHz'],
      ['Memoria', '10 GB GDDR6X'],
      ['Bus / ancho de banda', '320-bit · 760 GB/s'],
      ['Interfaz', 'PCIe 4.0 x16'],
      ['Consumo (TGP)', '320 W'],
      ['Fuente recomendada', '750 W'],
      ['Salidas de video', '3× DisplayPort 1.4a, 1× HDMI 2.1'],
      ['Tecnologías', 'Ray tracing, DLSS, NVIDIA Reflex, NVENC']
    ],
    ideal: ['Gaming en 4K', '1440p a alta tasa de refresco', 'Render 3D e IA (CUDA)']
  },
  p08: {
    ficha: [
      ['Chip gráfico', 'AMD Navi 23 (RDNA 2)'],
      ['Procesadores de flujo', '2048 (32 unidades de cómputo)'],
      ['Frecuencia boost', 'Hasta 2589 MHz'],
      ['Memoria', '8 GB GDDR6'],
      ['Bus / ancho de banda', '128-bit · 256 GB/s'],
      ['Infinity Cache', '32 MB'],
      ['Interfaz', 'PCIe 4.0 x8'],
      ['Consumo (TBP)', '160 W'],
      ['Fuente recomendada', '500 W'],
      ['Tecnologías', 'Ray tracing, FSR, Radeon Anti-Lag']
    ],
    ideal: ['Gaming en 1080p a alta tasa de refresco', '1440p con calidad media', 'Buen consumo y temperaturas']
  },

  // ---------------- Procesadores ----------------
  p09: {
    ficha: [
      ['Núcleos / hilos', '6 / 12'],
      ['Frecuencia base / turbo', '3,7 GHz / 4,6 GHz'],
      ['Caché L3', '32 MB'],
      ['Socket', 'AM4'],
      ['Arquitectura', 'Zen 3 · 7 nm'],
      ['TDP', '65 W'],
      ['Memoria compatible', 'DDR4 hasta 3200 MHz'],
      ['PCI Express', '4.0'],
      ['Gráficos integrados', 'No (requiere placa de video)'],
      ['Chipsets compatibles', 'B450, B550, X470, X570 (con BIOS actualizado)']
    ],
    ideal: ['Actualizar una PC AM4 sin cambiar mother', 'Gaming 1080p/1440p', 'Multitarea y streaming liviano']
  },
  p10: {
    ficha: [
      ['Núcleos / hilos', '6 / 12'],
      ['Frecuencia base / turbo', '3,8 GHz / 5,1 GHz'],
      ['Caché L3', '32 MB'],
      ['Socket', 'AM5'],
      ['Arquitectura', 'Zen 4 · 5 nm'],
      ['TDP', '65 W'],
      ['Memoria compatible', 'DDR5 (5200 MHz oficial, EXPO)'],
      ['PCI Express', '5.0'],
      ['Gráficos integrados', 'Sí, AMD Radeon (2 núcleos)'],
      ['Chipsets compatibles', 'A620, B650, X670, B850, X870']
    ],
    ideal: ['Armar una PC nueva con plataforma actual', 'Gaming en cualquier resolución', 'Usar sin placa de video mientras tanto (iGPU)']
  },
  p11: {
    ficha: [
      ['Núcleos / hilos', '6 / 12 (6 de rendimiento)'],
      ['Frecuencia base / turbo', '2,5 GHz / 4,4 GHz'],
      ['Caché L3', '18 MB'],
      ['Socket', 'LGA1700'],
      ['Arquitectura', 'Alder Lake (12.ª gen) · Intel 7'],
      ['Potencia base / turbo', '65 W / 117 W'],
      ['Memoria compatible', 'DDR4-3200 o DDR5-4800'],
      ['PCI Express', '5.0 y 4.0'],
      ['Gráficos integrados', 'No (la "F" requiere placa de video)'],
      ['Chipsets compatibles', 'H610, B660, B760, H670, Z690, Z790']
    ],
    ideal: ['PC gamer económica', 'Usar memorias DDR4 con plataforma moderna', 'Trabajo de oficina y estudio']
  },

  // ---------------- Memorias ----------------
  p12: {
    ficha: [
      ['Capacidad', '16 GB (2 × 8 GB)'],
      ['Tipo', 'DDR4 DIMM (PC)'],
      ['Velocidad', '3200 MHz'],
      ['Latencia', 'CL16 (16-18-18-38)'],
      ['Voltaje', '1,35 V'],
      ['Perfil', 'Intel XMP 2.0'],
      ['Disipador', 'Aluminio, perfil medio (42 mm)'],
      ['Compatibilidad', 'Motherboards AM4 y Intel con DDR4']
    ],
    ideal: ['Dual channel para gaming', 'Actualizar desde 8 GB', 'Plataformas AM4 / Intel 10.ª a 13.ª gen']
  },
  p13: {
    ficha: [
      ['Capacidad', '32 GB (2 × 16 GB)'],
      ['Tipo', 'DDR5 DIMM (PC)'],
      ['Velocidad', '6000 MT/s'],
      ['Latencia', 'CL36 (36-36-36-76)'],
      ['Voltaje', '1,35 V'],
      ['Perfil', 'Intel XMP 3.0'],
      ['Iluminación', 'RGB (iCUE)'],
      ['Color', 'Blanco'],
      ['Compatibilidad', 'AM5 e Intel 12.ª gen o superior con DDR5']
    ],
    ideal: ['Armados AM5 de alto rendimiento', 'Gaming + streaming + edición', 'Setups blancos']
  },

  // ---------------- Almacenamiento ----------------
  p14: {
    ficha: [
      ['Capacidad', '1 TB'],
      ['Formato', 'M.2 2280'],
      ['Interfaz', 'PCIe 4.0 x4 · NVMe'],
      ['Lectura secuencial', 'Hasta 7000 MB/s'],
      ['Escritura secuencial', 'Hasta 5000 MB/s'],
      ['Memoria', 'Samsung V-NAND 3-bit MLC'],
      ['Caché DRAM', '1 GB LPDDR4'],
      ['Durabilidad (TBW)', '600 TB'],
      ['Garantía del fabricante', '5 años']
    ],
    ideal: ['Disco principal para Windows y juegos', 'Cargas casi instantáneas', 'También compatible con PS5']
  },

  // ---------------- Fuentes ----------------
  p15: {
    ficha: [
      ['Potencia', '1200 W'],
      ['Certificación', '80 Plus Platinum'],
      ['Cableado', 'Full modular'],
      ['Estándar', 'ATX 3.0 · conector 12VHPWR para placas nuevas'],
      ['Ventilador', 'be quiet! Silent Wings de 135 mm'],
      ['Protecciones', 'OCP, OVP, UVP, SCP, OTP, OPP'],
      ['Garantía del fabricante', '10 años']
    ],
    ideal: ['Equipos con placas de gama alta', 'Armados silenciosos', 'Margen para futuras actualizaciones']
  },

  // ---------------- Refrigeración ----------------
  p16: {
    ficha: [
      ['Tipo', 'Disipador por aire de torre'],
      ['Heatpipes', '4 de cobre, contacto directo'],
      ['Ventilador', '120 mm PWM · 600 a 2000 RPM'],
      ['Altura', '159 mm'],
      ['Sockets', 'AM4 / AM5 · Intel LGA1200 / 115x (LGA1700 con kit)'],
      ['Ruido', '9 a 36 dBA']
    ],
    ideal: ['Bajar temperaturas respecto del cooler de caja', 'Procesadores de hasta ~150 W', 'Gabinetes de más de 160 mm de ancho']
  }
}
