-- Spoonacular -> internal recipe import mapping (per user)
-- Run this in the Supabase SQL editor after `add_spoonacular_snapshot_tables.sql`.

create table if not exists public.external_recipe_imports (
  user_id uuid not null,
  external_source text not null,
  external_id text not null,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, external_source, external_id)
);

alter table public.external_recipe_imports enable row level security;

drop policy if exists "external_recipe_imports_select_own" on public.external_recipe_imports;
create policy "external_recipe_imports_select_own"
  on public.external_recipe_imports
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "external_recipe_imports_insert_own" on public.external_recipe_imports;
create policy "external_recipe_imports_insert_own"
  on public.external_recipe_imports
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "external_recipe_imports_delete_own" on public.external_recipe_imports;
create policy "external_recipe_imports_delete_own"
  on public.external_recipe_imports
  for delete
  to authenticated
  using (user_id = auth.uid());

