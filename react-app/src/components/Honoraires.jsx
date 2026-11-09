import Reveal from "./Reveal";

const OFFRES = [
  { title: "Bilan nationalité", price: "150 €", detail: "TTC · 1 heure", text: "Vérification de la voie, des pièces et des points de vigilance. Un calendrier et un devis adaptés à votre situation.", note: "Déduit du forfait si vous confiez votre dossier au cabinet.", cta: "Réserver mon Bilan" },
  { title: "Naturalisation", price: "2 160 €", detail: "TTC · 1 800 € HT", text: "Constitution du dossier, dépôt, suivi et préparation de l’entretien. Un accompagnement de bout en bout.", note: "Paiement en trois fois possible.", cta: "Préparer mon dossier" },
  { title: "Recours", price: "Dès 1 800 €", detail: "TTC · 1 500 € HT", text: "Analyse d’un ajournement, d’une irrecevabilité, d’un refus de naturalisation ou de certificat de nationalité.", note: "La stratégie et les délais sont étudiés à partir de votre décision.", cta: "Faire examiner ma décision" },
];

export default function Honoraires({ sectionRef }) {
  return (
    <section className="section nationality-fees" id="honoraires" ref={sectionRef}>
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Honoraires</p>
          <h2>Un cadre clair, dès le départ.</h2>
          <p className="section-intro">Vous connaissez le périmètre de l’accompagnement et son coût avant de vous engager.</p>
        </Reveal>
        <div className="nationality-fee-grid">
          {OFFRES.map((offre, i) => (
            <Reveal as="article" className="nationality-fee" key={offre.title} delay={String(i + 1)}>
              <p className="eyebrow">0{i + 1}</p>
              <h3>{offre.title}</h3>
              <p className="nationality-price">{offre.price}</p>
              <p className="fee-detail">{offre.detail}</p>
              <p>{offre.text}</p>
              <p className="fee-note">{offre.note}</p>
              <a href="#contact" className={`btn ${i === 0 ? "btn-primary" : "btn-outline"}`}>{offre.cta}</a>
            </Reveal>
          ))}
        </div>
        <Reveal className="fee-conditions">
          <p><strong>Voies spécifiques :</strong> certificat de nationalité, réintégration et déclarations familiales sur devis après le Bilan. Option francisation du nom ou du prénom : 360 € TTC (300 € HT).</p>
          <p>Une convention d’honoraires est signée avant toute diligence. Frais administratifs, traductions et débours non compris. Aucun résultat ne peut être garanti.</p>
        </Reveal>
      </div>
    </section>
  );
}
