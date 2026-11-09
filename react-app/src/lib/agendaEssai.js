// Données fictives par onglet. Aucune coordonnée personnelle n'est conservée.
const key = "cabinet-agenda-essai-v1";

export function lireEssai() {
  const previous = JSON.parse(sessionStorage.getItem(key) || "null");
  if (previous?.some(slot => Date.parse(slot.debut) > Date.now())) return previous;
  const slots = [];
  const day = new Date();
  while (slots.length < 6) {
    day.setUTCDate(day.getUTCDate() + 1);
    if ([0, 6].includes(day.getUTCDay())) continue;
    for (const hour of [9, 14]) {
      day.setUTCHours(hour, 0, 0, 0);
      slots.push({ id: crypto.randomUUID(), debut: day.toISOString() });
    }
  }
  sessionStorage.setItem(key, JSON.stringify(slots));
  return slots;
}

export function reserverEssai(id, mode) {
  const slots = lireEssai();
  const slot = slots.find(item => item.id === id && !item.mode && Date.parse(item.debut) > Date.now());
  if (!slot) return null;
  slot.mode = mode;
  sessionStorage.setItem(key, JSON.stringify(slots));
  return slot.debut;
}
