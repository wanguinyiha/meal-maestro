-- Spoonacular snapshot integration (persist-a-snapshot)
-- Run this in the Supabase SQL editor.

-- External recipe snapshots (Spoonacular and future providers)
create table if not exists public.external_recipes (
  id uuid primary key default gen_random_uuid(),
  external_source text not null,
  external_id text not null,
  title text not null,
  image_url text,
  raw_json jsonb not null,
  last_fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists external_recipes_source_id_unique
  on public.external_recipes (external_source, external_id);

-- User favorites for external recipes
create table if not exists public.user_external_favorites (
  user_id uuid not null,
  external_recipe_id uuid not null references public.external_recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, external_recipe_id)
);

-- Enable RLS
alter table public.external_recipes enable row level security;
alter table public.user_external_favorites enable row level security;

-- Policies
-- Anyone logged in can read snapshots that exist (favorites page needs this).
drop policy if exists "external_recipes_select_authenticated" on public.external_recipes;
create policy "external_recipes_select_authenticated"
  on public.external_recipes
  for select
  to authenticated
  using (true);

-- Any logged in user can upsert snapshots (we only ever write Spoonacular data).
drop policy if exists "external_recipes_insert_authenticated" on public.external_recipes;
create policy "external_recipes_insert_authenticated"
  on public.external_recipes
  for insert
  to authenticated
  with check (true);

drop policy if exists "external_recipes_update_authenticated" on public.external_recipes;
create policy "external_recipes_update_authenticated"
  on public.external_recipes
  for update
  to authenticated
  using (true)
  with check (true);

-- Users can manage their own external favorites
drop policy if exists "user_external_favorites_select_own" on public.user_external_favorites;
create policy "user_external_favorites_select_own"
  on public.user_external_favorites
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_external_favorites_insert_own" on public.user_external_favorites;
create policy "user_external_favorites_insert_own"
  on public.user_external_favorites
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_external_favorites_delete_own" on public.user_external_favorites;
create policy "user_external_favorites_delete_own"
  on public.user_external_favorites
  for delete
  to authenticated
  using (user_id = auth.uid());

