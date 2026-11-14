import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";
import PageMeta from "../components/PageMeta";
import { QUESTIONS, orienter, enregistrerDiagnostic } from "../lib/diagnostic";

export default function Diagnostic() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [transmittedId, setTransmittedId] = useState(null);
  const [transmitError, setTransmitError] = useState("");
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

  async function handleTransmettre(e) {
    e.preventDefault();
    if (transmitting) return;
    setTransmitError("");
    setTransmitting(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const id = await enregistrerDiagnostic({
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        commentaire: data.commentaire,
        reponses: answers,
        pistes: orienter(answers)
      });
      setTransmittedId(id);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cabinet-dernier-diagnostic", JSON.stringify({
          id,
          nom: data.nom,
          email: data.email
        }));
      }
    } catch {
      setTransmitError("La transmission n’a pas pu aboutir. Vérifiez votre connexion ou contactez le cabinet.");
    } finally {
      setTransmitting(false);
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setFinished(false);
    setTransmittedId(null);
    setTransmitError("");
  }

  return <LegalLayout eyebrow="Diagnostic gratuit · Environ 3 minutes" title="Commençons par votre situation.">
    <PageMeta title="Diagnostic nationalité gratuit | Maître Moradéké Badirou" description="12 questions pour identifier des pistes à examiner avec une avocate. Diagnostic indicatif et gratuit sur la nationalité française, sans engagement." />
    <p className="diagnostic-disclaimer">Ce diagnostic n’est pas une consultation juridique. Il propose des pistes à vérifier, sans confirmer votre nationalité ni votre éligibilité.</p>
    <p className="source-note">Vos réponses restent dans votre navigateur pendant le questionnaire. À l’issue, vous pourrez choisir de les transmettre à l’avocate pour préparer votre Bilan, ou simplement les consulter sans enregistrement.</p>
    {finished ? <div className="diagnostic-results">
      <h2 ref={heading} tabIndex={-1}>Vos premières pistes</h2>
      {orienter(answers).map(piste => <article key={piste.id} className={`diagnostic-result ${piste.urgent ? "is-urgent" : ""}`}>{piste.urgent && <p className="eyebrow">À examiner rapidement</p>}<h3>{piste.title}</h3><p>{piste.text}</p></article>)}
      <p>Le Bilan nationalité permet d’examiner les pièces et les conditions propres à votre dossier. Il dure une heure, au cabinet ou en visio : 150 € TTC, déduits du forfait si vous confiez votre dossier au cabinet.</p>

      {transmittedId ? <div className="mt-8 rounded-sm border border-[var(--success-border)] bg-[var(--success-bg)] p-6 text-[var(--success-ink)]" role="status">
        <h3 className="mb-2 font-serif text-xl font-medium text-[var(--success-ink)]">Réponses transmises au cabinet</h3>
        <p className="mb-4 text-sm text-[var(--text)]">
          Votre diagnostic a été enregistré dans le système du cabinet sous la référence <strong>#{transmittedId.slice(0, 8).toUpperCase()}</strong>. Maître Badirou pourra s’appuyer sur vos réponses pour préparer votre rendez-vous.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="btn btn-primary" to="/#contact">Réserver mon Bilan nationalité <span aria-hidden="true">↗</span></Link>
        </div>
      </div> : <div className="mt-8 rounded-sm border border-[var(--line)] bg-[var(--parchment-warm)] p-6">
        <h3 className="mb-2 font-serif text-xl font-medium">Transmettre ces éléments à Maître Badirou</h3>
        <p className="mb-4 text-sm text-[var(--muted-ink)]">
          Facultatif · Permet à l’avocate de prendre connaissance de votre situation avant votre Bilan nationalité.
        </p>
        <form onSubmit={handleTransmettre} className="grid gap-3">
          <div>
            <label htmlFor="diag-nom" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">Nom complet *</label>
            <input id="diag-nom" name="nom" required maxLength={120} placeholder="Ex. Marie Dupont" className="w-full rounded-sm border border-[var(--field-line)] bg-white px-3 py-2 text-sm text-[var(--text)]" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="diag-email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">Adresse e-mail *</label>
              <input id="diag-email" name="email" type="email" required maxLength={254} placeholder="votre@email.fr" className="w-full rounded-sm border border-[var(--field-line)] bg-white px-3 py-2 text-sm text-[var(--text)]" />
            </div>
            <div>
              <label htmlFor="diag-tel" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">Téléphone (facultatif)</label>
              <input id="diag-tel" name="telephone" type="tel" maxLength={30} placeholder="06 00 00 00 00" className="w-full rounded-sm border border-[var(--field-line)] bg-white px-3 py-2 text-sm text-[var(--text)]" />
            </div>
          </div>
          <div>
            <label htmlFor="diag-commentaire" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">Précisions ou questions (facultatif)</label>
            <textarea id="diag-commentaire" name="commentaire" rows={3} maxLength={1000} placeholder="Date de décision, démarches déjà entreprises, documents disponibles…" className="w-full rounded-sm border border-[var(--field-line)] bg-white px-3 py-2 text-sm text-[var(--text)]" />
          </div>
          <label className="mt-1 flex cursor-pointer items-start gap-2 text-xs text-[var(--muted-ink)]">
            <input type="checkbox" required name="consent" className="mt-0.5 accent-[var(--accent-ink)]" />
            <span>J’accepte de transmettre ces informations au Cabinet Badirou afin de préparer mon dossier. <Link to="/confidentialite" className="underline underline-offset-2">Confidentialité</Link>.</span>
          </label>
          {transmitError && <p className="text-xs font-medium text-[var(--error-ink)]" role="alert">{transmitError}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={transmitting} className="btn btn-primary">
              {transmitting ? "Transmission en cours…" : "Transmettre mes réponses au cabinet"}
            </button>
            <Link className="btn btn-outline" to="/#contact">Réserver sans transmettre <span aria-hidden="true">↗</span></Link>
          </div>
        </form>
      </div>}

      <button className="diagnostic-restart text-link" onClick={restart}>Recommencer le diagnostic</button>
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
