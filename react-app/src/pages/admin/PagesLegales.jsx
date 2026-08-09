import { useEffect, useState } from "react";
import { AdminShell } from "./AdminLayout";
import TexteRiche from "../../components/TexteRiche";
import {
  compterAComPleter,
  tableManquante,
  fetchToutesPagesLegales,
  importerContenuLivre,
  majPageLegale,
} from "../../lib/pagesLegales";

const ORDRE = ["mentions-legales", "confidentialite"];

export default function PagesLegales() {
  const [pages, setPages] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [slugOuvert, setSlugOuvert] = useState(null);
  // Table absente : proposer « Importer » n'aurait aucun sens, l'import
  // échouerait de la même façon. On affiche seulement quoi faire.
  const [tableAbsente, setTableAbsente] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    setChargement(true);
    setErreur("");
    try {
      const rows = await fetchToutesPagesLegales();
      setPages(rows.sort((a, b) => ORDRE.indexOf(a.slug) - ORDRE.indexOf(b.slug)));
      setTableAbsente(false);
    } catch (err) {
      setTableAbsente(tableManquante(err));
      setErreur(lisible(err));
    } finally {
      setChargement(false);
    }
  }

  function annoncer(texte) {
    setMessage(texte);
    setTimeout(() => setMessage(""), 4000);
  }

  async function importer() {
    setErreur("");
    try {
      await importerContenuLivre();
      await charger();
      annoncer("Le contenu actuel du site a été importé. Vous pouvez maintenant le modifier.");
    } catch (err) {
      setErreur(lisible(err));
    }
  }

  const pageOuverte = pages.find((p) => p.slug === slugOuvert);

  return (
    <AdminShell
      titre="Pages légales"
      sousTitre="Mentions légales et politique de confidentialité. Ces deux pages sont obligatoires : elles se modifient, mais ne peuvent pas être supprimées."
    >
      {message && (
        <p role="status" className="mb-6 rounded-sm bg-[#E6F6EF] px-4 py-3 text-sm text-[#0E8A5F]">
          {message}
        </p>
      )}
      {erreur && (
        <p role="alert" className="mb-6 rounded-sm bg-[#FCEDEB] px-4 py-3 text-sm text-[#C0392B]">
          {erreur}
        </p>
      )}

      {chargement ? (
        <p className="text-sm text-[#595959]">Chargement…</p>
      ) : tableAbsente ? null : pages.length === 0 ? (
        <div className="rounded-sm border border-dashed border-[#E0E0E0] bg-white p-10 text-center">
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#595959]">
            Aucune version enregistrée en base. Le site affiche pour l'instant le contenu livré avec
            lui — les pages sont donc bien en ligne. Importez ce contenu pour pouvoir le modifier
            depuis cet écran.
          </p>
          <button
            type="button"
            onClick={importer}
            className="mt-6 rounded-sm bg-[#B8975A] px-5 py-2 text-sm font-semibold text-[#1a140a] hover:bg-[#C9A96E]"
          >
            Importer le contenu actuel
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {pages.map((p) => {
            const restant = compterAComPleter(p);
            return (
              <li
                key={p.slug}
                className="flex flex-wrap items-center gap-4 rounded-sm border border-[#E0E0E0] bg-white p-4"
              >
                <div className="min-w-[14rem] flex-1">
                  <p className="font-serif text-lg">{p.titre}</p>
                  <p className="text-sm text-[#595959]">
                    /{p.slug} · {p.sections.length} section{p.sections.length > 1 ? "s" : ""}
                    {p.maj && ` · mise à jour ${p.maj}`}
                  </p>
                  {restant > 0 && (
                    <p className="mt-1 text-xs font-medium text-[#B4741F]">
                      {restant} information{restant > 1 ? "s" : ""} encore à compléter
                    </p>
                  )}
                </div>
                <div className="ml-auto flex gap-2">
                  <a
                    href={`/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm border border-[#E0E0E0] px-3 py-1.5 text-sm hover:border-[#B8975A]"
                  >
                    Voir la page
                  </a>
                  <button
                    type="button"
                    onClick={() => setSlugOuvert(p.slug)}
                    className="rounded-sm border border-[#B8975A] px-3 py-1.5 text-sm text-[#8A6E2A] hover:bg-[#FDFAF5]"
                  >
                    Modifier
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages.length > 0 && (
        <p className="mt-6 text-xs leading-relaxed text-[#595959]">
          Besoin de repartir du texte d'origine ?{" "}
          <button type="button" onClick={importer} className="underline underline-offset-2">
            Réimporter le contenu livré
          </button>{" "}
          — cela écrase vos modifications sur les deux pages.
        </p>
      )}

      {pageOuverte && (
        <EditeurPage
          page={pageOuverte}
          onFermer={() => setSlugOuvert(null)}
          onEnregistre={(maj) => {
            setPages((liste) => liste.map((p) => (p.slug === maj.slug ? maj : p)));
            setSlugOuvert(null);
            annoncer(`« ${maj.titre} » a été enregistrée. La page est à jour sur le site.`);
          }}
        />
      )}
    </AdminShell>
  );
}

/* ------------------------------------------------------------------ éditeur */

function EditeurPage({ page, onFermer, onEnregistre }) {
  const [brouillon, setBrouillon] = useState({
    titre: page.titre,
    maj: page.maj,
    sections: page.sections.map((s) => ({ ...s })),
  });
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [apercu, setApercu] = useState(null); // index de la section prévisualisée

  function setSection(i, champ, valeur) {
    setBrouillon((b) => {
      const sections = b.sections.map((s, j) => (j === i ? { ...s, [champ]: valeur } : s));
      return { ...b, sections };
    });
  }

  function deplacer(i, sens) {
    const cible = i + sens;
    if (cible < 0 || cible >= brouillon.sections.length) return;
    setBrouillon((b) => {
      const sections = [...b.sections];
      [sections[i], sections[cible]] = [sections[cible], sections[i]];
      return { ...b, sections };
    });
  }

  async function soumettre(e) {
    e.preventDefault();
    setErreur("");

    const sections = brouillon.sections.filter((s) => s.titre.trim() || s.corps.trim());
    if (sections.length === 0) {
      return setErreur("Une page légale ne peut pas être vide.");
    }

    setEnvoi(true);
    try {
      const maj = await majPageLegale(page.slug, { ...brouillon, sections });
      onEnregistre(maj);
    } catch (err) {
      setErreur(lisible(err));
      setEnvoi(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Modifier ${page.titre}`}
    >
      <form onSubmit={soumettre} className="mx-auto max-w-3xl rounded-sm bg-white p-6 shadow-xl sm:p-8">
        <h2 className="font-serif text-2xl">{page.titre}</h2>
        <p className="mt-2 text-sm text-[#595959]">
          Mise en forme : <code className="rounded bg-[#F2F2F2] px-1">**gras**</code>,{" "}
          <code className="rounded bg-[#F2F2F2] px-1">[libellé](https://…)</code>, une ligne
          commençant par <code className="rounded bg-[#F2F2F2] px-1">-</code> pour une puce,{" "}
          <code className="rounded bg-[#F2F2F2] px-1">&gt;</code> pour une remarque discrète. Une
          ligne vide sépare deux paragraphes.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Titre de la page</span>
            <input
              value={brouillon.titre}
              onChange={(e) => setBrouillon((b) => ({ ...b, titre: e.target.value }))}
              className={champClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Dernière mise à jour</span>
            <input
              value={brouillon.maj}
              onChange={(e) => setBrouillon((b) => ({ ...b, maj: e.target.value }))}
              placeholder="2026"
              className={champClass}
            />
          </label>
        </div>

        <div className="mt-8 space-y-6">
          {brouillon.sections.map((s, i) => (
            <div key={i} className="rounded-sm border border-[#E0E0E0] p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => deplacer(i, -1)}
                    disabled={i === 0}
                    aria-label="Monter la section"
                    className="h-6 w-6 rounded-sm border border-[#E0E0E0] text-xs leading-none disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => deplacer(i, 1)}
                    disabled={i === brouillon.sections.length - 1}
                    aria-label="Descendre la section"
                    className="h-6 w-6 rounded-sm border border-[#E0E0E0] text-xs leading-none disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>

                <div className="flex-1">
                  <input
                    value={s.titre}
                    onChange={(e) => setSection(i, "titre", e.target.value)}
                    placeholder="Titre de la section (laisser vide pour un chapô)"
                    className={`${champClass} font-medium`}
                  />
                  <textarea
                    value={s.corps}
                    onChange={(e) => setSection(i, "corps", e.target.value)}
                    rows={Math.min(18, Math.max(5, s.corps.split("\n").length + 1))}
                    className={`${champClass} mt-2 font-mono text-xs leading-relaxed`}
                  />

                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setApercu(apercu === i ? null : i)}
                      className="text-[#8A6E2A] underline underline-offset-2"
                    >
                      {apercu === i ? "Masquer l'aperçu" : "Aperçu"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBrouillon((b) => ({
                          ...b,
                          sections: b.sections.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-[#C0392B] underline underline-offset-2"
                    >
                      Supprimer cette section
                    </button>
                  </div>

                  {apercu === i && (
                    <div className="legal mt-3 rounded-sm bg-[#FDFAF5] p-4">
                      <div className="legal-section">
                        {s.titre && <h2 className="font-serif text-lg">{s.titre}</h2>}
                        <TexteRiche texte={s.corps} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setBrouillon((b) => ({ ...b, sections: [...b.sections, { titre: "", corps: "" }] }))
          }
          className="mt-4 text-sm text-[#8A6E2A] underline underline-offset-4"
        >
          + Ajouter une section
        </button>

        {erreur && (
          <p role="alert" className="mt-5 rounded-sm bg-[#FCEDEB] px-3 py-2 text-sm text-[#C0392B]">
            {erreur}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onFermer}
            className="rounded-sm border border-[#E0E0E0] px-4 py-2 text-sm hover:border-[#111]"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={envoi}
            className="rounded-sm bg-[#B8975A] px-5 py-2 text-sm font-semibold text-[#1a140a] hover:bg-[#C9A96E] disabled:opacity-60"
          >
            {envoi ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

const champClass =
  "w-full rounded-sm border border-[#E0E0E0] px-3 py-2 text-sm outline-none focus:border-[#B8975A]";

function lisible(err) {
  const brut = err?.message || String(err);
  if (brut.includes("Failed to fetch") || brut.includes("NetworkError")) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion internet, puis réessayez.";
  }
  if (brut.includes("row-level security") || err?.code === "42501") {
    return "Vous n'avez pas les droits pour cette modification. Reconnectez-vous.";
  }
  if (brut.includes("JWT") || brut.includes("token is expired")) {
    return "Votre session a expiré. Reconnectez-vous pour enregistrer vos modifications.";
  }
  if (tableManquante(err)) {
    return "La table des pages légales n'existe pas encore dans Supabase. Exécutez le script supabase/pages_legales_schema.sql dans le SQL Editor, puis rechargez cette page.";
  }
  return brut;
}
