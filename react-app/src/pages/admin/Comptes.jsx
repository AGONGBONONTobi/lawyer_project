import { useEffect, useState } from "react";
import { AdminShell } from "./AdminLayout";
import { supabase } from "../../lib/supabase";

/**
 * Gestion des comptes administrateurs.
 *
 * Toutes les opérations sur les comptes sont effectuées via une Edge Function
 * Supabase (`manage-users`) qui tourne côté serveur et utilise la
 * service_role key. La clé service_role ne transite jamais dans le navigateur.
 */

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`;

async function edgeFetch(method, opts = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Non authentifié.");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const init = { method, headers };
  if (opts.body) init.body = JSON.stringify(opts.body);

  const url = opts.params
    ? `${EDGE_URL}?${new URLSearchParams(opts.params)}`
    : EDGE_URL;

  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(json.error ?? `Erreur HTTP ${res.status}`);
  return json;
}

export default function Comptes() {
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  // Formulaire création
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [suppressionId, setSuppressionId] = useState(null);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    setChargement(true);
    setErreur("");
    try {
      const data = await edgeFetch("GET");
      setComptes(data.users ?? []);
    } catch (err) {
      setErreur("Impossible de charger les comptes : " + err.message);
    } finally {
      setChargement(false);
    }
  }

  async function creerCompte(e) {
    e.preventDefault();
    setErreur("");
    setMessage("");
    setEnvoi(true);
    try {
      await edgeFetch("POST", { body: { email, password: motDePasse } });
      setMessage(`Compte créé pour ${email}.`);
      setEmail("");
      setMotDePasse("");
      await charger();
    } catch (err) {
      setErreur("Erreur lors de la création : " + err.message);
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimerCompte(id, emailCompte) {
    if (!window.confirm(`Supprimer le compte ${emailCompte} ? Cette action est irréversible.`)) return;
    setSuppressionId(id);
    setErreur("");
    setMessage("");
    try {
      await edgeFetch("DELETE", { params: { id } });
      setMessage(`Compte ${emailCompte} supprimé.`);
      await charger();
    } catch (err) {
      setErreur("Erreur lors de la suppression : " + err.message);
    } finally {
      setSuppressionId(null);
    }
  }

  return (
    <AdminShell
      titre="Comptes administrateurs"
      sousTitre="Gérez les comptes qui peuvent accéder au back office. Le mot de passe doit comporter au moins 6 caractères."
    >
      {/* ── Tableau des comptes existants ─────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-xl">Comptes existants</h2>

        {chargement && (
          <p className="text-sm text-[#595959]">Chargement…</p>
        )}

        {!chargement && comptes.length === 0 && (
          <div className="rounded-sm border border-dashed border-[#E0E0E0] px-6 py-8 text-center text-sm text-[#595959]">
            Aucun compte pour l'instant. Créez le premier compte ci-dessous.
          </div>
        )}

        {!chargement && comptes.length > 0 && (
          <div className="overflow-x-auto rounded-sm border border-[#E0E0E0] bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E0E0E0] bg-[#F7F5F1]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[#595959]">Adresse e-mail</th>
                  <th className="px-4 py-3 text-left font-medium text-[#595959]">Créé le</th>
                  <th className="px-4 py-3 text-left font-medium text-[#595959]">Dernière connexion</th>
                  <th className="px-4 py-3 text-right font-medium text-[#595959]">Action</th>
                </tr>
              </thead>
              <tbody>
                {comptes.map((c) => (
                  <tr key={c.id} className="border-b border-[#F2F2F2] last:border-0 hover:bg-[#FDFAF5]">
                    <td className="px-4 py-3 font-medium">{c.email}</td>
                    <td className="px-4 py-3 text-[#595959]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#595959]">
                      {c.last_sign_in_at
                        ? new Date(c.last_sign_in_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Jamais"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => supprimerCompte(c.id, c.email)}
                        disabled={suppressionId === c.id}
                        className="rounded-sm border border-[#E0E0E0] px-3 py-1 text-xs text-[#C0392B] hover:border-[#C0392B] disabled:opacity-50"
                      >
                        {suppressionId === c.id ? "Suppression…" : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Création d'un nouveau compte ───────────────────────────────── */}
      <section>
        <h2 className="mb-4 font-serif text-xl">Créer un nouveau compte</h2>
        <form
          onSubmit={creerCompte}
          className="rounded-sm border border-[#E0E0E0] bg-white p-6"
          style={{ maxWidth: 480 }}
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium" htmlFor="new-email">
              Adresse e-mail
            </label>
            <input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@gmail.com"
              className="w-full rounded-sm border border-[#E0E0E0] px-3 py-2 text-sm outline-none focus:border-[#B8975A]"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium" htmlFor="new-mdp">
              Mot de passe <span className="font-normal text-[#595959]">(6 caractères min.)</span>
            </label>
            <input
              id="new-mdp"
              type="password"
              required
              minLength={6}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-sm border border-[#E0E0E0] px-3 py-2 text-sm outline-none focus:border-[#B8975A]"
            />
          </div>

          {message && (
            <p className="mb-4 rounded-sm bg-[#EBF5EB] px-3 py-2 text-sm text-[#27743A]">{message}</p>
          )}
          {erreur && (
            <p className="mb-4 rounded-sm bg-[#FCEDEB] px-3 py-2 text-sm text-[#C0392B]">{erreur}</p>
          )}

          <button
            type="submit"
            disabled={envoi}
            className="w-full rounded-sm bg-[#B8975A] px-4 py-2.5 text-sm font-semibold tracking-wide text-[#1a140a] transition hover:bg-[#C9A96E] disabled:opacity-60"
          >
            {envoi ? "Création en cours…" : "Créer le compte"}
          </button>
        </form>

        <p className="mt-4 text-xs leading-relaxed text-[#595959]">
          Les comptes créés ici ont accès à l'intégralité du back office (domaines, pages légales, comptes).
          Ne partagez jamais les identifiants — chaque utilisateur doit avoir son propre compte.
        </p>
      </section>
    </AdminShell>
  );
}
