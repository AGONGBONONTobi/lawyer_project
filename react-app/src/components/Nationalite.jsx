import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { VOIES, ETAPES } from "../lib/nationalite";

export function TrustBand() {
  return <div className="trust-band"><div className="container trust-band-inner">
    <p><strong>Barreau de Paris</strong><span>Maître Moradéké Badirou</span></p>
    <p><strong>Français · English · Italiano</strong><span>Trois langues pour échanger</span></p>
    <p><strong>Au cabinet ou en visio</strong><span>Paris 17ᵉ · France entière</span></p>
    <p><strong>Honoraires annoncés</strong><span>Une convention avant d’agir</span></p>
  </div></div>;
}

export function NationalityPaths({ sectionRef }) {
  return <section className="section nationality-paths" id="nationalite" ref={sectionRef}>
    <div className="container">
      <Reveal className="section-head"><p className="eyebrow">Nationalité française</p>
        <h2>Tout ne commence pas<br />par une naturalisation.</h2>
        <p className="section-intro">Un parent, une histoire familiale, une vie en France. Plusieurs voies existent. Vous êtes peut-être déjà français sans le savoir.</p>
      </Reveal>
      <div className="path-grid">{VOIES.map((voie, i) => <Reveal as="article" key={voie.id} className="path-item" delay={String(i % 3 + 1)}>
        <span className="path-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
        <h3><Link to={`/nationalite#${voie.id}`}>{voie.title}<span aria-hidden="true"> ↗</span></Link></h3>
        <p>{voie.short}</p>
      </Reveal>)}
        <Reveal className="path-invitation"><p className="eyebrow">Et vous ?</p><h3>Commençons par votre situation.</h3>
          <Link to="/diagnostic" className="btn btn-primary">Faire le diagnostic <span aria-hidden="true">↗</span></Link>
        </Reveal>
      </div>
    </div>
  </section>;
}

export function Naturalisation() {
  return <section className="section naturalisation" id="naturalisation"><div className="container naturalisation-grid">
    <Reveal><p className="eyebrow">Naturalisation · 2026</p><h2>Bien préparer.<br /><em>Avant de déposer.</em></h2>
      <p className="section-intro">Les justificatifs et les exigences dépendent de votre procédure. Le Bilan permet de faire le point avant d’engager les démarches.</p>
      <a className="text-link" href="#contact">Parlons de votre dossier <span aria-hidden="true">↗</span></a>
    </Reveal>
    <div className="naturalisation-points">
      <Reveal className="naturalisation-point"><span className="path-number">B2</span><div><h3>Le niveau de français</h3><p>Depuis le 1er janvier 2026, le niveau B2 est exigé pour la naturalisation, la réintégration par décret et la déclaration par mariage, sous réserve des dispenses et aménagements applicables.</p></div></Reveal>
      <Reveal className="naturalisation-point" delay="1"><span className="path-number">01</span><div><h3>L’examen civique</h3><p>La naturalisation et la réintégration par décret nécessitent une attestation de réussite à l’examen civique. Les procédures par déclaration ne sont pas concernées par cet examen.</p></div></Reveal>
      <Reveal className="naturalisation-point" delay="2"><span className="path-number">02</span><div><h3>Une décision défavorable ?</h3><p>Ajournement, irrecevabilité ou refus : faites examiner rapidement la décision et sa notification. Les voies et délais de recours varient selon la procédure.</p></div></Reveal>
      <p className="source-note">Pour aller plus loin : <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F11926" target="_blank" rel="noreferrer">niveau de français</a> et <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F39426" target="_blank" rel="noreferrer">examen civique</a> sur Service Public.</p>
    </div>
  </div></section>;
}

export function Method({ sectionRef }) {
  return <section className="section" id="methode" ref={sectionRef}><div className="container">
    <Reveal className="section-head"><p className="eyebrow">La méthode</p><h2>Une étape après l’autre.<br />Un dossier suivi personnellement.</h2></Reveal>
    <ol className="method-steps">{ETAPES.map(([title, text], i) => <Reveal as="li" key={title} delay={String(i % 3 + 1)}><span className="eyebrow">0{i + 1}</span><h3>{title}</h3><p>{text}</p></Reveal>)}</ol>
  </div></section>;
}

export function Employers() {
  return <section className="section employers" id="employeurs"><div className="container employers-inner">
    <Reveal><p className="eyebrow">Employeurs · Ressources humaines</p><h2>Du diplôme<br /><em>au contrat.</em></h2></Reveal>
    <Reveal><p>Vous recrutez un jeune diplômé étranger ? Le cabinet vous accompagne pour préparer le changement de statut étudiant vers salarié et les démarches liées à l’embauche.</p>
      <dl className="employer-prices"><div><dt>Audit avant embauche</dt><dd>300 € HT · déductible du forfait</dd></div><div><dt>Forfait changement de statut</dt><dd>1 500 € HT · réglé par l’employeur</dd></div></dl>
      <a className="text-link" href="#contact">Échanger sur un recrutement <span aria-hidden="true">↗</span></a>
    </Reveal>
  </div></section>;
}
