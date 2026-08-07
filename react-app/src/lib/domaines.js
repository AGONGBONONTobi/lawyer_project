import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Accès aux domaines d'expertise.
 *
 * Le site public lit `fetchDomainesPublies()`. Le back office utilise le reste.
 *
 * ── Pourquoi un repli en dur ────────────────────────────────────────────────
 * C'est le site en production d'un cabinet. Une coupure Supabase, une clé
 * expirée ou un déploiement sans variables d'environnement ne doivent pas
 * afficher une section vide à la place des domaines d'intervention. En cas
 * d'échec, on rend les trois domaines d'origine — le visiteur voit un contenu
 * juste, simplement pas le dernier.
 */

export const DOMAINES_PAR_DEFAUT = [
  {
    slug: "commercial",
    domain: "Droit commercial",
    subtitle: "Contrats · créances · contentieux",
    points: [
      "Rédaction et négociation de contrats commerciaux",
      "Recouvrement de créances et rupture abusive",
      "Contentieux judiciaire et médiation",
    ],
    img: "/assets/img/droit-commerce.jpg",
  },
  {
    slug: "famille",
    domain: "Droit de la famille",
    subtitle: "Divorce · garde · violences conjugales",
    points: [
      "Divorce contentieux et à l'amiable",
      "Garde des enfants et pension alimentaire",
      "Protection face aux violences conjugales",
    ],
    img: "/assets/img/droit-famille.jpg",
  },
  {
    slug: "etrangers",
    domain: "Droit des étrangers",
    subtitle: "Visa · naturalisation · OQTF",
    points: [
      "Demandes de titre de séjour et renouvellement",
      "Recours contre OQTF et refus de visa",
      "Procédures de naturalisation",
    ],
    img: "/assets/img/notre-dame.jpg",
  },
];

const CHAMPS = "id, slug, domain, subtitle, points, img, position, visible";

/** Domaines visibles, ordonnés — pour le site public. Ne rejette jamais. */
export async function fetchDomainesPublies() {
  if (!isSupabaseConfigured) return DOMAINES_PAR_DEFAUT;

  try {
    const { data, error } = await supabase
      .from("domaines")
      .select(CHAMPS)
      .eq("visible", true)
      .order("position", { ascending: true });

    if (error) throw error;
    // Une table vide est probablement une amorce oubliée, pas un choix
    // éditorial : mieux vaut les trois domaines d'origine qu'une section vide.
    if (!data || data.length === 0) return DOMAINES_PAR_DEFAUT;
    return data;
  } catch (err) {
    console.error("Domaines : lecture Supabase impossible, repli sur les valeurs par défaut.", err);
    return DOMAINES_PAR_DEFAUT;
  }
}

/** Tous les domaines, masqués compris — pour le back office. Rejette en cas d'erreur. */
export async function fetchTousDomaines() {
  requireSupabase();
  const { data, error } = await supabase
    .from("domaines")
    .select(CHAMPS)
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function creerDomaine(domaine) {
  requireSupabase();
  const { data, error } = await supabase
    .from("domaines")
    .insert(nettoyer(domaine))
    .select(CHAMPS)
    .single();

  if (error) throw error;
  return data;
}

export async function majDomaine(id, champs) {
  requireSupabase();
  const { data, error } = await supabase
    .from("domaines")
    .update(nettoyer(champs))
    .eq("id", id)
    .select(CHAMPS)
    .single();

  if (error) throw error;
  return data;
}

export async function supprimerDomaine(id) {
  requireSupabase();
  const { error } = await supabase.from("domaines").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Réécrit les positions d'après l'ordre de la liste reçue.
 *
 * Envoyé en une passe : si l'onglet est fermé au milieu, on préfère un ordre
 * partiellement appliqué à un ordre incohérent moitié ancien moitié nouveau.
 */
export async function reordonner(domainesOrdonnes) {
  requireSupabase();
  const maj = domainesOrdonnes.map((d, i) =>
    supabase.from("domaines").update({ position: i + 1 }).eq("id", d.id)
  );
  const resultats = await Promise.all(maj);
  const echec = resultats.find((r) => r.error);
  if (echec) throw echec.error;
}

const TAILLE_MAX_IMAGE = 5 * 1024 * 1024;
const TYPES_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Téléverse une image dans le bucket `domaines` et renvoie son URL publique.
 *
 * Le nom du fichier est reconstruit à partir du slug et de l'horodatage : un
 * nom d'origine peut contenir des espaces, des accents ou un chemin, que
 * Storage refuse ou tronque silencieusement.
 */
export async function televerserImage(fichier, slug) {
  requireSupabase();

  if (!TYPES_IMAGE.includes(fichier.type)) {
    throw new Error("Format non accepté. Utilisez un JPEG, un PNG, un WebP ou un AVIF.");
  }
  if (fichier.size > TAILLE_MAX_IMAGE) {
    throw new Error(
      `Image trop lourde (${(fichier.size / 1024 / 1024).toFixed(1)} Mo). Maximum 5 Mo.`
    );
  }

  const extension = fichier.name.split(".").pop()?.toLowerCase() || "jpg";
  const chemin = `${slug || "domaine"}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("domaines")
    .upload(chemin, fichier, { cacheControl: "31536000", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("domaines").getPublicUrl(chemin);
  return data.publicUrl;
}

/** Slug court, stable et sans accent, dérivé du nom du domaine. */
export function slugifier(texte) {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function nettoyer(champs) {
  const sortie = { ...champs };
  // Colonnes tenues par la base : les envoyer ferait échouer l'écriture.
  delete sortie.id;
  delete sortie.updated_at;
  if (Array.isArray(sortie.points)) {
    sortie.points = sortie.points.map((p) => p.trim()).filter(Boolean);
  }
  return sortie;
}

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase n'est pas configuré. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
    );
  }
}
