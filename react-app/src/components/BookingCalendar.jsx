import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const parisDay = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" });
const clock = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", timeStyle: "short" });
const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
const fullDay = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "UTC" });

export default function BookingCalendar({ slots, selected, onSelect }) {
  const days = new Map();
  for (const slot of slots) {
    const key = parisDay.format(new Date(slot.debut));
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(slot);
  }
  const months = [...new Set([...days.keys()].map(key => key.slice(0, 7)))].sort();
  const [day, setDay] = useState([...days.keys()][0]);
  const month = day.slice(0, 7);
  const monthIndex = months.indexOf(month);
  const first = new Date(month + "-01T12:00:00Z");
  const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();

  function chooseDay(key) {
    setDay(key);
    onSelect("");
  }
  function move(offset) {
    chooseDay([...days.keys()].find(key => key.startsWith(months[monthIndex + offset])));
  }
  return <div className="booking-calendar">
    <div className="calendar-heading">
      <h4 aria-live="polite">{monthName.format(first)}</h4>
      <div>
        <button type="button" aria-label="Mois disponible précédent" disabled={monthIndex === 0} onClick={() => move(-1)}><ChevronLeft size={18} /></button>
        <button type="button" aria-label="Mois disponible suivant" disabled={monthIndex === months.length - 1} onClick={() => move(1)}><ChevronRight size={18} /></button>
      </div>
    </div>
    <div className="calendar-days" role="group" aria-label="Choisir un jour disponible">
      {["Lu","Ma","Me","Je","Ve","Sa","Di"].map(d => <span aria-hidden="true" key={d}>{d}</span>)}
      {Array.from({length: (first.getUTCDay() + 6) % 7}, (_, i) => <span aria-hidden="true" key={"pad"+i} />)}
      {Array.from({length: count}, (_, i) => {
        const key = month + "-" + String(i+1).padStart(2,"0");
        const available = days.has(key);
        return <button type="button" key={key} disabled={!available} aria-pressed={key === day}
          aria-label={fullDay.format(new Date(key + "T12:00:00Z")) + (available ? ", disponible" : ", indisponible")}
          onClick={() => chooseDay(key)}>{i + 1}{available && <i aria-hidden="true" />}</button>;
      })}
    </div>
    <fieldset className="calendar-times">
      <legend>Horaires du {fullDay.format(new Date(day + "T12:00:00Z"))}</legend>
      <p>Heure de Paris</p>
      <div>{days.get(day)?.map(slot => <label key={slot.id}>
        <input type="radio" name="creneau" value={slot.id} checked={selected === slot.id} required onChange={() => onSelect(slot.id)} />
        <span>{selected === slot.id && <Check size={15} aria-hidden="true" />}{clock.format(new Date(slot.debut))}</span>
      </label>)}</div>
    </fieldset>
  </div>;
}
