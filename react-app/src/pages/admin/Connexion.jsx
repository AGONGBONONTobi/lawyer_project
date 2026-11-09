import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { useSession } from "../../lib/useSession";

/**
 * Connexion au back office.
 *
 * Pas d'inscription : le compte du cabinet est créé à la main dans la console
 * Supabase. Un formulaire d'inscription public sur ce site ouvrirait l'écriture
 * des domaines à n'importe qui, les politiques RLS n'exigeant qu'un compte
 * authentifié.
 */
export default function Connexion() {
  const { session, chargement } = useSession();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  if (chargement) return null;
  if (session) return <Navigate to={location.state?.from || "/admin/domaines"} replace />;

  async function soumettre(e) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });

    if (error) {
      setErreur(
        error.message === "Invalid login credentials"
          ? "Adresse e-mail ou mot de passe incorrect."
          : error.message
      );
      setEnvoi(false);
    }
    // En cas de succès, `onAuthStateChange` met la session à jour et la
    // redirection ci-dessus prend le relais — inutile de naviguer à la main.
  }

  return (
    <div className="admin grid min-h-screen place-items-center bg-[var(--parchment-warm)] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-sm border border-[var(--ribbon)] font-serif text-[var(--accent-ink)]">
            MB
          </span>
          <h1 className="font-serif text-2xl">Administration</h1>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">Cabinet Moradéké Badirou</p>
        </div>

        <form
          onSubmit={soumettre}
          className="rounded-sm border border-[var(--line)] bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-medium" htmlFor="email">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--ribbon)]"
          />

          <label className="mt-5 block text-sm font-medium" htmlFor="mdp">
            Mot de passe
          </label>
          <input
            id="mdp"
            type="password"
            required
            autoComplete="current-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--ribbon)]"
          />

          {erreur && (
            <p role="alert" className="mt-4 rounded-sm bg-[#FCEDEB] px-3 py-2 text-sm text-[#C0392B]">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={envoi || !isSupabaseConfigured}
            className="mt-6 w-full rounded-sm bg-[var(--ribbon)] px-4 py-2.5 text-sm font-semibold tracking-wide text-[var(--on-ribbon)] transition hover:bg-[var(--ribbon-dark)] disabled:opacity-60"
          >
            {envoi ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-[var(--muted-ink)]">
          Accès réservé au cabinet. En cas d'oubli du mot de passe, contactez la personne qui
          administre le site.
        </p>
      </div>
    </div>
  );
}
