// Supabase Edge Function — gestion des comptes admins.
//
// Méthodes acceptées :
//   GET    /manage-users          → liste tous les comptes
//   POST   /manage-users          → crée un compte  { email, password }
//   DELETE /manage-users?id=<uid> → supprime un compte
//
// Sécurité : le token JWT Supabase de l'appelant est vérifié.
// Seul un utilisateur connecté peut appeler cette fonction.
// La service_role key est injectée automatiquement par Supabase
// (pas besoin de la stocker soi-même).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  // ── Vérification du JWT de l'appelant ────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Non authentifié." }, 401);
  }

  const url = new URL(req.url);

  // Client avec service_role pour les opérations admin
  // Ces env vars sont injectées automatiquement par Supabase dans les Edge Functions.
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Client avec la clé anon pour vérifier que l'appelant est bien connecté
  const caller = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    }
  );

  const { data: { user }, error: authErr } = await caller.auth.getUser();
  if (authErr || !user) {
    return json({ error: "Token invalide ou expiré." }, 401);
  }

  // ── GET — lister les comptes ─────────────────────────────────────────────
  if (req.method === "GET") {
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) return json({ error: error.message }, 500);
    return json({ users: data.users });
  }

  // ── POST — créer un compte ───────────────────────────────────────────────
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return json({ error: "email et password sont requis." }, 400);
    }
    if (password.length < 6) {
      return json({ error: "Le mot de passe doit comporter au moins 6 caractères." }, 400);
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ user: data.user }, 201);
  }

  // ── DELETE — supprimer un compte ─────────────────────────────────────────
  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "Paramètre id manquant." }, 400);

    // Sécurité : interdire de supprimer son propre compte
    if (id === user.id) {
      return json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, 403);
    }

    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return json({ error: error.message }, 400);
    return json({ success: true });
  }

  return json({ error: "Méthode non supportée." }, 405);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
