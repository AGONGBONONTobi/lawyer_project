import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";
import PageMeta from "../components/PageMeta";
import { VOIES } from "../lib/nationalite";

export default function Nationalite() {
  return <LegalLayout eyebrow="Les voies d’accès" title="La nationalité française, selon votre histoire.">
    <PageMeta title="Nationalité française : les voies d’accès | Maître Badirou" description="Filiation, mariage, naturalisation, réintégration et voies familiales : découvrez les pistes à examiner avec Maître Moradéké Badirou, avocate à Paris 17e." />
    <p>Devenir français et faire reconnaître une nationalité que l’on possède déjà relèvent de démarches différentes. Ces premiers repères vous aident à préparer un échange avec le cabinet.</p>
    <p><Link className="btn btn-primary" to="/diagnostic">Faire mon diagnostic gratuit <span aria-hidden="true">↗</span></Link></p>
    {VOIES.map(voie => <section className="nationality-detail" id={voie.id} key={voie.id}><h2>{voie.title}</h2><p>{voie.text}</p>{voie.source && <a className="text-link" href={voie.source} target="_blank" rel="noreferrer">Consulter les informations officielles <span aria-hidden="true">↗</span></a>}</section>)}
    <section className="nationality-detail"><h2>Un ajournement ou un refus ?</h2><p>Transmettez rapidement votre décision au cabinet. Les délais et modalités de recours diffèrent selon qu’il s’agit d’une naturalisation, d’une déclaration ou d’un certificat de nationalité.</p><Link className="btn btn-primary" to="/#contact">Contacter le cabinet</Link></section>
    <p className="source-note">Informations générales, non exhaustives. Votre situation et les textes applicables doivent être examinés avant toute démarche.</p>
  </LegalLayout>;
}
