-- Domaines d'expertise — table, sécurité et stockage des images.
--
-- À exécuter une fois dans le SQL Editor du projet Supabase.
--
-- Le site public lit cette table avec la clé anon ; le back office écrit avec
-- la session d'un compte authentifié. Il n'y a pas d'inscription publique :
-- le compte du cabinet est créé à la main dans Authentication → Users.

-- ---------------------------------------------------------------- table

create table if not exists public.domaines (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  domain      text not null,
  subtitle    text not null default '',
  points      text[] not null default '{}',
  img         text not null default '',
  position    integer not null default 0,
  visible     boolean not null default true,
  updated_at  timestamptz not null default now()
);

comment on column public.domaines.slug is
  'Identifiant stable utilisé comme clé de rendu côté site. Ne pas réutiliser un slug supprimé.';
comment on column public.domaines.img is
  'URL publique de l''image. Chemin /assets/img/... pour les images livrées avec le site, URL Supabase Storage pour celles téléversées depuis le back office.';
comment on column public.domaines.visible is
  'Faux = le domaine reste éditable dans le back office mais disparaît du site.';

create index if not exists domaines_position_idx on public.domaines (position);

-- `updated_at` tenu par la base : le client ne peut pas l'antidater.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists domaines_touch_updated_at on public.domaines;
create trigger domaines_touch_updated_at
  before update on public.domaines
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- RLS

alter table public.domaines enable row level security;

-- Lecture : tout le monde voit les domaines visibles ; un utilisateur connecté
-- voit aussi les masqués, sans quoi il ne pourrait plus les rouvrir depuis le
-- back office une fois masqués.
drop policy if exists "domaines_select_public" on public.domaines;
create policy "domaines_select_public"
  on public.domaines for select
  using (visible or auth.role() = 'authenticated');

-- Écriture : réservée aux comptes authentifiés.
drop policy if exists "domaines_insert_auth" on public.domaines;
create policy "domaines_insert_auth"
  on public.domaines for insert
  to authenticated with check (true);

drop policy if exists "domaines_update_auth" on public.domaines;
create policy "domaines_update_auth"
  on public.domaines for update
  to authenticated using (true) with check (true);

drop policy if exists "domaines_delete_auth" on public.domaines;
create policy "domaines_delete_auth"
  on public.domaines for delete
  to authenticated using (true);

-- ---------------------------------------------------------------- stockage

-- Bucket public : les images sont affichées sur le site sans signature d'URL.
insert into storage.buckets (id, name, public)
values ('domaines', 'domaines', true)
on conflict (id) do update set public = true;

drop policy if exists "domaines_img_read" on storage.objects;
create policy "domaines_img_read"
  on storage.objects for select
  using (bucket_id = 'domaines');

drop policy if exists "domaines_img_write" on storage.objects;
create policy "domaines_img_write"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'domaines');

drop policy if exists "domaines_img_update" on storage.objects;
create policy "domaines_img_update"
  on storage.objects for update
  to authenticated using (bucket_id = 'domaines');

drop policy if exists "domaines_img_delete" on storage.objects;
create policy "domaines_img_delete"
  on storage.objects for delete
  to authenticated using (bucket_id = 'domaines');

-- ---------------------------------------------------------------- amorce

-- Reprend à l'identique les trois domaines qui étaient codés en dur dans
-- DomainCards.jsx, pour que la bascule vers la base ne change rien à l'écran.
insert into public.domaines (slug, domain, subtitle, points, img, position) values
  (
    'commercial',
    'Droit commercial',
    'Contrats · créances · contentieux',
    array[
      'Rédaction et négociation de contrats commerciaux',
      'Recouvrement de créances et rupture abusive',
      'Contentieux judiciaire et médiation'
    ],
    '/assets/img/droit-commerce.jpg',
    1
  ),
  (
    'famille',
    'Droit de la famille',
    'Divorce · garde · violences conjugales',
    array[
      'Divorce contentieux et à l''amiable',
      'Garde des enfants et pension alimentaire',
      'Protection face aux violences conjugales'
    ],
    '/assets/img/droit-famille.jpg',
    2
  ),
  (
    'etrangers',
    'Droit des étrangers',
    'Visa · naturalisation · OQTF',
    array[
      'Demandes de titre de séjour et renouvellement',
      'Recours contre OQTF et refus de visa',
      'Procédures de naturalisation'
    ],
    '/assets/img/notre-dame.jpg',
    3
  )
on conflict (slug) do nothing;
