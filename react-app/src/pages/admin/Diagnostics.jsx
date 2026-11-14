import { useEffect, useState } from "react";
import { AdminShell } from "./AdminLayout";
import {
  QUESTIONS,
  fetchDiagnostics,
  libelleReponse,
  majStatutDiagnostic,
  supprimerDiagnostic,
} from "../../lib/diagnostic";
import { dateParis } from "../../lib/agenda";

const STATUT_BADGES = {
  nouveau: {
    label: "Nouveau",
    classes: "bg-[var(--slate-200)] text-[var(--accent-ink)] border-[var(--ribbon)]",
  },
  contacte: {
    label: "Contacté",
    classes: "bg-[var(--patina-pale)] text-[var(--patina-ink)] border-[var(--patina-ink)]",
  },
  traite: {
    label: "Traité",
    classes: "bg-[var(--success-bg)] text-[var(--success-ink)] border-[var(--success-border)]",
  },
  archive: {
    label: "Archivé",
    classes: "bg-gray-100 text-[var(--muted-ink)] border-gray-300",
  },
};

export default function Diagnostics() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [filtre, setFiltre] = useState("tous");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [version, refresh] = useState(0);

  useEffect(() => {
    let active = true;
    const charger = () => {
      fetchDiagnostics()
        .then((data) => {
          if (active) setDiagnostics(data || []);
        })
        .catch(() => {
          if (active) setDiagnostics([]);
        });
    };
    charger();
    const interval = setInterval(charger, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [version]);

  async function changerStatut(id, nouveauStatut) {
    setBusy(true);
    setMessage("");
    try {
      await majStatutDiagnostic(id, nouveauStatut);
      refresh((v) => v + 1);
    } catch {
      setMessage("Impossible de mettre à jour le statut.");
    } finally {
      setBusy(false);
    }
  }

  async function supprimer(id, nom) {
    if (!window.confirm(`Supprimer définitivement le diagnostic de ${nom} ?`)) return;
    setBusy(true);
    setMessage("");
    try {
      await supprimerDiagnostic(id);
      refresh((v) => v + 1);
    } catch {
      setMessage("Impossible de supprimer le diagnostic.");
    } finally {
      setBusy(false);
    }
  }

  const listeFiltree = (diagnostics || []).filter((d) => {
    if (filtre === "tous") return true;
    return d.statut === filtre;
  });

  const totalNouveaux = (diagnostics || []).filter((d) => d.statut === "nouveau").length;
  const totalRdv = (diagnostics || []).filter((d) => Boolean(d.rdv_debut)).length;

  return (
    <AdminShell
      titre="Diagnostics nationalité"
      sousTitre="Questionnaires complétés et transmis par les visiteurs du site"
      actions={
        <div className="flex gap-2 text-xs">
          <span className="rounded-sm border border-[var(--line)] bg-white px-2.5 py-1 text-[var(--text)]">
            Total : <strong>{(diagnostics || []).length}</strong>
          </span>
          <span className="rounded-sm border border-[var(--ribbon)] bg-[var(--slate-200)] px-2.5 py-1 text-[var(--accent-ink)]">
            Nouveaux : <strong>{totalNouveaux}</strong>
          </span>
          <span className="rounded-sm border border-[var(--patina-ink)] bg-[var(--patina-pale)] px-2.5 py-1 text-[var(--patina-ink)]">
            Avec rendez-vous : <strong>{totalRdv}</strong>
          </span>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les diagnostics">
          {[
            ["tous", "Tous"],
            ["nouveau", "Nouveaux"],
            ["contacte", "Contactés"],
            ["traite", "Traités"],
            ["archive", "Archivés"],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setFiltre(val)}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                filtre === val
                  ? "bg-[var(--accent-ink)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--muted-ink)] hover:text-[var(--text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => refresh((v) => v + 1)}
          disabled={busy}
          className="text-xs text-[var(--muted-ink)] underline underline-offset-4 hover:text-[var(--text)]"
        >
          Actualiser la liste
        </button>
      </div>

      {message && (
        <p role="status" className="form-status is-error mb-4">
          {message}
        </p>
      )}

      {diagnostics === null ? (
        <p className="text-sm text-[var(--muted-ink)]">Chargement des diagnostics…</p>
      ) : listeFiltree.length === 0 ? (
        <div className="rounded-sm border border-[var(--line)] bg-white p-8 text-center text-sm text-[var(--muted-ink)]">
          {filtre === "tous"
            ? "Aucun diagnostic transmis pour le moment."
            : `Aucun diagnostic avec le statut « ${filtre} ».`}
        </div>
      ) : (
        <ul className="grid gap-4" aria-label="Liste des diagnostics">
          {listeFiltree.map((item) => {
            const badge = STATUT_BADGES[item.statut] || STATUT_BADGES.nouveau;
            const pistes = Array.isArray(item.pistes) ? item.pistes : [];
            const reponses = item.reponses || {};

            return (
              <li
                key={item.id}
                className="rounded-sm border border-[var(--line)] bg-white p-5 shadow-sm transition-shadow hover:shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-lg font-semibold text-[var(--text)]">
                        {item.nom}
                      </h2>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      {item.rdv_debut && (
                        <span className="rounded-full border border-[var(--patina-ink)] bg-[var(--patina-pale)] px-2 py-0.5 text-[11px] font-medium text-[var(--patina-ink)]">
                          📅 Bilan : {dateParis(item.rdv_debut)} (
                          {item.rdv_modalite === "visio" ? "Visio" : "Cabinet"})
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-ink)]">
                      Transmis le {dateParis(item.created_at)} (heure de Paris) · Réf. #
                      {item.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor={`statut-${item.id}`} className="sr-only">
                      Statut pour {item.nom}
                    </label>
                    <select
                      id={`statut-${item.id}`}
                      value={item.statut}
                      disabled={busy}
                      onChange={(e) => changerStatut(item.id, e.target.value)}
                      className="rounded-sm border border-[var(--field-line)] bg-white px-2 py-1 text-xs text-[var(--text)]"
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="contacte">Contacté</option>
                      <option value="traite">Traité</option>
                      <option value="archive">Archivé</option>
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => supprimer(item.id, item.nom)}
                      title="Supprimer ce diagnostic"
                      className="rounded-sm border border-transparent px-2 py-1 text-xs text-[var(--error-ink)] hover:border-[var(--error-border)] hover:bg-[var(--error-bg)]"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="text-xs">
                    <span className="font-semibold text-[var(--muted-ink)]">Courriel : </span>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-[var(--accent-ink)] underline underline-offset-2"
                    >
                      {item.email}
                    </a>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-[var(--muted-ink)]">Téléphone : </span>
                    {item.telephone ? (
                      <a
                        href={`tel:${item.telephone.replace(/\s+/g, "")}`}
                        className="text-[var(--accent-ink)] underline underline-offset-2"
                      >
                        {item.telephone}
                      </a>
                    ) : (
                      <span className="text-[var(--muted-ink)]">Non communiqué</span>
                    )}
                  </div>
                </div>

                {item.commentaire && (
                  <div className="mt-3 rounded-sm border border-[var(--line)] bg-[var(--parchment-warm)] p-3 text-xs">
                    <strong className="block font-semibold text-[var(--muted-ink)] mb-0.5">
                      Précision apportée par le justiciable :
                    </strong>
                    <p className="whitespace-pre-line text-[var(--text)]">« {item.commentaire} »</p>
                  </div>
                )}

                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                    Pistes identifiées :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pistes.map((p) => (
                      <span
                        key={p.id || p.title}
                        className={`rounded-sm border px-2.5 py-1 text-xs ${
                          p.urgent
                            ? "border-[var(--error-border)] bg-[var(--error-bg)] font-semibold text-[var(--error-ink)]"
                            : "border-[var(--line)] bg-[var(--parchment-warm)] text-[var(--text)]"
                        }`}
                      >
                        {p.urgent && "⚠️ "}
                        {p.title}
                      </span>
                    ))}
                  </div>
                </div>

                <details className="mt-4 border-t border-[var(--line)] pt-3 text-xs">
                  <summary className="cursor-pointer font-medium text-[var(--accent-ink)] underline underline-offset-2 hover:text-[var(--text)]">
                    Consulter le détail des 12 réponses
                  </summary>
                  <div className="mt-3 grid gap-2 rounded-sm border border-[var(--line)] bg-[var(--parchment-warm)] p-3">
                    {QUESTIONS.map((q, idx) => {
                      const rep = reponses[q.id];
                      const libelle = libelleReponse(q.id, rep);
                      return (
                        <div
                          key={q.id}
                          className="grid grid-cols-1 border-b border-[var(--line)]/60 pb-1.5 last:border-b-0 sm:grid-cols-2 gap-1"
                        >
                          <span className="text-[var(--muted-ink)]">
                            {idx + 1}. {q.title}
                          </span>
                          <strong className="text-[var(--text)] sm:text-right">
                            {libelle || "—"}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
