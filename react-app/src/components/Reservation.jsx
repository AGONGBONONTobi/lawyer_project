import { useEffect, useRef, useState } from "react";
import BookingCalendar from "./BookingCalendar";
import { agendaRpc, dateParis } from "../lib/agenda";

export default function Reservation() {
  const [slots, setSlots] = useState(null);
  const [demo, setDemo] = useState(false);
  const [reload, setReload] = useState(0);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState("");
  const [booked, setBooked] = useState(null);
  const request = useRef(null);
  useEffect(() => {
    let active = true;
    const local = import.meta.env.DEV && ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
    setFailed(false);
    setSlots(null);
    setSelected("");
    setDemo(false);
    agendaRpc("creneaux_libres").catch(async error => {
      if (!local) throw error;
      const { lireEssai } = await import("../lib/agendaEssai");
      const available = lireEssai().filter(slot => !slot.mode && Date.parse(slot.debut) > Date.now());
      if (active) setDemo(true);
      return available;
    }).then(list => {
      if (active) { setSlots(list); setFailed(false); }
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [reload]);

  async function reserve(event) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (!request.current || request.current.slot !== fields.creneau) {
      request.current = { slot: fields.creneau, key: crypto.randomUUID() };
    }
    setBusy(true);
    setMessage("");
    try {
      const date = import.meta.env.DEV && demo
        ? (await import("../lib/agendaEssai")).reserverEssai(fields.creneau, fields.format_rdv)
        : await agendaRpc("reserver_bilan", { ...fields, requete: request.current.key });
      if (date) setBooked(date);
      else {
        setMessage("Ce créneau vient de devenir indisponible. Choisissez un autre horaire.");
        setReload(n => n + 1);
      }
    } catch {
      setMessage("La confirmation n’a pas pu être vérifiée. Réessayez avec le même créneau.");
    } finally { setBusy(false); }
  }

  return <div className="booking-panel">
    <h3>Réserver mon Bilan</h3>
    {demo && <p className="form-note">Mode essai local · créneaux fictifs. Aucune réservation auprès du cabinet.</p>}
    {booked ? <p className="booking-confirmation" role="status">{demo ? "Essai enregistré" : "Votre Bilan est réservé"} pour le {dateParis(booked)} (heure de Paris). Notez ce rendez-vous.</p>
      : failed ? <p role="status">L’agenda est momentanément indisponible. <button type="button" className="text-link" onClick={() => setReload(n => n + 1)}>Réessayer</button></p>
      : !slots ? <p role="status">Chargement des disponibilités…</p>
      : !slots.length ? <p>Aucun créneau ouvert pour le moment. Vous pouvez joindre le cabinet par téléphone.</p>
      : <form className="contact-form" onSubmit={reserve}>
        <BookingCalendar slots={slots} selected={selected} onSelect={setSelected} />
        {selected && <>
        <label htmlFor="booking-mode">Lieu du rendez-vous</label>
        <select name="format_rdv" id="booking-mode"><option value="cabinet">Au cabinet · Paris 17ᵉ</option><option value="visio">En visioconférence</option></select>
        <label htmlFor="booking-name">Nom complet</label>
        <input key={String(demo)} readOnly={demo} defaultValue={demo ? "Personne de test" : ""} id="booking-name" name="nom_client" required autoComplete="name" maxLength={120} />
        <label htmlFor="booking-email">Adresse e-mail de contact</label>
        <input key={String(demo) + "-email"} readOnly={demo} defaultValue={demo ? "essai@example.org" : ""} id="booking-email" name="courriel" type="email" autoComplete="email" maxLength={254} required />
        {!demo && <p className="form-note">Le cabinet retrouve ces coordonnées dans son agenda privé. <a href="/confidentialite">Confidentialité</a></p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Réservation en cours…" : demo ? "Tester cette réservation" : "Confirmer mon Bilan · 150 € TTC"}</button>
        </>}
      </form>}
    {demo && <details className="mt-4">
      <summary>Voir les réservations d’essai de cet onglet</summary>
      <Essais key={booked || "libre"} />
    </details>}
    {demo && !booked && <button type="button" className="text-link" onClick={() => setReload(n => n + 1)}>Reconnecter l’agenda du cabinet</button>}
    <p role="status">{message}</p>
  </div>;
}

function Essais() {
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    if (import.meta.env.DEV) import("../lib/agendaEssai").then(({ lireEssai }) => {
      setBookings(lireEssai().filter(slot => slot.mode));
    });
  }, []);
  return bookings.length ? <ul>{bookings.map(slot => <li key={slot.id}>{dateParis(slot.debut)} · {slot.mode}</li>)}</ul>
    : <p>Aucune réservation d’essai dans cet onglet.</p>;
}
