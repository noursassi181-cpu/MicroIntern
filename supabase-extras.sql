-- MicroIntern : messages de contact + avis (notes sur les services).
-- À lancer APRÈS supabase-setup.sql et supabase-students.sql. Relançable sans risque.

-- ===== Messages de contact =====
create table if not exists public.contact_messages(
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 5 and 120 and email like '%@%'),
  message text not null check (char_length(message) between 5 and 1000),
  handled boolean not null default false);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant insert (name, email, message) on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant update (handled) on public.contact_messages to authenticated;
drop policy if exists "envoyer message" on public.contact_messages;
create policy "envoyer message" on public.contact_messages for insert to anon, authenticated with check (true);
drop policy if exists "admin lit messages" on public.contact_messages;
create policy "admin lit messages" on public.contact_messages for select to authenticated using (public.is_admin());
drop policy if exists "admin traite messages" on public.contact_messages;
create policy "admin traite messages" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin supprime messages" on public.contact_messages;
create policy "admin supprime messages" on public.contact_messages for delete to authenticated using (public.is_admin());

-- ===== Avis : une note par service et par commande terminée =====
create table if not exists public.reviews(
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (char_length(coalesce(comment,'')) <= 300),
  author text,
  created_at timestamptz not null default now(),
  unique (order_id, product_id));
alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert (order_id, product_id, rating, comment) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;

create or replace function public.set_review_author() returns trigger
language plpgsql security definer set search_path = '' as $$
declare m jsonb;
begin
  select raw_user_meta_data into m from auth.users where id = (select auth.uid());
  new.author := left(coalesce(nullif(trim(m->>'first_name'),''),'Client')
    || coalesce(' ' || left(nullif(trim(m->>'last_name'),''),1) || '.', ''), 40);
  return new;
end $$;
revoke execute on function public.set_review_author() from public, anon, authenticated;
drop trigger if exists reviews_set_author on public.reviews;
create trigger reviews_set_author before insert on public.reviews
  for each row execute function public.set_review_author();

drop policy if exists "voir avis" on public.reviews;
create policy "voir avis" on public.reviews for select to anon, authenticated using (true);
drop policy if exists "noter commande terminee" on public.reviews;
create policy "noter commande terminee" on public.reviews for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid()) and o.status = 'done'
        and o.items @> jsonb_build_array(jsonb_build_object('id', product_id))));
drop policy if exists "admin supprime avis" on public.reviews;
create policy "admin supprime avis" on public.reviews for delete to authenticated using (public.is_admin());

create or replace view public.product_ratings with (security_invoker = on) as
  select product_id, round(avg(rating), 1) as avg_rating, count(*)::int as n
  from public.reviews group by product_id;
grant select on public.product_ratings to anon, authenticated;
