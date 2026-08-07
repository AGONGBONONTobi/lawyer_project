import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase du site vitrine.
 *
 * Les variables sont optionnelles à dessein : le site doit continuer à
 * s'afficher sans configuration Supabase — il retombe alors sur les domaines
 * livrés en dur (cf. `lib/domaines.js`). Seul le back office exige la config,
 * et il le dit explicitement à l'écran plutôt que de planter.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
