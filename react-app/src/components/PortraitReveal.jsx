import Reveal from "./Reveal";

/**
 * Bandeau citation + engagements concrets.
 *
 * Remplace le portrait qui occupait la colonne de droite, retiré à la demande
 * de la cliente.
 *
 * Ces engagements sont volontairement factuels et chiffrés (délai, modalités,
 * langues). La section « Nos engagements » plus bas dans la page porte déjà la
 * posture du cabinet — écoute, transparence des honoraires, rigueur — et les
 * deux blocs se suivent à quelques écrans d'intervalle : reprendre ici les
 * mêmes promesses les aurait affaiblies toutes les deux.
 */
const ENGAGEMENTS = [
  {
    valeur: "Paris 17ᵉ",
    titre: "Sur place ou à distance",
    texte:
      "Rendez-vous au cabinet, ou en visioconférence pour les dossiers suivis hors Île-de-France.",
  },
  {
    valeur: "3 langues",
    titre: "Français · English · Italiano",
    texte:
      "Votre dossier peut être instruit et plaidé dans l'une de ces trois langues.",
  },
];

export default function PortraitReveal() {
  return (
    <section className="portrait-editorial">
      <div className="portrait-editorial-inner">

        {/* GAUCHE — citation */}
        <Reveal className="portrait-editorial-text">
          <div className="portrait-band-divider" style={{ marginBottom: "2rem" }}>
            <span />
            <i />
            <span />
          </div>

          <p className="portrait-band-quote">
            « Défendre avec <strong>rigueur</strong>, conseiller avec{" "}
            <strong>clarté</strong> et agir avec <strong>détermination</strong>. »
          </p>
        </Reveal>

        {/* DROITE — engagements */}
        <ul className="portrait-engagements">
          {ENGAGEMENTS.map((e, i) => (
            <Reveal as="li" key={e.titre} className="portrait-engagement" delay={String(i + 1)}>
              <span className="portrait-engagement-value">{e.valeur}</span>
              <span className="portrait-engagement-title">{e.titre}</span>
              <p className="portrait-engagement-text">{e.texte}</p>
            </Reveal>
          ))}
        </ul>

      </div>
    </section>
  );
}
