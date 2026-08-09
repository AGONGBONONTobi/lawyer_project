-- Pages légales éditables depuis le back office.
--
-- À exécuter dans le SQL Editor du projet Supabase, après domaines_schema.sql.
--
-- Ce script ne crée que la structure : le contenu initial s'importe d'un clic
-- depuis le back office (bouton « Importer le contenu actuel »). Dupliquer ici
-- le texte des deux pages garantirait qu'il finisse par diverger de celui livré
-- dans src/lib/pagesLegales.js.

create table if not exists public.pages_legales (
  slug        text primary key,
  titre       text not null,
  maj         text not null default '',
  sections    jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

comment on table public.pages_legales is
  'Mentions légales et politique de confidentialité. Une ligne par page, identifiée par le slug de sa route.';
comment on column public.pages_legales.sections is
  'Tableau ordonné de { titre, corps }. `corps` est du texte, pas du HTML : il est rendu par TexteRiche côté site.';
comment on column public.pages_legales.maj is
  'Libellé de dernière mise à jour affiché en haut de page (ex. « 2026 »).';

-- `sections` doit rester un tableau : le site itère dessus sans vérifier.
alter table public.pages_legales
  drop constraint if exists pages_legales_sections_tableau;
alter table public.pages_legales
  add constraint pages_legales_sections_tableau
  check (jsonb_typeof(sections) = 'array');

drop trigger if exists pages_legales_touch_updated_at on public.pages_legales;
create trigger pages_legales_touch_updated_at
  before update on public.pages_legales
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- RLS

alter table public.pages_legales enable row level security;

-- Lecture publique : ces pages doivent être accessibles à tout visiteur.
drop policy if exists "pages_legales_select_public" on public.pages_legales;
create policy "pages_legales_select_public"
  on public.pages_legales for select
  using (true);

drop policy if exists "pages_legales_insert_auth" on public.pages_legales;
create policy "pages_legales_insert_auth"
  on public.pages_legales for insert
  to authenticated with check (true);

drop policy if exists "pages_legales_update_auth" on public.pages_legales;
create policy "pages_legales_update_auth"
  on public.pages_legales for update
  to authenticated using (true) with check (true);

-- Pas de politique DELETE : ces deux pages sont obligatoires, elles se
-- modifient mais ne se suppriment pas.
