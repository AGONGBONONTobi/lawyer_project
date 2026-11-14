// Données fictives de diagnostics par session pour le mode essai / dev.
// Ne contient aucune donnée personnelle réelle.
const STORAGE_KEY = "cabinet-diagnostics-essai-v1";

export function lireDiagnosticsEssai() {
  if (typeof window === "undefined") return [];
  const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
  if (stored) return stored;

  const initial = [
    {
      id: "a1b2c3d4-0001-4000-8000-111122223333",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      nom: "Amadou Diallo",
      email: "amadou.diallo@example.com",
      telephone: "06 12 34 56 78",
      commentaire: "J'ai reçu un courrier d'ajournement de la préfecture il y a deux semaines.",
      reponses: {
        naissance: "etranger",
        parent: "non",
        documents: "moins",
        perte: "non",
        residence: "cinq",
        age: "adulte",
        mariage: "non",
        enfant: "oui",
        fratrie: "non",
        langue: "b2",
        ressources: "oui",
        demande: "ajournement"
      },
      pistes: [
        { id: "recours", title: "Faire examiner votre décision rapidement", text: "Conservez la décision et sa notification. La nature du recours et son délai doivent être vérifiés sans attendre.", urgent: true },
        { id: "decret", title: "Examiner une naturalisation par décret", text: "Votre résidence, votre français et vos ressources sont des premiers points à étudier." }
      ],
      statut: "nouveau",
      rdv_debut: null,
      rdv_modalite: null
    },
    {
      id: "b2c3d4e5-0002-4000-8000-222233334444",
      created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
      nom: "Marie-Claire Dubois",
      email: "mc.dubois@example.com",
      telephone: "07 98 76 54 32",
      commentaire: "Mon grand-père était français de naissance. Je cherche à reconstituer les actes.",
      reponses: {
        naissance: "etranger",
        parent: "francais",
        documents: "dix",
        perte: "non",
        residence: "hors",
        age: "adulte",
        mariage: "non",
        enfant: "non",
        fratrie: "non",
        langue: "b2",
        ressources: "partie",
        demande: "non"
      },
      pistes: [
        { id: "filiation", title: "Vérifier votre nationalité par filiation", text: "Un parent français à votre naissance peut être une piste de reconnaissance de nationalité." },
        { id: "possession", title: "Examiner la possession d’état de Français", text: "Une possession d’état constante pendant les dix années précédant la déclaration peut ouvrir une voie spécifique." }
      ],
      statut: "contacte",
      rdv_debut: new Date(Date.now() + 3600000 * 48).toISOString(),
      rdv_modalite: "cabinet"
    }
  ];

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function enregistrerDiagnosticEssai(donnees) {
  const list = lireDiagnosticsEssai();
  const nouvelItem = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    nom: donnees.nom.trim(),
    email: donnees.email.trim().toLowerCase(),
    telephone: donnees.telephone?.trim() || null,
    commentaire: donnees.commentaire?.trim() || null,
    reponses: donnees.reponses,
    pistes: donnees.pistes,
    statut: "nouveau",
    rdv_debut: null,
    rdv_modalite: null
  };
  list.unshift(nouvelItem);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return nouvelItem.id;
}

export function majStatutDiagnosticEssai(id, statut) {
  const list = lireDiagnosticsEssai();
  const item = list.find(d => d.id === id);
  if (item) {
    item.statut = statut;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }
  return false;
}

export function supprimerDiagnosticEssai(id) {
  const list = lireDiagnosticsEssai().filter(d => d.id !== id);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return true;
}
