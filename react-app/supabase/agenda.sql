-- Installation propriétaire. Ajouter ensuite l'UUID Auth du cabinet dans
-- cabinet_security.admins. Aucun créneau n'est publié par défaut.
begin;
create schema if not exists cabinet_security;
revoke all on schema cabinet_security from public, anon, authenticated;
create table if not exists cabinet_security.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists cabinet_security.agenda (
  id uuid primary key default gen_random_uuid(),
  periode tstzrange not null,
  nom text, email text, modalite text, demande uuid unique,
  exclude using gist (periode with &&)
);
alter table cabinet_security.agenda enable row level security;
alter table cabinet_security.admins enable row level security;
revoke all on cabinet_security.agenda, cabinet_security.admins from public, anon, authenticated;

create or replace function cabinet_security.verifier_admin()
returns void language plpgsql stable set search_path = '' as $$
begin
  if not exists (select from cabinet_security.admins where user_id = auth.uid()) then
    raise insufficient_privilege;
  end if;
  -- Respecte également la politique MFA si le durcissement global est activé.
  if to_regprocedure('public.is_cabinet_admin()') is not null then
    if not public.is_cabinet_admin() then raise insufficient_privilege; end if;
  end if;
end;
$$;

create or replace function public.creneaux_libres()
returns table(id uuid, debut timestamptz) language sql stable security definer set search_path = '' as $$
  select a.id, lower(a.periode) from cabinet_security.agenda a
  where a.demande is null and lower(a.periode) > now() order by a.periode;
$$;

create or replace function public.reserver_bilan(creneau uuid, requete uuid, nom_client text, courriel text, format_rdv text)
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare debut timestamptz;
begin
  if requete is null or coalesce(length(trim(nom_client)),0) not between 1 and 120
     or length(trim(courriel)) > 254 or coalesce(trim(courriel),'') !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
     or coalesce(format_rdv,'') not in ('cabinet','visio') then raise invalid_parameter_value; end if;

  update cabinet_security.agenda a set nom=trim(nom_client), email=trim(courriel), modalite=format_rdv, demande=requete
  where a.id=creneau and a.demande is null and lower(a.periode)>clock_timestamp()
  returning lower(a.periode) into debut;
  if debut is null then
    select lower(a.periode) into debut from cabinet_security.agenda a
    where a.id=creneau and a.demande=requete;
  end if;
  return debut;
end;
$$;

create or replace function public.agenda_cabinet()
returns table(id uuid, debut timestamptz, nom text, email text, modalite text)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform cabinet_security.verifier_admin();
  return query select a.id, lower(a.periode), a.nom, a.email, a.modalite
  from cabinet_security.agenda a where upper(a.periode)>now() order by a.periode;
end;
$$;

create or replace function public.ouvrir_creneau(heure_paris timestamp)
returns void language plpgsql security definer set search_path = '' as $$
declare debut timestamptz := heure_paris at time zone 'Europe/Paris';
begin
  perform cabinet_security.verifier_admin();
  if debut is null or not isfinite(debut) or debut <= now()
    or (debut at time zone 'Europe/Paris') <> heure_paris then raise invalid_parameter_value; end if;
  insert into cabinet_security.agenda(periode) values (tstzrange(debut,debut+interval '1 hour','[)'));
end;
$$;

create or replace function public.retirer_creneau(creneau uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform cabinet_security.verifier_admin();
  delete from cabinet_security.agenda where id=creneau and demande is null;
  return found;
end;
$$;
revoke all on function cabinet_security.verifier_admin(), public.creneaux_libres(), public.reserver_bilan(uuid,uuid,text,text,text), public.agenda_cabinet(), public.ouvrir_creneau(timestamp), public.retirer_creneau(uuid) from public, anon, authenticated;
grant execute on function public.creneaux_libres(), public.reserver_bilan(uuid,uuid,text,text,text) to anon, authenticated;
grant execute on function public.agenda_cabinet(), public.ouvrir_creneau(timestamp), public.retirer_creneau(uuid) to authenticated;
commit;
