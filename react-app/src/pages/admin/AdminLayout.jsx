import { useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { useSession } from "../../lib/useSession";

const ONGLETS = [
  { to: "/admin/agenda", libelle: "Agenda" },
  { to: "/admin/diagnostics", libelle: "Diagnostics" },
  { to: "/admin/domaines", libelle: "Domaines d'expertise" },
  { to: "/admin/pages-legales", libelle: "Pages légales" },
];

/** Encadrement commun des écrans d'administration : en-tête, largeur, déconnexion. */
export function AdminShell({ titre, sousTitre, actions, children }) {
  const { session } = useSession();
  const { pathname } = useLocation();

  return (
    <div className="admin min-h-screen bg-[var(--parchment-warm)] text-[var(--text)]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-sm border border-[var(--ribbon)] font-serif text-sm text-[var(--accent-ink)]">
              MB
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-ink)]">
                Administration
              </p>
              <p className="text-sm font-medium">Cabinet Moradéké Badirou</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {session?.user?.email && (
              <span className="hidden text-sm text-[var(--muted-ink)] sm:inline">{session.user.email}</span>
            )}
            <a
              href="/"
              className="text-sm text-[var(--muted-ink)] underline underline-offset-4 hover:text-[var(--text)]"
            >
              Voir le site
            </a>
            <button
              type="button"
              onClick={() => supabase?.auth.signOut()}
              className="rounded-sm border border-[var(--line)] px-3 py-1.5 text-sm hover:border-[var(--ribbon)] hover:text-[var(--accent-ink)]"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 px-6" aria-label="Sections de l'administration">
          {ONGLETS.map((o) => {
            const actif = pathname.startsWith(o.to);
            return (
              <Link
                key={o.to}
                to={o.to}
                aria-current={actif ? "page" : undefined}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm no-underline ${
                  actif
                    ? "border-[var(--ribbon)] font-medium text-[var(--accent-ink)]"
                    : "border-transparent text-[var(--muted-ink)] hover:text-[var(--text)]"
                }`}
              >
                {o.libelle}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end gap-4">
          <div>
            <h1 className="font-serif text-3xl">{titre}</h1>
            {sousTitre && <p className="mt-2 max-w-2xl text-sm text-[var(--muted-ink)]">{sousTitre}</p>}
          </div>
          {actions && <div className="ml-auto flex gap-3">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}

/**
 * Garde d'accès.
 *
 * Trois issues distinctes, parce que « Supabase absent » et « non connecté »
 * appellent des réponses différentes : la première est une erreur de
 * déploiement qu'il faut nommer, la seconde une redirection normale.
 */
export function RequireAuth({ children }) {
  const { session, chargement } = useSession();
  const location = useLocation();

  // Dans RequireAuth, ajout du timer d'inactivité (placé avant les retours conditionnels pour respecter les Rules of Hooks)
  useEffect(() => {
    if (!session) return;
    let timeoutId;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Déconnexion automatique après 15 minutes d'inactivité
      timeoutId = setTimeout(() => {
        supabase?.auth.signOut();
      }, 15 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [session]);

  if (!isSupabaseConfigured) {
    return (
      <div className="admin grid min-h-screen place-items-center bg-[var(--parchment-warm)] px-6">
        <div className="max-w-lg rounded-sm border border-[var(--line)] bg-white p-8 text-center">
          <h1 className="font-serif text-2xl">Back office non configuré</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-ink)]">
            Les variables <code className="rounded bg-[var(--parchment-deep)] px-1">VITE_SUPABASE_URL</code> et{" "}
            <code className="rounded bg-[var(--parchment-deep)] px-1">VITE_SUPABASE_ANON_KEY</code> sont absentes
            de l'environnement. Le site public continue de fonctionner avec les domaines livrés par
            défaut ; seule l'administration est indisponible.
          </p>
        </div>
      </div>
    );
  }

  if (chargement) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--parchment-warm)]">
        <p className="text-sm text-[var(--muted-ink)]">Chargement…</p>
      </div>
    );
  }


  if (!session) {
    return <Navigate to="/admin/connexion" replace state={{ from: location.pathname }} />;
  }

  return children;
}
