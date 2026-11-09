import { useEffect, useState } from "react";
import { AdminShell } from "./AdminLayout";
import { agendaRpc, dateParis } from "../../lib/agenda";

export default function Agenda() {
  const [slots, setSlots] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, refresh] = useState(0);
  useEffect(() => {
    let active = true;
    const load = () => agendaRpc("agenda_cabinet").then(data => {
      if (active) setSlots(data);
    }).catch(() => { if (active) setSlots(null); });
    load();
    const timer = setInterval(load, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [version]);

  async function change(name, params, form) {
    setBusy(true);
    setError("");
    try {
      const result = await agendaRpc(name, params);
      if (result === false) setError("Ce créneau a déjà été réservé ou retiré.");
      form?.reset();
    } catch (err) {
      setError(err.code === "23P01" ? "Cet horaire chevauche un autre rendez-vous." : "Modification impossible. Vérifiez la date et vos droits d’accès.");
    } finally { setBusy(false); refresh(v => v + 1); }
  }

  return <AdminShell titre="Agenda" sousTitre="Bilans nationalité d’une heure · horaires de Paris">
    <form className="flex flex-wrap items-end gap-4" onSubmit={e => {
      e.preventDefault();
      const form = e.currentTarget;
      change("ouvrir_creneau", { heure_paris: form.elements.debut.value }, form);
    }}>
      <label>Début du créneau<input type="datetime-local" name="debut" required /></label>
      <button className="btn btn-primary" disabled={busy || slots === null}>Ouvrir ce créneau</button>
    </form>
    <p role="status">{error}</p>
    <h2 className="mt-8">Prochains créneaux</h2>
    {slots === null ? <p>Chargement de l’agenda. Si la liste reste indisponible, vérifiez la configuration et l’accès du compte cabinet.</p>
      : slots.length === 0 ? <p>Aucun créneau à venir.</p>
      : <ul>{slots.map(slot => <li key={slot.id} className="border-b py-4">
        <strong>{dateParis(slot.debut)}</strong>
        {slot.nom ? <div>Réservé · {slot.nom} · {slot.modalite === "visio" ? "Visioconférence" : "Au cabinet"}<br />{slot.email}</div>
          : <div>Libre · <button type="button" className="underline" disabled={busy} onClick={() => change("retirer_creneau", { creneau: slot.id })}>Retirer ce créneau</button></div>}
      </li>)}</ul>}
  </AdminShell>;
}
