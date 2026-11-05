-- mono.tecno · Usuarios con Supabase Auth
-- Correr DESPUÉS de esquema.sql (SQL Editor → Run). Se puede volver a correr sin romper nada.
--
-- Qué agrega:
--   1. public.perfiles: un perfil por cada usuario de Supabase Auth (nombre, apellido, teléfono, foto).
--      Se crea solo cuando alguien entra por primera vez con Google.
--   2. public.pedidos.user_id: cada pedido queda unido al usuario que lo hizo (si estaba logueado).
--   3. public.mis_pedidos(): el usuario logueado ve sus pedidos desde cualquier dispositivo.
-- Seguridad: cada usuario solo puede leer y editar SU perfil y ver SUS pedidos (RLS + auth.uid()).

-- ---------- 1. Perfiles ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nombre text not null default '',
  apellido text not null default '',
  telefono text not null default '',
  foto text not null default '',
  creado timestamptz not null default now()
);

alter table public.perfiles enable row level security;
drop policy if exists "ver mi perfil" on public.perfiles;
create policy "ver mi perfil" on public.perfiles for select to authenticated using (id = auth.uid());
drop policy if exists "editar mi perfil" on public.perfiles;
create policy "editar mi perfil" on public.perfiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

revoke all on public.perfiles from anon, authenticated;
grant select on public.perfiles to authenticated;
grant update (nombre, apellido, telefono) on public.perfiles to authenticated;

-- Crea el perfil automáticamente con los datos que manda Google.
create or replace function privado.nuevo_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  completo text := coalesce(m->>'full_name', m->>'name', '');
begin
  insert into public.perfiles (id, email, nombre, apellido, foto)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    left(coalesce(nullif(m->>'given_name', ''), split_part(completo, ' ', 1)), 40),
    left(coalesce(nullif(m->>'family_name', ''), nullif(substr(completo, length(split_part(completo, ' ', 1)) + 2), ''), ''), 40),
    case when coalesce(m->>'avatar_url', '') like 'https://%' then m->>'avatar_url' else '' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function privado.nuevo_perfil();

-- Usuarios que ya existían antes de correr este archivo
insert into public.perfiles (id, email)
select id, lower(coalesce(email, '')) from auth.users
on conflict (id) do nothing;

-- ---------- 2. Pedidos unidos al usuario ----------
alter table public.pedidos add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists pedidos_user on public.pedidos (user_id);

-- Si el pedido se hace con la sesión iniciada, se guarda quién lo hizo (auth.uid() sale del token).
create or replace function privado.pedido_con_usuario() returns trigger
language plpgsql as $$
begin
  new.user_id := coalesce(new.user_id, auth.uid());
  return new;
end $$;

drop trigger if exists pedido_usuario on public.pedidos;
create trigger pedido_usuario before insert on public.pedidos
  for each row execute function privado.pedido_con_usuario();

-- ---------- 3. Mis pedidos ----------
create or replace function public.mis_pedidos() returns jsonb
language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(p) - 'ip' - 'user_id' order by p.numero desc), '[]'::jsonb)
  from pedidos p
  where auth.uid() is not null and p.user_id = auth.uid()
$$;

revoke execute on function public.mis_pedidos() from public, anon;
grant execute on function public.mis_pedidos() to authenticated;

select 'usuarios listos' as resultado,
  (select count(*) from public.perfiles) as perfiles,
  (select count(*) from information_schema.columns where table_name = 'pedidos' and column_name = 'user_id') as columna_user_id;
