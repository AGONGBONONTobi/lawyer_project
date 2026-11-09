export const QUESTIONS = [
  { id: "naissance", title: "Où êtes-vous né(e) ?", options: [["france", "En France"], ["etranger", "À l’étranger"]] },
  { id: "parent", title: "L’un de vos parents était-il français à votre naissance, ou est-il né en France ?", options: [["francais", "Un parent était français à ma naissance"], ["ne-france", "Un parent est né en France, mais n’était pas français"], ["non", "Non"], ["inconnu", "Je ne sais pas"]] },
  { id: "documents", title: "Avez-vous déjà eu des documents français ?", hint: "Carte d’identité, passeport, carte d’électeur ou inscription consulaire.", options: [["dix", "Oui, pendant au moins 10 ans"], ["moins", "Oui, pendant moins de 10 ans"], ["non", "Non"]] },
  { id: "perte", title: "Avez-vous été français(e), puis perdu cette nationalité ?", options: [["oui", "Oui"], ["non", "Non"], ["inconnu", "Je ne sais pas"]] },
  { id: "residence", title: "Depuis combien de temps vivez-vous régulièrement en France ?", options: [["hors", "Je ne vis pas en France"], ["moins", "Moins de 5 ans"], ["cinq", "De 5 à moins de 10 ans"], ["dix", "De 10 à moins de 25 ans"], ["vingtcinq", "25 ans ou plus"]] },
  { id: "age", title: "Quelle est votre tranche d’âge ?", options: [["mineur", "Moins de 18 ans"], ["adulte", "De 18 à 64 ans"], ["senior", "65 ans ou plus"]] },
  { id: "mariage", title: "Êtes-vous marié(e) à une personne française ?", options: [["quatre", "Oui, depuis au moins 4 ans"], ["moins", "Oui, depuis moins de 4 ans"], ["non", "Non"]] },
  { id: "enfant", title: "Avez-vous un enfant ou un petit-enfant français ?", options: [["oui", "Oui"], ["non", "Non"]] },
  { id: "fratrie", title: "Un frère ou une sœur est-il devenu français, et vivez-vous en France depuis l’âge de 6 ans ?", options: [["deux", "Oui aux deux questions"], ["tard", "Un frère ou une sœur est français, mais je suis arrivé(e) plus tard"], ["non", "Non"]] },
  { id: "langue", title: "Quel niveau de français pouvez-vous justifier ?", options: [["b2", "B2 ou plus"], ["b1", "B1"], ["aucun", "Je n’ai pas de diplôme ou de test à ce jour"]] },
  { id: "ressources", title: "Votre situation professionnelle et vos ressources sont-elles stables depuis au moins 2 ans ?", options: [["oui", "Oui"], ["partie", "En partie"], ["non", "Non"]] },
  { id: "demande", title: "Avez-vous déjà déposé une demande de nationalité ?", options: [["non", "Non"], ["cours", "Une demande est en cours"], ["ajournement", "J’ai reçu un ajournement ou une irrecevabilité"], ["refus", "J’ai reçu un refus de naturalisation"], ["cnf", "J’ai reçu un refus de certificat de nationalité"]] },
];

// Orientation indicative, jamais une décision d’éligibilité. Les conditions
// non interrogées (état civil, scolarité, etc.) restent à étudier au Bilan.
export function orienter(a) {
  const pistes = [];
  const add = (id, title, text, urgent = false) => pistes.push({ id, title, text, urgent });
  if (["ajournement", "refus"].includes(a.demande)) add("recours", "Faire examiner votre décision rapidement", "Conservez la décision et sa notification. La nature du recours et son délai doivent être vérifiés sans attendre.", true);
  if (a.demande === "cnf") add("recours-cnf", "Examiner le refus de certificat de nationalité", "La contestation d’un refus de certificat suit une procédure distincte de la naturalisation. Faites vérifier la décision et les délais applicables.", true);
  if (a.parent === "francais") add("filiation", "Vérifier votre nationalité par filiation", "Un parent français à votre naissance peut être une piste de reconnaissance de nationalité. Les actes et la transmission de la nationalité doivent être examinés.");
  if (a.parent === "inconnu" || (a.naissance === "france" && a.parent === "ne-france")) add("origine", "Reconstituer votre histoire familiale", "Les lieux de naissance et la nationalité de vos parents peuvent être déterminants. Être né en France ou avoir un parent né en France ne permet pas, isolément, de conclure.");
  if (a.perte === "oui") add("reintegration", "Étudier une réintégration", "Le cabinet vérifiera la nationalité antérieure, les circonstances de sa perte et la procédure appropriée.");
  if (a.documents === "dix") add("possession", "Examiner la possession d’état de Français", "Une possession d’état constante pendant les dix années précédant la déclaration peut ouvrir une voie spécifique. La détention de documents doit être replacée dans son contexte.");
  if (a.age === "senior" && a.enfant === "oui" && a.residence === "vingtcinq") add("ascendant", "Étudier la déclaration comme ascendant de Français", "Votre âge, votre descendance et votre durée de résidence justifient d’examiner cette voie, sous réserve des autres conditions.");
  if (a.age !== "mineur" && a.fratrie === "deux") add("fratrie", "Vérifier la voie par un frère ou une sœur", "Il faudra notamment vérifier votre scolarité, la continuité du séjour et la façon dont votre frère ou votre sœur a acquis la nationalité.");
  if (a.age !== "mineur" && a.mariage === "quatre") add("mariage", "Étudier une déclaration par mariage", "La durée requise est parfois de cinq ans. La nationalité du conjoint, la communauté de vie et les autres conditions, dont le français, restent à examiner.");
  if (a.age !== "mineur" && ["cinq", "dix", "vingtcinq"].includes(a.residence)) add("decret", "Examiner une naturalisation par décret", a.langue === "b2" && a.ressources === "oui" ? "Votre résidence, votre français et vos ressources sont des premiers points à étudier. L’examen civique et les autres conditions doivent aussi être vérifiés ; aucune issue n’est garantie." : "La durée de résidence est un premier repère. Le niveau de français, les ressources, l’examen civique et les éventuelles dispenses seront examinés au Bilan.");
  if (a.age === "mineur") add("mineur", "Étudier les règles propres aux mineurs", "Naissance, résidence, filiation, adoption ou recueil : les règles dépendent de la situation de l’enfant. Un examen individuel est nécessaire.");
  if (!pistes.length) add("bilan", "Faire le point sur votre situation", "Ces réponses ne permettent pas de retenir une voie précise. Elles n’excluent pas une possibilité : des exceptions et d’autres situations existent, notamment en cas de naissance en France.");
  return pistes.slice(0, 3);
}
