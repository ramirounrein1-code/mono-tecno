// Reglas contra compras que acaparan el stock (las mismas se aplican en la base de datos de Supabase).
export const LIMITES_PEDIDO = {
  porProducto: 2, // unidades máximas del mismo producto en un pedido
  porPedido: 6, // unidades máximas en total en un pedido
  pendientesPorEmail: 2, // pedidos sin pagar a la vez con el mismo email
  horasReserva: 48 // horas que se guarda el stock de un pedido sin pagar
}
