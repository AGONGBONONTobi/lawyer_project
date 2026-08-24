import Reveal from "./Reveal";

export default function Hero({ sectionRef }) {
  return (
    <section className="hero" id="accueil" ref={sectionRef}>
      <div className="container hero-grid">

        {/* ── Colonne gauche : texte ───────────────────────────── */}
        <div className="hero-text">
          <Reveal as="p" className="eyebrow">
            Avocate — Barreau de Paris
          </Reveal>

          <Reveal as="h1" className="hero-title" delay="1">
            Maître<br />Moradéké<br />Badirou
          </Reveal>

          {/* Domaines — style liste verticale façon fashion hero */}
          <Reveal
            as="ul"
            className="hero-domains"
            delay="2"
            aria-label="Domaines d'intervention"
          >
            <li>Droit commercial</li>
            <li>Droit de la famille</li>
            <li>Droit des étrangers</li>
          </Reveal>

          {/* Description + CTA en bas */}
          <Reveal as="div" className="hero-bottom" delay="3">
            <p className="hero-lead">
              Consciencieuse, à l'écoute et réactive, Maître Badirou défend vos
              intérêts avec rigueur et engagement.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#contact">
                Prendre rendez-vous
              </a>
              <a className="btn btn-outline" href="tel:0671429695">
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-phone" />
                </svg>
                06 71 42 96 95
              </a>
            </div>
          </Reveal>
        </div>

        {/* ── Colonne droite : portrait ─────────────────────────── */}
        <Reveal as="figure" delay="2" className="hero-photo">
          <div className="hero-photo-frame">
            <img
              src="/assets/img/moradeke-badirou-portrait.jpg"
              alt="Portrait de Maître Moradéké Badirou"
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
