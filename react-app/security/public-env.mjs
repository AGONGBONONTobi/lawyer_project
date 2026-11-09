// Tout VITE_* est public dans un bundle Vite. Ne jamais y placer de secret.
const ALLOWED = new Set([
  "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_EMAILJS_SERVICE_ID",
  "VITE_EMAILJS_TEMPLATE_ID", "VITE_EMAILJS_PUBLIC_KEY",
]);

export function validatePublicEnvironment(env) {
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith("VITE_")) continue;
    if (!ALLOWED.has(name)) throw new Error(`Variable frontend non autorisée : ${name}. Vérifier qu’elle ne contient aucun secret.`);
    if (!value) continue;
    if (value.startsWith("sb_secret_")) throw new Error(`Clé serveur interdite dans ${name}.`);
    if (value.startsWith("eyJ")) {
      let claims;
      try { claims = JSON.parse(Buffer.from(value.split(".")[1], "base64url").toString()); }
      catch { throw new Error(`JWT illisible dans ${name}.`); }
      if (claims.role !== "anon") throw new Error(`JWT privilégié interdit dans ${name}.`);
    }
    if (name === "VITE_SUPABASE_URL") {
      let url;
      try { url = new URL(value); } catch { throw new Error("URL Supabase invalide."); }
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      if (url.username || url.password || (!local && url.protocol !== "https:")) throw new Error("URL Supabase : HTTPS requis hors développement local.");
    }
  }
}
