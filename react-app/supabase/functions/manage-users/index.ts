// L’onglet Comptes a été retiré. L’ancien endpoint donnait des droits de gestion
// des utilisateurs à toute session authentifiée. Il est désormais fermé.
// Ce changement doit encore être déployé pour affecter une fonction distante.
import { retiredResponse } from "./retired.mjs";

Deno.serve(() => retiredResponse());
