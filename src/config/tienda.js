// =====================================================================
// Datos de la tienda. Todo lo que está entre [CORCHETES] lo tiene que
// completar el dueño antes de publicar la página.
// =====================================================================

export const TIENDA = {
  nombre: 'mono.tecno',
  instagram: 'mono.tecno',
  whatsapp: '[NUMERO DE WHATSAPP]', // ej: 5491123456789 (con código de país, sin + ni espacios)
  email: '[EMAIL DE CONTACTO]',
  zona: 'Ituzaingó, Buenos Aires',
  horarios: 'Lunes a sábado de 10 a 20 h',

  // Formas de entrega y su costo en pesos
  envios: [
    { id: 'retiro', nombre: 'Retiro en Ituzaingó', detalle: 'Coordinamos día y horario por mensaje.', costo: 0 },
    { id: 'moto', nombre: 'Envío en moto (zona oeste y CABA)', detalle: 'Llega en 24 a 48 h hábiles.', costo: 7000 },
    { id: 'correo', nombre: 'Envío por correo a todo el país', detalle: 'Llega en 3 a 6 días hábiles. Te pasamos el código de seguimiento.', costo: 12000 }
  ],

  // Medios de pago
  pagos: {
    mercadoPago: {
      // Link de pago de Mercado Pago (se crea gratis desde la app de Mercado Pago → "Link de pago").
      // Si queda vacío, la página le avisa al cliente que le mandan el link por mensaje.
      link: ''
    },
    transferencia: {
      descuento: 0.05, // 5 % de descuento pagando por transferencia
      alias: '[ALIAS]',
      cbu: '[CBU / CVU]',
      titular: '[NOMBRE DEL TITULAR]',
      banco: '[BANCO O BILLETERA]'
    },
    efectivo: {
      descuento: 0.05 // 5 % de descuento en efectivo (solo retirando en persona)
    }
  },

  garantia: 'Placas usadas: 3 meses de garantía de mono.tecno. Productos nuevos: garantía oficial del fabricante.'
}

// Huella de la contraseña del panel: SHA-256 de la clave PBKDF2-SHA256 (210.000 vueltas, sal "monotecno-admin").
// La clave PBKDF2 solo se obtiene sabiendo la contraseña; acá se publica solo su huella.
// Para cambiar la contraseña, ver la sección "Panel de administración" del README.
export const ADMIN_HASH = '33415c48e8812d065820050035541383e92f1be1a2f35c1b08a1b5d4264f9b36'

// Ingreso con Google: pegá acá el "ID de cliente" de Google Cloud (o definilo como VUE_APP_GOOGLE_CLIENT_ID en Vercel).
// Si queda vacío, el botón "Continuar con Google" avisa que falta configurarlo. Ver README.
export const GOOGLE_CLIENT_ID = process.env.VUE_APP_GOOGLE_CLIENT_ID || ''

// Cuenta del dueño de la tienda: viene creada de fábrica en todos los navegadores.
// La contraseña no está escrita: solo su hash PBKDF2 con sal (igual que cualquier cuenta).
// Con esta cuenta, "Mi cuenta" muestra además el acceso al panel de administración.
export const CUENTA_DUENIO = {
  email: 'ramirounrein1@gmail.com',
  nombre: 'Ramiro',
  apellido: 'Unrein',
  sal: '910bf0b2c63c9b0434bd1c13256e87ef',
  hash: '2e251624b58cdb32b3412acab76843b81d1aaa864fe075f8fc1115069865393e'
}
