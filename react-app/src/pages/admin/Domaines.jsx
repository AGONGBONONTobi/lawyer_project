import { useEffect, useRef, useState } from "react";
import { AdminShell } from "./AdminLayout";
import {
  creerDomaine,
  fetchTousDomaines,
  majDomaine,
  reordonner,
  slugifier,
  supprimerDomaine,
  televerserImage,
} from "../../lib/domaines";

const VIDE = {
  slug: "",
  domain: "",
  subtitle: "",
  points: ["", "", ""],
  img: "",
  visible: true,
};

export default function Domaines() {
  const [domaines, setDomaines] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [edite, setEdite] = useState(null); // objet en cours d'édition, ou null
  const [message, setMessage] = useState("");

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    setChargement(true);
    setErreur("");
    try {
      setDomaines(await fetchTousDomaines());
    } catch (err) {
      setErreur(lisible(err));
    } finally {
      setChargement(false);
    }
  }

  function annoncer(texte) {
    setMessage(texte);
    setTimeout(() => setMessage(""), 4000);
  }

  async function basculerVisibilite(d) {
    try {
      const maj = await majDomaine(d.id, { visible: !d.visible });
      setDomaines((liste) => liste.map((x) => (x.id === d.id ? maj : x)));
      annoncer(maj.visible ? `« ${maj.domain} » est de nouveau affiché.` : `« ${maj.domain} » est masqué du site.`);
    } catch (err) {
      setErreur(lisible(err));
    }
  }

  async function deplacer(index, sens) {
    const cible = index + sens;
    if (cible < 0 || cible >= domaines.length) return;

    const liste = [...domaines];
    [liste[index], liste[cible]] = [liste[cible], liste[index]];
    setDomaines(liste); // optimiste : le glissement doit être immédiat à l'écran

    try {
      await reordonner(liste);
    } catch (err) {
      setErreur(lisible(err));
      charger(); // l'ordre affiché n'est plus fiable, on relit la base
    }
  }

  async function supprimer(d) {
    if (!window.confirm(`Supprimer définitivement « ${d.domain} » ? Cette action est irréversible.`))
      return;
    try {
      await supprimerDomaine(d.id);
      setDomaines((liste) => liste.filter((x) => x.id !== d.id));
      annoncer(`« ${d.domain} » a été supprimé.`);
    } catch (err) {
      setErreur(lisible(err));
    }
  }

  async function enregistrer(brouillon) {
    const estNouveau = !brouillon.id;
    const charge = {
      slug: brouillon.slug || slugifier(brouillon.domain),
      domain: brouillon.domain.trim(),
      subtitle: brouillon.subtitle.trim(),
      points: brouillon.points,
      img: brouillon.img.trim(),
      visible: brouillon.visible,
    };

    if (estNouveau) {
      charge.position = domaines.length + 1;
      const cree = await creerDomaine(charge);
      setDomaines((liste) => [...liste, cree]);
      annoncer(`« ${cree.domain} » a été ajouté.`);
    } else {
      const maj = await majDomaine(brouillon.id, charge);
      setDomaines((liste) => liste.map((x) => (x.id === maj.id ? maj : x)));
      annoncer(`« ${maj.domain} » a été enregistré.`);
    }
    setEdite(null);
  }

  return (
    <AdminShell
      titre="Domaines d'expertise"
      sousTitre="Ces fiches alimentent la section « Domaines d'intervention » de la page d'accueil. Les modifications sont visibles sur le site dès l'enregistrement."
      actions={
        <button
          type="button"
          onClick={() => setEdite({ ...VIDE })}
          className="rounded-sm bg-[#B8975A] px-4 py-2 text-sm font-semibold text-[#1a140a] hover:bg-[#C9A96E]"
        >
          Ajouter un domaine
        </button>
      }
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
        <p className="text-sm text-[#595959]">Chargement des domaines…</p>
      ) : domaines.length === 0 && erreur ? (
        // Liste vide *parce que* la lecture a échoué : le message d'erreur
        // ci-dessus suffit. Afficher l'état vide laisserait croire que la base
        // ne contient rien, et pousserait à tout ressaisir.
        <button
          type="button"
          onClick={charger}
          className="rounded-sm border border-[#E0E0E0] bg-white px-4 py-2 text-sm hover:border-[#B8975A]"
        >
          Réessayer
        </button>
      ) : domaines.length === 0 ? (
        <div className="rounded-sm border border-dashed border-[#E0E0E0] bg-white p-10 text-center">
          <p className="text-sm text-[#595959]">
            Aucun domaine enregistré. Le site affiche pour l'instant les trois domaines livrés par
            défaut.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {domaines.map((d, i) => (
            <li
              key={d.id}
              className={`flex flex-wrap items-center gap-4 rounded-sm border bg-white p-4 ${
                d.visible ? "border-[#E0E0E0]" : "border-dashed border-[#D6C9A8] bg-[#FDFAF5]"
              }`}
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => deplacer(i, -1)}
                  disabled={i === 0}
                  aria-label={`Monter ${d.domain}`}
                  className="h-6 w-6 rounded-sm border border-[#E0E0E0] text-xs leading-none disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => deplacer(i, 1)}
                  disabled={i === domaines.length - 1}
                  aria-label={`Descendre ${d.domain}`}
                  className="h-6 w-6 rounded-sm border border-[#E0E0E0] text-xs leading-none disabled:opacity-30"
                >
                  ↓
                </button>
              </div>

              {d.img ? (
                <img
                  src={d.img}
                  alt=""
                  className="h-16 w-24 flex-none rounded-sm object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              ) : (
                <div className="grid h-16 w-24 flex-none place-items-center rounded-sm bg-[#F2F2F2] text-[10px] text-[#595959]">
                  sans image
                </div>
              )}

              <div className="min-w-[12rem] flex-1">
                <p className="font-serif text-lg">{d.domain}</p>
                <p className="text-sm text-[#595959]">{d.subtitle}</p>
                <p className="mt-1 text-xs text-[#595959]">
                  {d.points.length} point{d.points.length > 1 ? "s" : ""}
                  {!d.visible && " · masqué du site"}
                </p>
              </div>

              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => basculerVisibilite(d)}
                  className="rounded-sm border border-[#E0E0E0] px-3 py-1.5 text-sm hover:border-[#B8975A]"
                >
                  {d.visible ? "Masquer" : "Afficher"}
                </button>
                <button
                  type="button"
                  onClick={() => setEdite({ ...d, points: [...d.points] })}
                  className="rounded-sm border border-[#B8975A] px-3 py-1.5 text-sm text-[#8A6E2A] hover:bg-[#FDFAF5]"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => supprimer(d)}
                  className="rounded-sm border border-[#E0E0E0] px-3 py-1.5 text-sm text-[#C0392B] hover:border-[#C0392B]"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {edite && (
        <FormulaireDomaine
          valeur={edite}
          onFermer={() => setEdite(null)}
          onEnregistrer={enregistrer}
        />
      )}
    </AdminShell>
  );
}

/* ------------------------------------------------------------------ formulaire */

function FormulaireDomaine({ valeur, onFermer, onEnregistrer }) {
  const [brouillon, setBrouillon] = useState(valeur);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [televersement, setTeleversement] = useState(false);
  const fichierRef = useRef(null);
  const estNouveau = !valeur.id;

  function set(champ, v) {
    setBrouillon((b) => ({ ...b, [champ]: v }));
  }

  function setPoint(index, v) {
    setBrouillon((b) => {
      const points = [...b.points];
      points[index] = v;
      return { ...b, points };
    });
  }

  async function choisirImage(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setErreur("");
    setTeleversement(true);
    try {
      const url = await televerserImage(fichier, brouillon.slug || slugifier(brouillon.domain));
      set("img", url);
    } catch (err) {
      setErreur(lisible(err));
    } finally {
      setTeleversement(false);
      if (fichierRef.current) fichierRef.current.value = "";
    }
  }

  async function soumettre(e) {
    e.preventDefault();
    setErreur("");

    const points = brouillon.points.map((p) => p.trim()).filter(Boolean);
    if (!brouillon.domain.trim()) return setErreur("Le nom du domaine est obligatoire.");
    if (points.length === 0) return setErreur("Renseignez au moins un point d'intervention.");

    setEnvoi(true);
    try {
      await onEnregistrer({ ...brouillon, points });
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
      aria-label={estNouveau ? "Ajouter un domaine" : `Modifier ${valeur.domain}`}
    >
      <form
        onSubmit={soumettre}
        className="mx-auto max-w-2xl rounded-sm bg-white p-6 shadow-xl sm:p-8"
      >
        <h2 className="font-serif text-2xl">
          {estNouveau ? "Ajouter un domaine" : `Modifier « ${valeur.domain} »`}
        </h2>

        <Champ
          label="Nom du domaine"
          aide="Affiché en titre de la carte. Exemple : Droit de la famille."
        >
          <input
            required
            value={brouillon.domain}
            onChange={(e) => {
              set("domain", e.target.value);
              // Le slug ne suit le titre que sur une création : le modifier sur
              // une fiche existante casserait les liens et l'ordre de rendu.
              if (estNouveau) set("slug", slugifier(e.target.value));
            }}
            className={inputClass}
          />
        </Champ>

        <Champ
          label="Sous-titre"
          aide="Courte ligne au-dessus du titre. Séparez les mots-clés par « · »."
        >
          <input
            value={brouillon.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="Divorce · garde · violences conjugales"
            className={inputClass}
          />
        </Champ>

        <Champ label="Points d'intervention" aide="Les lignes vides ne sont pas publiées.">
          <div className="space-y-2">
            {brouillon.points.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={p}
                  onChange={(e) => setPoint(i, e.target.value)}
                  placeholder={`Point ${i + 1}`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    setBrouillon((b) => ({ ...b, points: b.points.filter((_, j) => j !== i) }))
                  }
                  aria-label={`Retirer le point ${i + 1}`}
                  className="flex-none rounded-sm border border-[#E0E0E0] px-3 text-sm text-[#595959] hover:border-[#C0392B] hover:text-[#C0392B]"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBrouillon((b) => ({ ...b, points: [...b.points, ""] }))}
              className="text-sm text-[#8A6E2A] underline underline-offset-4"
            >
              + Ajouter un point
            </button>
          </div>
        </Champ>

        <Champ
          label="Image de la carte"
          aide="JPEG, PNG, WebP ou AVIF, 5 Mo maximum. Format paysage recommandé (environ 1200 × 800)."
        >
          <div className="flex flex-wrap items-start gap-4">
            {brouillon.img ? (
              <img
                src={brouillon.img}
                alt=""
                className="h-24 w-36 flex-none rounded-sm object-cover"
              />
            ) : (
              <div className="grid h-24 w-36 flex-none place-items-center rounded-sm bg-[#F2F2F2] text-xs text-[#595959]">
                aucune image
              </div>
            )}
            <div className="flex-1">
              <input
                ref={fichierRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={choisirImage}
                disabled={televersement}
                className="block w-full text-sm file:mr-3 file:rounded-sm file:border file:border-[#E0E0E0] file:bg-white file:px-3 file:py-1.5 file:text-sm"
              />
              {televersement && <p className="mt-2 text-sm text-[#595959]">Téléversement…</p>}
              <input
                value={brouillon.img}
                onChange={(e) => set("img", e.target.value)}
                placeholder="/assets/img/droit-famille.jpg"
                className={`${inputClass} mt-2 text-xs`}
              />
              <p className="mt-1 text-xs text-[#595959]">
                Vous pouvez aussi coller un chemin existant du site.
              </p>
            </div>
          </div>
        </Champ>

        <label className="mt-6 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={brouillon.visible}
            onChange={(e) => set("visible", e.target.checked)}
            className="h-4 w-4"
          />
          Afficher ce domaine sur le site
        </label>

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
            disabled={envoi || televersement}
            className="rounded-sm bg-[#B8975A] px-5 py-2 text-sm font-semibold text-[#1a140a] hover:bg-[#C9A96E] disabled:opacity-60"
          >
            {envoi ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-sm border border-[#E0E0E0] px-3 py-2 text-sm outline-none focus:border-[#B8975A]";

function Champ({ label, aide, children }) {
  return (
    <div className="mt-6">
      <p className="text-sm font-medium">{label}</p>
      {aide && <p className="mb-1.5 text-xs text-[#595959]">{aide}</p>}
      {children}
    </div>
  );
}

/**
 * Message d'erreur présentable.
 *
 * Les erreurs Supabase remontent des codes Postgres que le cabinet ne peut pas
 * interpréter ; les deux qui arrivent réellement ici sont traduites.
 */
function lisible(err) {
  const brut = err?.message || String(err);
  if (brut.includes("Failed to fetch") || brut.includes("NetworkError")) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion internet, puis réessayez.";
  }
  if (err?.code === "23505" || brut.includes("duplicate key")) {
    return "Un domaine porte déjà cet identifiant. Changez le nom du domaine.";
  }
  if (brut.includes("row-level security") || err?.code === "42501") {
    return "Vous n'avez pas les droits pour cette modification. Reconnectez-vous.";
  }
  if (brut.includes("JWT") || brut.includes("token is expired")) {
    return "Votre session a expiré. Reconnectez-vous pour enregistrer vos modifications.";
  }
  return brut;
}
