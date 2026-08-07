import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { DOMAINES_PAR_DEFAUT, fetchDomainesPublies } from "../lib/domaines";

function DomainCard({ domain, subtitle, points, img, delay }) {
  return (
    <Reveal as="article" className="domain-card" delay={delay}>
      <div className="domain-card-img" aria-hidden="true">
        <img src={img} alt="" loading="lazy" />
        <div className="domain-card-overlay" />
        <div className="domain-card-shine" />
      </div>
      <div className="domain-card-body">
        <p className="eyebrow domain-card-eyebrow">{subtitle}</p>
        <h3 className="domain-card-title">{domain}</h3>
        <ul className="domain-card-points">
          {points.map((p) => (
            <li key={p}>
              <span className="domain-card-bullet" aria-hidden="true">—</span>
              {p}
            </li>
          ))}
        </ul>
        <a href="#contact" className="domain-card-cta">
          Consulter
          <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </Reveal>
  );
}

/**
 * Cartes des domaines d'intervention.
 *
 * Le premier rendu utilise les domaines livrés en dur, puis la base prend le
 * relais. C'est volontaire : afficher tout de suite un contenu juste vaut mieux
 * qu'un vide ou un squelette le temps d'un aller-retour réseau, sur une section
 * qui est le cœur de l'argumentaire du cabinet. `fetchDomainesPublies` ne
 * rejette jamais — en cas d'échec, on reste simplement sur ce premier rendu.
 */
export default function DomainCards({ dossiers }) {
  const [domaines, setDomaines] = useState(DOMAINES_PAR_DEFAUT);

  useEffect(() => {
    if (dossiers) return; // liste imposée par l'appelant : pas de lecture
    let actif = true;
    fetchDomainesPublies().then((d) => {
      if (actif) setDomaines(d);
    });
    return () => {
      actif = false;
    };
  }, [dossiers]);

  const liste = dossiers ?? domaines;

  return (
    <div className="domain-cards-grid">
      {liste.map((d, i) => (
        <DomainCard key={d.slug ?? d.id} {...d} delay={String(i + 1)} />
      ))}
    </div>
  );
}
