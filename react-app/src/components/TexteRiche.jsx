import { Fragment } from "react";

/**
 * Rendu du texte des pages légales saisi dans le back office.
 *
 * Volontairement minimal, et surtout **sans `dangerouslySetInnerHTML`** : on
 * construit des éléments React, jamais du HTML injecté. Même si seule une
 * personne authentifiée peut écrire ces pages, un champ libre rendu en HTML
 * brut sur toutes les pages du site serait une porte d'entrée XSS inutile.
 *
 * Syntaxe reconnue :
 *
 *   Un paragraphe ordinaire.        → <p>
 *   (ligne vide)                      sépare deux blocs
 *   - un élément                    → <ul><li>, si tout le bloc commence par « - »
 *   > une remarque                  → note discrète, pour les rappels internes
 *   **gras**                        → <strong>
 *   [libellé](https://…)            → lien
 */

export default function TexteRiche({ texte }) {
  if (!texte?.trim()) return null;

  const blocs = texte.trim().split(/\n\s*\n/);

  return (
    <>
      {blocs.map((bloc, i) => {
        const lignes = bloc.split("\n").filter((l) => l.trim());

        if (lignes.every((l) => l.trimStart().startsWith("- "))) {
          return (
            <ul className="legal-list" key={i}>
              {lignes.map((l, j) => (
                <li key={j}>
                  <Inline texte={l.trimStart().slice(2)} />
                </li>
              ))}
            </ul>
          );
        }

        if (lignes.every((l) => l.trimStart().startsWith("> "))) {
          return (
            <p className="legal-hint" key={i}>
              <Inline texte={lignes.map((l) => l.trimStart().slice(2)).join(" ")} />
            </p>
          );
        }

        return (
          <p key={i}>
            <Inline texte={lignes.join(" ")} />
          </p>
        );
      })}
    </>
  );
}

// [à compléter : …], **gras** et [libellé](url), dans l'ordre d'apparition.
// Le marqueur « à compléter » passe en premier : sans quoi rien ne le
// distinguerait d'un début de lien, et il se fondrait dans le texte alors
// qu'il signale précisément une information manquante sur une page légale.
const MOTIF = /(\[à compléter[^\]]*\])|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/gi;

function Inline({ texte }) {
  const morceaux = [];
  let dernier = 0;
  let m;

  MOTIF.lastIndex = 0;
  while ((m = MOTIF.exec(texte)) !== null) {
    if (m.index > dernier) morceaux.push(texte.slice(dernier, m.index));

    if (m[1] !== undefined) {
      morceaux.push(
        <span className="legal-todo" key={m.index}>
          {m[1]}
        </span>
      );
    } else if (m[2] !== undefined) {
      morceaux.push(<strong key={m.index}>{m[2]}</strong>);
    } else {
      const url = m[4];
      // Les liens externes s'ouvrent dans un nouvel onglet ; les ancres et les
      // routes internes doivent rester dans la page.
      const externe = /^https?:\/\//i.test(url);
      morceaux.push(
        <a
          key={m.index}
          href={url}
          {...(externe ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[3]}
        </a>
      );
    }
    dernier = m.index + m[0].length;
  }

  if (dernier < texte.length) morceaux.push(texte.slice(dernier));

  return (
    <>
      {morceaux.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}
