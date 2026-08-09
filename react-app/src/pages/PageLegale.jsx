import { useEffect, useState } from "react";
import LegalLayout from "./LegalLayout";
import TexteRiche from "../components/TexteRiche";
import { PAGES_PAR_DEFAUT, fetchPageLegale } from "../lib/pagesLegales";

/**
 * Rendu commun aux deux pages légales, à partir du contenu stocké en base.
 *
 * Comme pour les domaines d'expertise, le premier rendu utilise le contenu
 * livré avec le site puis la base prend le relais. Ces pages sont des
 * obligations réglementaires : elles ne doivent jamais s'afficher vides, même
 * le temps d'un aller-retour réseau.
 */
export default function PageLegale({ slug }) {
  const [page, setPage] = useState(PAGES_PAR_DEFAUT[slug]);

  useEffect(() => {
    let actif = true;
    setPage(PAGES_PAR_DEFAUT[slug]);
    fetchPageLegale(slug).then((p) => {
      if (actif) setPage(p);
    });
    return () => {
      actif = false;
    };
  }, [slug]);

  return (
    <LegalLayout title={page.titre} updated={page.maj}>
      {page.sections.map((s, i) => (
        <section className="legal-section" key={i}>
          {s.titre && <h2>{s.titre}</h2>}
          <TexteRiche texte={s.corps} />
        </section>
      ))}
    </LegalLayout>
  );
}
