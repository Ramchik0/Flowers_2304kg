-- Выполните один раз в Supabase: SQL Editor → New query → вставить → Run.
-- Перед запуском замените owner@example.com на почту мастера.

-- 1. Кто может редактировать сайт
create table if not exists admins (email text primary key);
insert into admins (email) values ('owner@example.com') on conflict do nothing;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where email = auth.jwt() ->> 'email');
$$;

alter table admins enable row level security; -- без политик: таблица закрыта для всех через API

-- 2. Каталог
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  category text not null,
  description text,
  image text,
  image_path text,
  color text default '#E2392B',
  shape text default 'rose',
  is_new boolean not null default false,
  sort int not null default 0
);

alter table products enable row level security;

drop policy if exists "Каталог виден всем" on products;
create policy "Каталог виден всем" on products for select using (true);

drop policy if exists "Мастер редактирует" on products;
create policy "Мастер редактирует" on products for all to authenticated
  using (is_admin()) with check (is_admin());

-- 3. Хранилище фото (публичное чтение, запись только мастеру)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "Мастер загружает фото" on storage.objects;
create policy "Мастер загружает фото" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and is_admin());

drop policy if exists "Мастер удаляет фото" on storage.objects;
create policy "Мастер удаляет фото" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and is_admin());
