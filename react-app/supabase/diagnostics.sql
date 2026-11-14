-- Migration : Enregistrement et consultation des diagnostics nationalité
-- Schema cabinet_security (protégé, RLS activé)
--
-- Exécuter ce script dans l'éditeur SQL Supabase (projet de préproduction ou production).
-- Il crée la table cabinet_security.diagnostics et les fonctions sécurisées associées.

begin;

create table if not exists cabinet_security.diagnostics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom text not null,
  email text not null,
  telephone text,
  commentaire text,
  reponses jsonb not null,
  pistes jsonb not null,
  statut text not null default 'nouveau',
  rdv_id uuid references cabinet_security.agenda(id) on delete set null
);

alter table cabinet_security.diagnostics enable row level security;
revoke all on cabinet_security.diagnostics from public, anon, authenticated;

-- Index pour recherche rapide et tri chronologique
create index if not exists idx_diagnostics_created_at on cabinet_security.diagnostics(created_at desc);
create index if not exists idx_diagnostics_email on cabinet_security.diagnostics(email);

-- 1. Fonction publique d'enregistrement (appelée par le formulaire visiteur)
create or replace function public.enregistrer_diagnostic(
  nom_visiteur text,
  courriel text,
  telephone_contact text,
  commentaire_libre text,
  reponses_json jsonb,
  pistes_json jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  nouvel_id uuid;
  creneau_associe uuid;
begin
  -- Validation stricte des données entrantes
  if coalesce(length(trim(nom_visiteur)), 0) not between 1 and 120
     or length(trim(courriel)) > 254
     or coalesce(trim(courriel), '') !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
     or reponses_json is null
     or pistes_json is null then
    raise invalid_parameter_value;
  end if;

  -- Recherche d'un éventuel rendez-vous déjà réservé avec ce courriel
  select a.id into creneau_associe
  from cabinet_security.agenda a
  where lower(a.email) = lower(trim(courriel))
    and lower(a.periode) >= now()
  order by lower(a.periode) asc
  limit 1;

  insert into cabinet_security.diagnostics (
    nom,
    email,
    telephone,
    commentaire,
    reponses,
    pistes,
    statut,
    rdv_id
  ) values (
    trim(nom_visiteur),
    lower(trim(courriel)),
    nullif(trim(telephone_contact), ''),
    nullif(trim(commentaire_libre), ''),
    reponses_json,
    pistes_json,
    'nouveau',
    creneau_associe
  )
  returning id into nouvel_id;

  return nouvel_id;
end;
$$;

-- 2. Consultation privée des diagnostics (réservée à l'avocate authentifiée)
create or replace function public.liste_diagnostics()
returns table(
  id uuid,
  created_at timestamptz,
  nom text,
  email text,
  telephone text,
  commentaire text,
  reponses jsonb,
  pistes jsonb,
  statut text,
  rdv_debut timestamptz,
  rdv_modalite text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform cabinet_security.verifier_admin();
  return query
    select
      d.id,
      d.created_at,
      d.nom,
      d.email,
      d.telephone,
      d.commentaire,
      d.reponses,
      d.pistes,
      d.statut,
      lower(a.periode) as rdv_debut,
      a.modalite as rdv_modalite
    from cabinet_security.diagnostics d
    left join cabinet_security.agenda a on d.rdv_id = a.id
    order by d.created_at desc;
end;
$$;

-- 3. Mise à jour du statut d'un diagnostic (réservée à l'avocate)
create or replace function public.maj_statut_diagnostic(
  diagnostic_id uuid,
  nouveau_statut text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform cabinet_security.verifier_admin();
  if nouveau_statut not in ('nouveau', 'contacte', 'traite', 'archive') then
    raise invalid_parameter_value;
  end if;

  update cabinet_security.diagnostics
  set statut = nouveau_statut
  where id = diagnostic_id;

  return found;
end;
$$;

-- 4. Suppression sécurisée d'un diagnostic (réservée à l'avocate)
create or replace function public.supprimer_diagnostic(
  diagnostic_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform cabinet_security.verifier_admin();
  delete from cabinet_security.diagnostics where id = diagnostic_id;
  return found;
end;
$$;

-- Révocation générale et attribution des privilèges
revoke all on function public.enregistrer_diagnostic(text, text, text, text, jsonb, jsonb),
                        public.liste_diagnostics(),
                        public.maj_statut_diagnostic(uuid, text),
                        public.supprimer_diagnostic(uuid)
from public, anon, authenticated;

grant execute on function public.enregistrer_diagnostic(text, text, text, text, jsonb, jsonb) to anon, authenticated;
grant execute on function public.liste_diagnostics(),
                        public.maj_statut_diagnostic(uuid, text),
                        public.supprimer_diagnostic(uuid) to authenticated;

commit;
