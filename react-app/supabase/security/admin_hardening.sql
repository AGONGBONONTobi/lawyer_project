-- PRÉPARATION UNIQUEMENT — ne pas exécuter en production avant :
-- 1. inventaire des politiques réellement actives et sauvegarde,
-- 2. enrollment MFA et écran challenge TOTP opérationnels,
-- 3. ajout explicite des administrateurs dans cabinet_security.admins,
-- 4. validation en préproduction des accès anon / non-admin / admin aal1 / aal2.
-- Cette migration n'est lancée par aucun workflow.

begin;

create schema if not exists cabinet_security;
revoke all on schema cabinet_security from public, anon, authenticated;

create table if not exists cabinet_security.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table cabinet_security.admins enable row level security;
revoke all on cabinet_security.admins from public, anon, authenticated;

-- Exécutée par son propriétaire ; un client ne peut ni lire ni modifier la liste.
-- La liste serveur évite de dépendre d'un rôle mémorisé dans un ancien JWT.
create or replace function public.is_cabinet_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt()->>'aal') = 'aal2', false)
    and exists (
      select 1 from cabinet_security.admins a
      where a.user_id = (select auth.uid())
    );
$$;
revoke all on function public.is_cabinet_admin() from public;
grant execute on function public.is_cabinet_admin() to anon, authenticated, service_role;

-- Gardes RESTRICTIVES : d'autres politiques permissives ne doivent pas
-- rouvrir l'écriture. Les politiques permissives existantes restent requises.
drop policy if exists cabinet_domaines_read_guard on public.domaines;
create policy cabinet_domaines_read_guard on public.domaines
  as restrictive for select to anon, authenticated
  using (visible or (select public.is_cabinet_admin()));

drop policy if exists cabinet_domaines_insert_guard on public.domaines;
create policy cabinet_domaines_insert_guard on public.domaines
  as restrictive for insert to authenticated
  with check ((select public.is_cabinet_admin()));
drop policy if exists cabinet_domaines_update_guard on public.domaines;
create policy cabinet_domaines_update_guard on public.domaines
  as restrictive for update to authenticated
  using ((select public.is_cabinet_admin()))
  with check ((select public.is_cabinet_admin()));
drop policy if exists cabinet_domaines_delete_guard on public.domaines;
create policy cabinet_domaines_delete_guard on public.domaines
  as restrictive for delete to authenticated
  using ((select public.is_cabinet_admin()));

drop policy if exists cabinet_pages_insert_guard on public.pages_legales;
create policy cabinet_pages_insert_guard on public.pages_legales
  as restrictive for insert to authenticated
  with check ((select public.is_cabinet_admin()));
drop policy if exists cabinet_pages_update_guard on public.pages_legales;
create policy cabinet_pages_update_guard on public.pages_legales
  as restrictive for update to authenticated
  using ((select public.is_cabinet_admin()))
  with check ((select public.is_cabinet_admin()));
drop policy if exists cabinet_pages_delete_guard on public.pages_legales;
create policy cabinet_pages_delete_guard on public.pages_legales
  as restrictive for delete to authenticated using (false);

-- Ne touche pas aux autres buckets. Les images publiées restent publiques.
drop policy if exists cabinet_images_insert_guard on storage.objects;
create policy cabinet_images_insert_guard on storage.objects
  as restrictive for insert to authenticated
  with check (bucket_id <> 'domaines' or (select public.is_cabinet_admin()));
drop policy if exists cabinet_images_update_guard on storage.objects;
create policy cabinet_images_update_guard on storage.objects
  as restrictive for update to authenticated
  using (bucket_id <> 'domaines' or (select public.is_cabinet_admin()))
  with check (bucket_id <> 'domaines' or (select public.is_cabinet_admin()));
drop policy if exists cabinet_images_delete_guard on storage.objects;
create policy cabinet_images_delete_guard on storage.objects
  as restrictive for delete to authenticated
  using (bucket_id <> 'domaines' or (select public.is_cabinet_admin()));

-- Ajouter les UUID réels avec une session propriétaire, jamais avec la clé anon :
-- insert into cabinet_security.admins(user_id) values ('UUID_ADMIN');

commit;
