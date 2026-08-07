import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Session Supabase courante.
 *
 * `chargement` distingue « pas encore su » de « pas connecté » : sans lui, la
 * garde de route renverrait vers l'écran de connexion le temps que la session
 * soit relue du stockage local, à chaque rafraîchissement de page.
 */
export function useSession() {
  const [session, setSession] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChargement(false);
      return;
    }

    let actif = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!actif) return;
      setSession(data.session);
      setChargement(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evenement, s) => {
      setSession(s);
    });

    return () => {
      actif = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, chargement };
}
