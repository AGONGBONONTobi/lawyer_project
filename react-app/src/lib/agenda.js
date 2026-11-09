import { supabase } from "./supabase";

export async function agendaRpc(name, params) {
  if (!supabase) throw new Error("Agenda indisponible");
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data;
}

export function dateParis(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris", dateStyle: "full", timeStyle: "short",
  }).format(new Date(value));
}
