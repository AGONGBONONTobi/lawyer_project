import Reveal from "./Reveal";
import DomainCards from "./DomainCards";

export default function Competences({ sectionRef }) {
  return (
    <section className="section section-alt" id="competences" ref={sectionRef}>
      <div className="container">
        <Reveal as="div" className="section-head">
          <p className="eyebrow">Autres domaines</p>
          <h2>Le cabinet vous accompagne aussi.</h2>
          <p className="section-intro">
            Titres de séjour, vie familiale et activité professionnelle : le cabinet
            continue de vous conseiller et de vous défendre dans ses autres domaines d’intervention.
          </p>
        </Reveal>
        
        <DomainCards />
      </div>
    </section>
  );
}
