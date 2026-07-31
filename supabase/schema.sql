-- Misma tabla que usa el botón "Generar carta digital" de la app de MindChef,
-- en el proyecto Supabase dedicado a esta POC (uwcigrwoemdrcrsugqdm).
-- (amplify-template/supabase/digital_menus.sql es la copia canónica — mantén
-- ambas en sync si cambias algo aquí).
create extension if not exists "pgcrypto";

create table if not exists public.digital_menus (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  business_name text not null,
  menu_title text not null default 'Carta',
  design jsonb not null default '{}'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lectura pública (sin login): el objetivo es que cualquiera con el enlace
-- pueda ver la carta digital.
alter table public.digital_menus enable row level security;

create policy "digital_menus_public_read"
  on public.digital_menus for select
  using (true);

-- Escritura pública: la app de MindChef siempre filtra por su propio slug
-- (el sub de Cognito de la sesión activa). No es una barrera a nivel de
-- base de datos contra un ataque directo a la API — ver el README.
create policy "digital_menus_public_insert"
  on public.digital_menus for insert
  with check (true);

create policy "digital_menus_public_update"
  on public.digital_menus for update
  using (true)
  with check (true);
