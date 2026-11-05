-- mono.tecno · Comprobantes de pago
-- Correr DESPUÉS de esquema.sql (SQL Editor → Run). Se puede volver a correr sin romper nada.
--
-- El cliente adjunta el comprobante (foto o PDF) desde la página de su pedido.
-- El archivo se guarda en una tabla privada (nadie la puede leer directo): solo el panel lo ve, con la clave.
-- Para subirlo hace falta el número de pedido Y su código secreto (el que recibe solo quien hizo la compra).

alter table public.pedidos add column if not exists comprobante_fecha timestamptz;

create table if not exists privado.comprobantes (
  numero bigint primary key references public.pedidos (numero) on delete cascade,
  tipo text not null,
  nombre text not null default '',
  datos text not null, -- archivo en base64 (máx. ~1 MB)
  fecha timestamptz not null default now()
);

-- El cliente adjunta (o reemplaza) el comprobante de su pedido.
create or replace function public.adjuntar_comprobante(p_numero bigint, p_token text, p_tipo text, p_nombre text, p_datos text)
returns jsonb
language plpgsql security definer set search_path = public, privado as $$
declare v_fecha timestamptz := now();
begin
  if p_tipo is null or p_tipo not in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf') then
    raise exception 'Formato no permitido. Subí una foto (JPG, PNG o WEBP) o un PDF.';
  end if;
  if p_datos is null or length(p_datos) < 100 or length(p_datos) > 1400000 then
    raise exception 'El archivo es demasiado grande. El máximo es 1 MB.';
  end if;
  if p_datos !~ '^[A-Za-z0-9+/]+={0,2}$' then
    raise exception 'El archivo no se pudo leer. Probá con otro.';
  end if;
  if not exists (select 1 from pedidos where numero = p_numero and token::text = p_token and estado <> 'Cancelado') then
    raise exception 'No encontramos ese pedido, o ya está cancelado.';
  end if;

  insert into privado.comprobantes (numero, tipo, nombre, datos, fecha)
  values (p_numero, p_tipo, left(coalesce(p_nombre, ''), 80), p_datos, v_fecha)
  on conflict (numero) do update
    set tipo = excluded.tipo, nombre = excluded.nombre, datos = excluded.datos, fecha = excluded.fecha;

  update pedidos set comprobante_fecha = v_fecha where numero = p_numero;
  return jsonb_build_object('ok', true, 'fecha', v_fecha);
end $$;

-- El panel abre el comprobante de un pedido (pide la clave del panel).
create or replace function public.admin_comprobante(p_clave text, p_numero bigint) returns jsonb
language plpgsql security definer set search_path = public, privado as $$
declare
  v_err text := privado.es_admin(p_clave);
  v_c privado.comprobantes;
begin
  if v_err is not null then return jsonb_build_object('error', v_err); end if;
  select * into v_c from privado.comprobantes where numero = p_numero;
  if not found then return jsonb_build_object('error', 'Ese pedido no tiene comprobante.'); end if;
  return jsonb_build_object('tipo', v_c.tipo, 'nombre', v_c.nombre, 'datos', v_c.datos, 'fecha', v_c.fecha);
end $$;

alter table privado.comprobantes enable row level security;
revoke all on privado.comprobantes from anon, authenticated;
grant execute on function public.adjuntar_comprobante(bigint, text, text, text, text) to anon, authenticated;
grant execute on function public.admin_comprobante(text, bigint) to anon, authenticated;

select 'comprobantes listos' as resultado,
  (select count(*) from information_schema.columns where table_name = 'pedidos' and column_name = 'comprobante_fecha') as columna;
