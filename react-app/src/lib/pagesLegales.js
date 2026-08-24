import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Contenu des pages légales, éditable depuis le back office.
 *
 * ── Pourquoi un repli en dur ────────────────────────────────────────────────
 * Les mentions légales et la politique de confidentialité sont des obligations
 * réglementaires : leur absence expose le cabinet. Une coupure Supabase ne doit
 * donc jamais laisser ces pages vides. Le contenu ci-dessous est rendu tant que
 * la base ne répond pas, ou tant qu'aucune version n'y a été enregistrée.
 *
 * C'est aussi la source unique du contenu initial : le back office propose de
 * l'importer en base d'un clic, plutôt que de le dupliquer dans le script SQL
 * où les deux versions finiraient par diverger.
 */

/** Marqueur des informations que le cabinet doit encore fournir. */
export const A_COMPLETER = /\[à compléter[^\]]*\]/gi;

export const PAGES_PAR_DEFAUT = {
  "mentions-legales": {
    slug: "mentions-legales",
    titre: "Mentions légales",
    maj: "2026",
    sections: [
      {
        titre: "Éditeur du site",
        corps: `Le présent site est édité par **Maître Moradéké Badirou**, avocate au Barreau de Paris, exerçant à titre individuel.

- **Adresse professionnelle** : 2 Rue Mariotte, 75017 Paris
- **Téléphone** : [06 71 42 96 95](tel:0671429695)
- **Email** : [moradeke.badirou@avocat.fr](mailto:moradeke.badirou@avocat.fr)
- **Forme d'exercice** : exercice individuel — profession libérale
- **SIRET** : [à compléter : numéro SIRET]
- **TVA intracommunautaire** : [à compléter : n° TVA] (l'avocat est assujetti à la TVA)
- **Directrice de la publication** : Maître Moradéké Badirou

> Exerçant à titre individuel en profession libérale, le cabinet n'est pas immatriculé au Registre du commerce et des sociétés : le SIRET tient lieu d'identifiant. Un numéro RCS ne serait à mentionner que si l'activité était exercée sous forme de société commerciale.`,
      },
      {
        titre: "Profession réglementée",
        corps: `Maître Moradéké Badirou est inscrite au **Barreau de Paris** (toque [à compléter : numéro de toque]) et a prêté serment en février 2024. En sa qualité d'avocate, elle est soumise aux règles professionnelles et déontologiques de la profession :

- le **Règlement Intérieur National** (RIN) de la profession d'avocat ;
- le Règlement Intérieur du Barreau de Paris ;
- l'autorité de contrôle : l'**Ordre des avocats de Paris**, 11 place Dauphine, 75001 Paris.

Le titre d'avocat est protégé et régi par la loi n° 71-1130 du 31 décembre 1971.`,
      },
      {
        titre: "Assurances",
        corps: `Conformément à la réglementation, Maître Badirou bénéficie, par l'intermédiaire du Barreau de Paris, d'une **assurance de responsabilité civile professionnelle** et d'une garantie de représentation des fonds. Assureur et couverture géographique (France) : [à compléter : coordonnées de l'assureur].`,
      },
      {
        titre: "Hébergement",
        corps: `Le site est hébergé par :

- **Hébergeur** : IONOS SARL
- **Adresse** : 7 place de la Gare, 57200 Sarreguemines, France
- **Téléphone** : [0970 808 911](tel:0970808911)
- **RCS** : Sarreguemines 431 303 775
- **Site** : [ionos.fr](https://www.ionos.fr)`,
      },
      {
        titre: "Propriété intellectuelle",
        corps: `L'ensemble des contenus présents sur ce site (textes, éléments graphiques, logo, mise en page) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable, est interdite.`,
      },
      {
        titre: "Médiation de la consommation",
        corps: `Conformément aux articles L.612-1 et suivants du Code de la consommation, tout client consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige qui l'opposerait à son avocat.

Le médiateur compétent pour la profession d'avocat est :

- **Médiateur** : Médiateur de la consommation de la profession d'avocat
- **Adresse** : 180 boulevard Haussmann, 75008 Paris
- **Site** : [mediateur-consommation-avocat.fr](https://mediateur-consommation-avocat.fr)

> À vérifier avant mise en ligne : le médiateur désigné par le Conseil National des Barreaux (CNB) peut évoluer — confirmer le nom et les coordonnées à jour sur le site du CNB.`,
      },
      {
        titre: "Données personnelles",
        corps: `Le traitement des données collectées via ce site est détaillé dans la [Politique de confidentialité](/confidentialite).`,
      },
      {
        titre: "Droit applicable",
        corps: `Le présent site et ses mentions légales sont soumis au droit français.`,
      },
    ],
  },

  confidentialite: {
    slug: "confidentialite",
    titre: "Politique de confidentialité",
    maj: "2026",
    sections: [
      {
        titre: "",
        corps: `La présente politique décrit la manière dont les données personnelles collectées sur ce site sont traitées, conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi n° 78-17 du 6 janvier 1978 dite « Informatique et Libertés ».`,
      },
      {
        titre: "Responsable du traitement",
        corps: `Le responsable du traitement des données est **Maître Moradéké Badirou**, avocate au Barreau de Paris, 2 Rue Mariotte, 75017 Paris — [moradeke.badirou@avocat.fr](mailto:moradeke.badirou@avocat.fr).`,
      },
      {
        titre: "Données collectées",
        corps: `Les données personnelles sont collectées uniquement lorsque vous remplissez le formulaire de contact. Sont alors recueillis :

- votre nom complet ;
- votre adresse email ;
- votre numéro de téléphone (facultatif) ;
- l'objet de votre demande et le contenu de votre message.

Aucune donnée n'est collectée à votre insu et le site n'utilise pas de profilage ni de décision automatisée.`,
      },
      {
        titre: "Finalités et base légale",
        corps: `- **Répondre à votre demande de contact** et, le cas échéant, organiser un premier rendez-vous — base légale : votre consentement et les mesures précontractuelles prises à votre demande (art. 6.1.a et 6.1.b du RGPD).

Les informations transmises peuvent, si une relation client est établie, être couvertes par le **secret professionnel de l'avocat**.`,
      },
      {
        titre: "Destinataires et sous-traitants",
        corps: `Les données issues du formulaire sont destinées exclusivement à Maître Badirou et ne sont ni vendues, ni cédées, ni communiquées à des tiers à des fins commerciales.

L'envoi du formulaire est techniquement assuré par le service **EmailJS** (EmailJS Inc.), qui achemine votre message vers la messagerie du cabinet en qualité de sous-traitant. À ce titre, les données saisies transitent par ce prestataire. Voir la politique de confidentialité d'EmailJS : [emailjs.com/legal/privacy-policy](https://www.emailjs.com/legal/privacy-policy/).

L'affichage de certains contenus du site (domaines d'intervention, présentes pages légales) s'appuie sur **Supabase**, qui héberge la base de données du site en qualité de sous-traitant. La consultation du site implique une connexion technique à ses serveurs, au cours de laquelle votre adresse IP est traitée. Voir : [supabase.com/privacy](https://supabase.com/privacy).

Le site est hébergé par **IONOS SARL**, dont les serveurs sont situés dans l'Union européenne.

> Si le mode d'envoi du formulaire est modifié (ex. envoi direct par messagerie, autre prestataire), cette section doit être mise à jour en conséquence.`,
      },
      {
        titre: "Durée de conservation",
        corps: `Les données transmises via le formulaire sont conservées le temps nécessaire au traitement de votre demande. En l'absence de suite, elles sont supprimées dans un délai maximal de **3 ans**. En cas d'ouverture d'un dossier, les données sont conservées conformément aux obligations légales de conservation applicables à la profession d'avocat.`,
      },
      {
        titre: "Transfert hors de l'Union européenne",
        corps: `Certains prestataires techniques du site (envoi du formulaire, base de données) peuvent être établis hors de l'Union européenne : un transfert de données hors UE est donc susceptible d'intervenir. Ces transferts sont encadrés par les garanties prévues par le RGPD, notamment les clauses contractuelles types. Aucun autre transfert hors UE n'est réalisé.

> À vérifier : la région d'hébergement du projet Supabase. Si elle est située dans l'Union européenne, cette section peut être précisée en conséquence.`,
      },
      {
        titre: "Vos droits",
        corps: `Conformément au RGPD, vous disposez des droits suivants sur vos données :

- droit d'accès, de rectification et d'effacement ;
- droit à la limitation et droit d'opposition au traitement ;
- droit à la portabilité de vos données ;
- droit de définir des directives relatives au sort de vos données après votre décès.

Pour exercer ces droits, écrivez à [moradeke.badirou@avocat.fr](mailto:moradeke.badirou@avocat.fr). Une réponse vous sera apportée dans un délai d'un mois.

Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : [www.cnil.fr](https://www.cnil.fr).`,
      },
      {
        titre: "Cookies",
        corps: `En l'état, ce site **n'utilise aucun cookie de mesure d'audience, de publicité ou de traçage**, et ne dépose donc pas de traceur nécessitant votre consentement.

Les polices de caractères sont chargées depuis Google Fonts, ce qui implique une connexion aux serveurs de Google (adresse IP). Si des outils de mesure d'audience (ex. Matomo, Google Analytics) sont ajoutés ultérieurement, un bandeau de consentement conforme aux recommandations de la CNIL sera mis en place et cette section mise à jour.

> L'espace d'administration du site dépose un cookie de session, strictement nécessaire à la connexion du cabinet. Il ne concerne pas les visiteurs et ne requiert pas de consentement.`,
      },
      {
        titre: "Sécurité",
        corps: `Le site est servi via une connexion chiffrée (HTTPS) et les mesures raisonnables sont prises pour protéger les données contre tout accès non autorisé.`,
      },
    ],
  },
};

const CHAMPS = "slug, titre, maj, sections, updated_at";

/** Contenu d'une page légale. Ne rejette jamais : retombe sur le contenu livré. */
export async function fetchPageLegale(slug) {
  const defaut = PAGES_PAR_DEFAUT[slug];
  if (!isSupabaseConfigured) return defaut;

  try {
    const { data, error } = await supabase
      .from("pages_legales")
      .select(CHAMPS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data || !Array.isArray(data.sections) || data.sections.length === 0) return defaut;
    return data;
  } catch (err) {
    console.error(`Page légale « ${slug} » : lecture impossible, repli sur le contenu livré.`, err);
    return defaut;
  }
}

/** Les deux pages, pour le back office. Rejette en cas d'erreur. */
export async function fetchToutesPagesLegales() {
  requireSupabase();
  const { data, error } = await supabase.from("pages_legales").select(CHAMPS).order("slug");
  if (error) throw error;
  return data ?? [];
}

export async function majPageLegale(slug, champs) {
  requireSupabase();
  const { data, error } = await supabase
    .from("pages_legales")
    .upsert({ slug, ...champs }, { onConflict: "slug" })
    .select(CHAMPS)
    .single();

  if (error) throw error;
  return data;
}

/** Écrit en base le contenu livré avec le site, pour amorcer l'édition. */
export async function importerContenuLivre() {
  requireSupabase();
  const lignes = Object.values(PAGES_PAR_DEFAUT).map(({ slug, titre, maj, sections }) => ({
    slug,
    titre,
    maj,
    sections,
  }));

  const { data, error } = await supabase
    .from("pages_legales")
    .upsert(lignes, { onConflict: "slug" })
    .select(CHAMPS);

  if (error) throw error;
  return data;
}

/** Nombre de mentions « [à compléter : … ] » restant dans une page. */
export function compterAComPleter(page) {
  return page.sections.reduce(
    (n, s) => n + (s.corps.match(A_COMPLETER)?.length ?? 0),
    0
  );
}

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase n'est pas configuré. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
    );
  }
}

/**
 * La table n'a pas encore été créée dans Supabase.
 *
 * PostgREST renvoie « Could not find the table … in the schema cache » et le
 * code PGRST205 — pas le « does not exist » de Postgres, qu'on n'atteint jamais
 * puisque la requête est rejetée avant d'arriver à la base.
 */
export function tableManquante(err) {
  const brut = err?.message || String(err);
  return err?.code === "PGRST205" || brut.includes("Could not find the table");
}
