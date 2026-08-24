import { useState } from "react";
import Reveal from "./Reveal";

// ── Configuration Brevo ───────────────────────────────────────────────────────
// Clé API Brevo lue depuis les variables d'environnement Vite.
// VITE_BREVO_API_KEY  → clé API Brevo (tableau de bord Brevo → SMTP & API)
// VITE_BREVO_SENDER  → email expéditeur vérifié dans Brevo (ex: votre Gmail)
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY ?? "";
const BREVO_SENDER  = import.meta.env.VITE_BREVO_SENDER  ?? "";
const DESTINATAIRE  = "Moradeke.badirou@avocat.fr";

/**
 * Envoie un email via l'API Brevo (transactionnel).
 * Le Reply-To est positionné sur l'email du visiteur : quand Maître Badirou
 * clique « Répondre », sa réponse part directement au visiteur.
 */
async function envoyerAvecBrevo({ nom, email, telephone, sujet, message }) {
  const corps = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#8A6E2A;border-bottom:1px solid #E0E0E0;padding-bottom:8px">
        Nouveau message — Cabinet Badirou
      </h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#595959;width:120px"><strong>Nom</strong></td>
            <td style="padding:6px 0">${nom}</td></tr>
        <tr><td style="padding:6px 0;color:#595959"><strong>Email</strong></td>
            <td style="padding:6px 0"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#595959"><strong>Téléphone</strong></td>
            <td style="padding:6px 0">${telephone || "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#595959"><strong>Sujet</strong></td>
            <td style="padding:6px 0">${sujet}</td></tr>
      </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #E0E0E0">
      <p style="white-space:pre-wrap;line-height:1.6">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      <hr style="margin:16px 0;border:none;border-top:1px solid #E0E0E0">
      <p style="color:#595959;font-size:12px">
        Message envoyé depuis le formulaire de contact de badirou-avocat.fr.<br>
        Cliquez <strong>Répondre</strong> pour répondre directement à ${nom}.
      </p>
    </div>
  `;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender:  { name: `${nom} via Cabinet Badirou`, email: BREVO_SENDER },
      to:      [{ email: DESTINATAIRE, name: "Maître Moradéké Badirou" }],
      replyTo: { email, name: nom },
      subject: `Message de ${nom} — Cabinet Badirou`,
      htmlContent: corps,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur Brevo ${res.status}`);
  }
  return res.json();
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

    if (!BREVO_API_KEY || !BREVO_SENDER) {
      setStatus({
        text: "Le formulaire de contact n'est pas encore configuré. Merci de nous contacter directement par téléphone ou par email.",
        kind: "is-error",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ text: "Envoi en cours...", kind: "" });

    try {
      await envoyerAvecBrevo({ nom, email, telephone, sujet, message });
      setStatus({ text: "Votre message a bien été envoyé. Merci !", kind: "is-success" });
      form.reset();
    } catch (err) {
      setStatus({
        text: `Une erreur est survenue : ${err.message}. Veuillez réessayer ou nous contacter directement.`,
        kind: "is-error",
      });
      console.error("Brevo Error:", err);
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
