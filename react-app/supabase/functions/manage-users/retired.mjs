/** Ancien endpoint inutilisé : aucune opération avec la clé service_role. */
export function retiredResponse() {
  return new Response(JSON.stringify({ error: "Ce service de gestion des comptes a été retiré." }), {
    status: 410,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
