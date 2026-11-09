import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";
import PageMeta from "../components/PageMeta";
import { QUESTIONS, orienter } from "../lib/diagnostic";

export default function Diagnostic() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const heading = useRef(null);
  const firstRender = useRef(true);
  const question = QUESTIONS[step];
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus();
  }, [step, finished]);

  function next(e) {
    e.preventDefault();
    if (!answers[question.id]) return;
    if (step === QUESTIONS.length - 1) setFinished(true);
    else setStep(s => s + 1);
  }

  return <LegalLayout eyebrow="Diagnostic gratuit · Environ 3 minutes" title="Commençons par votre situation.">
    <PageMeta title="Diagnostic nationalité gratuit | Maître Moradéké Badirou" description="12 questions pour identifier des pistes à examiner avec une avocate. Diagnostic indicatif et gratuit sur la nationalité française, sans engagement." />
    <p className="diagnostic-disclaimer">Ce diagnostic n’est pas une consultation juridique. Il propose des pistes à vérifier, sans confirmer votre nationalité ni votre éligibilité.</p>
    <p className="source-note">Vos réponses restent dans cette page pendant le questionnaire. Elles ne sont ni enregistrées ni transmises au cabinet. Fermer ou actualiser la page les efface.</p>
    {finished ? <div className="diagnostic-results">
      <h2 ref={heading} tabIndex={-1}>Vos premières pistes</h2>
      {orienter(answers).map(piste => <article key={piste.id} className={`diagnostic-result ${piste.urgent ? "is-urgent" : ""}`}>{piste.urgent && <p className="eyebrow">À examiner rapidement</p>}<h3>{piste.title}</h3><p>{piste.text}</p></article>)}
      <p>Le Bilan nationalité permet d’examiner les pièces et les conditions propres à votre dossier. Il dure une heure, au cabinet ou en visio : 150 € TTC, déduits du forfait si vous confiez votre dossier au cabinet.</p>
      <Link className="btn btn-primary" to="/#contact">Demander un Bilan nationalité <span aria-hidden="true">↗</span></Link>
      <button className="diagnostic-restart text-link" onClick={() => { setAnswers({}); setStep(0); setFinished(false); }}>Recommencer le diagnostic</button>
    </div> : <form className="diagnostic-form" onSubmit={next}>
      <div className="diagnostic-progress"><span id="diagnostic-progress-label">Question {step + 1} sur {QUESTIONS.length}</span><progress aria-labelledby="diagnostic-progress-label" value={step + 1} max={QUESTIONS.length} /></div>
      <fieldset key={question.id}>
        <legend ref={heading} tabIndex={-1}>{question.title}</legend>
        {question.hint && <p className="source-note">{question.hint}</p>}
        <div className="diagnostic-options">{question.options.map(([value, label]) => <label key={value} className={`diagnostic-option ${answers[question.id] === value ? "is-selected" : ""}`}>
          <input type="radio" name={question.id} value={value} checked={answers[question.id] === value} onChange={() => setAnswers(a => ({ ...a, [question.id]: value }))} required />
          <span>{label}</span>
        </label>)}</div>
      </fieldset>
      <div className="diagnostic-actions"><button type="button" className="btn btn-outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Précédent</button><button type="submit" className="btn btn-primary" disabled={!answers[question.id]}>{step === QUESTIONS.length - 1 ? "Voir mes pistes" : "Continuer"} <span aria-hidden="true">→</span></button></div>
    </form>}
  </LegalLayout>;
}
