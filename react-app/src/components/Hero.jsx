import Reveal from "./Reveal";
import { Link } from "react-router-dom";

export default function Hero({ sectionRef }) {
  return (
    <section className="hero" id="accueil" ref={sectionRef}>
      <div className="container hero-grid">

        {/* ── Colonne gauche : texte ───────────────────────────── */}
        <div className="hero-text">
          <Reveal as="p" className="eyebrow">
            Maître Moradéké Badirou · Barreau de Paris
          </Reveal>

          <Reveal as="h1" className="hero-title" delay="1">
            Devenez français.<br /><em>Ou vérifiez si vous l’êtes déjà.</em>
          </Reveal>

          {/* Domaines — style liste verticale façon fashion hero */}
          <Reveal as="p" className="hero-specialty" delay="2">
            Avocate en droit des étrangers et de la nationalité
          </Reveal>

          {/* Description + CTA en bas */}
          <Reveal as="div" className="hero-bottom" delay="3">
            <p className="hero-lead">
              Naturalisation, liens familiaux, nationalité à faire reconnaître.
              Identifions la voie adaptée à votre histoire, avant de constituer votre dossier.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/diagnostic">
                Faire mon diagnostic gratuit <span aria-hidden="true">↗</span>
              </Link>
              <a className="btn btn-outline" href="#contact">
                Réserver un Bilan nationalité
              </a>
            </div>
            <p className="hero-note">12 questions · Environ 3 minutes · Sans engagement</p>
          </Reveal>
        </div>

        {/* ── Colonne droite : portrait ─────────────────────────── */}
        <Reveal as="figure" delay="2" className="hero-photo">
          <div className="hero-photo-frame">
            <img
              src="/assets/img/moradeke-badirou-portrait.jpg"
              alt="Portrait de Maître Moradéké Badirou"
              width="640"
              height="853"
              fetchPriority="high"
            />
            <span className="hero-photo-accent" aria-hidden="true" />
          </div>
          <figcaption>
            Moradéké Badirou — Paris, 17<sup>e</sup>
          </figcaption>
        </Reveal>

      </div>
    </section>
  );
}
