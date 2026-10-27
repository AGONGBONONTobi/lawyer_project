import { useState } from "react";
import Reveal from "./Reveal";

// ── Configuration EmailJS ─────────────────────────────────────────────────────
// Identifiants EmailJS (avec valeurs par défaut pour fonctionner immédiatement en prod).
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "service_3zcdv5d";
const EMAILJS_FALLBACK_SERVICE_ID = "service_j4t067u";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_xenqup4";
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "3yD_3mK4P-9lXu5mf";
const DESTINATAIRE        = "moradeke.badirou@avocat.fr";

/**
 * Envoie un email via l'API REST officielle d'EmailJS.
 * Adapte automatiquement les variables au template EmailJS ({{to_name}}, {{from_name}}, {{message}}, {{reply_to}}).
 */
async function envoyerRequeteEmailJS(serviceId, templateParams) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(errText || `Erreur EmailJS (${res.status})`);
  }
}

async function envoyerAvecEmailJS({ nom, email, telephone, sujet, message }) {
  const templateParams = {
    to_name: "Maître Badirou",
    from_name: nom,
    name: nom,
    email: email,
    from_email: email,
    reply_to: email,
    phone: telephone || "Non renseigné",
    subject: sujet,
    message: message,
    to_email: DESTINATAIRE,
  };

  try {
    await envoyerRequeteEmailJS(EMAILJS_SERVICE_ID, templateParams);
  } catch (firstErr) {
    if (EMAILJS_SERVICE_ID !== EMAILJS_FALLBACK_SERVICE_ID) {
      await envoyerRequeteEmailJS(EMAILJS_FALLBACK_SERVICE_ID, templateParams);
    } else {
      throw firstErr;
    }
  }
}

export default function Contact({ sectionRef }) {
  const [status, setStatus] = useState({ text: "", kind: "" });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const nom       = form.elements["name"].value.trim();
    const email     = form.elements["email"].value.trim();
    const telephone = form.elements["phone"].value.trim();
    const sujet     = form.elements["subject"].value;
    const message   = form.elements["message"].value.trim();

    // Validation expressions régulières
    // Nom : lettres (y compris accents), espaces, tirets, apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    // Téléphone : chiffres, plus, espaces, points, tirets (8 à 20 caractères max)
    const phoneRegex = /^[+0-9\s.\-]{8,20}$/;

    if (!nom || !email || !message) {
      setStatus({ text: "Merci de renseigner votre nom, votre email et votre message.", kind: "is-error" });
      return;
    }

    if (!nameRegex.test(nom)) {
      setStatus({ text: "Le nom ne doit contenir que des lettres, des espaces ou des tirets.", kind: "is-error" });
      return;
    }

    if (telephone && !phoneRegex.test(telephone)) {
      setStatus({ text: "Le numéro de téléphone n'est pas valide.", kind: "is-error" });
      return;
    }

    setIsLoading(true);
    setStatus({ text: "Envoi en cours...", kind: "" });

    try {
      await envoyerAvecEmailJS({ nom, email, telephone, sujet, message });
      setStatus({ text: "Votre message a bien été envoyé. Merci !", kind: "is-success" });
      form.reset();
    } catch (err) {
      setStatus({
        text: "Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter directement par téléphone ou email.",
        kind: "is-error",
      });
      console.error("EmailJS Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="pt-12 pb-24 lg:pt-16 lg:pb-32" id="contact" ref={sectionRef}>
      <div className="container">
        <Reveal as="div" className="section-panel">
          <div className="section-head">
            <p className="eyebrow">Prendre rendez-vous</p>
            <h2>Contact</h2>
            <p className="section-intro">
              Une question, une situation à exposer&nbsp;? Contactez le cabinet par téléphone, par email ou via
              le formulaire ci-dessous.
            </p>
          </div>

          <div className="contact-grid">
            <Reveal as="div" className="contact-info">
              <ul className="info-list">
                <li>
                  <div className="icon-wrapper">
                    <svg className="icon" aria-hidden="true"><use href="#icon-pin"></use></svg>
                  </div>
                  <div>
                    <strong>Adresse</strong>
                    <span>2 Rue Mariotte, 75017 Paris</span>
                  </div>
                </li>
                <li>
                  <div className="icon-wrapper">
                    <svg className="icon" aria-hidden="true"><use href="#icon-phone"></use></svg>
                  </div>
                  <div>
                    <strong>Téléphone</strong>
                    <span><a href="tel:0671429695">06 71 42 96 95</a></span>
                  </div>
                </li>
                <li>
                  <div className="icon-wrapper">
                    <svg className="icon" aria-hidden="true"><use href="#icon-mail"></use></svg>
                  </div>
                  <div>
                    <strong>Email</strong>
                    <span><a href="mailto:moradeke.badirou@avocat.fr">moradeke.badirou@avocat.fr</a></span>
                  </div>
                </li>
                <li>
                  <div className="icon-wrapper">
                    <svg className="icon" aria-hidden="true"><use href="#icon-clock"></use></svg>
                  </div>
                  <div>
                    <strong>Horaires</strong>
                    {/* <details> natif plutôt qu'un accordéon Radix : pas d'état à
                        gérer, replié par défaut sur mobile où la place manque, et
                        le détail reste lisible même sans JavaScript. */}
                    <details className="hours">
                      <summary>
                        <span className="hours-summary-label">Lundi – Vendredi</span>
                        <span className="hours-summary-value">9h – 19h</span>
                      </summary>
                      <span className="hours-table">
                        <span>Lundi</span><span>9h – 19h</span>
                        <span>Mardi</span><span>9h – 19h</span>
                        <span>Mercredi</span><span>9h – 19h</span>
                        <span>Jeudi</span><span>9h – 19h</span>
                        <span>Vendredi</span><span>9h – 19h</span>
                      </span>
                    </details>
                    <span className="hours-table hours-weekend">
                      <span>Samedi – Dimanche</span><span>Fermé</span>
                    </span>
                  </div>
                </li>
              </ul>
            </Reveal>

            <Reveal as="form" className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <label htmlFor="name">Nom complet</label>
                <input type="text" id="name" name="name" required autoComplete="name" />
              </div>
              <div className="form-row form-row-split">
                <div>
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required autoComplete="email" />
                </div>
                <div>
                  <label htmlFor="phone">Téléphone</label>
                  <input type="tel" id="phone" name="phone" autoComplete="tel" />
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="subject">Sujet</label>
                <select id="subject" name="subject" defaultValue="Droit commercial">
                  <option>Droit commercial</option>
                  <option>Droit de la famille</option>
                  <option>Droit des étrangers</option>
                  <option>Autre demande</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="5" required></textarea>
              </div>
              <p className="form-note">
                En envoyant ce formulaire, votre demande sera directement transmise à Maître Badirou.
              </p>
              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <svg className="icon" aria-hidden="true"><use href="#icon-send"></use></svg>
                    Envoyer ma demande
                  </>
                )}
              </button>
              <p className={`form-status ${status.kind}`} role="status" aria-live="polite">
                {status.text}
              </p>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
