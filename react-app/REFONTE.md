# Recentrage du cabinet sur la nationalité française

La feuille de route, les consignes du ZIP et la maquette dans `new_direction/`
servent de référence. L’application active est `react-app/` : React, Vite,
Tailwind, Motion/Framer Motion, Supabase et formulaire EmailJS. Les anciens
fichiers HTML à la racine ne constituent pas l’application déployée actuelle.

## Contenu et parcours

L’accueil présente désormais la nationalité française avant les autres domaines :
accroche, repères de confiance, huit situations, naturalisation 2026, méthode en
cinq étapes, honoraires, offre employeurs, autres domaines, cabinet, FAQ, contact.
Les domaines restent reliés au back office Supabase existant.

Deux routes ont été ajoutées :

- `/nationalite` : explications des principales voies et liens officiels.
- `/diagnostic` : douze questions, retour possible, jusqu’à trois pistes avec
  les décisions défavorables prioritaires. Résultats indicatifs, sans conclusion
  d’éligibilité ni promesse de résultat.

Le questionnaire distingue un parent français d’un parent simplement né en France.
Les seuils de quatre ans de mariage et de vingt-cinq ans de résidence sont inclus.
Les règles propres aux mineurs ne sont pas assimilées aux déclarations d’adultes.
Le niveau de français et les ressources sont des repères, pas un filtre automatique
qui exclurait les situations bénéficiant d’exceptions.

## Couleurs et fond animé — direction ajustée

Le blanc domine les pages. Le gris bleuté `#F4F7FA` distingue les sections, le bleu encre `#245579` signale les actions et les titres utilisent `#192D3B`. La section naturalisation utilise un fond bleu nuit. Un vert patiné rappelle la statue sur le cadre du portrait et distingue la rubrique employeurs. Les couleurs de base sont définies dans `src/tokens.css`.

La photographie `hero-paris.jpg` accompagne le formulaire de prise de rendez-vous. Sur ordinateur, le panneau blanc translucide défile devant la statue. Sur petit écran ou lorsque la réduction des mouvements est activée, le fond suit la page.

## Outils et contrôles

Aucune bibliothèque supplémentaire n’est nécessaire pour rétablir le fond fixe
et les animations existantes. Les dépendances présentes comprennent maintenant
Vite 8.1.5, utilisé pour compiler cette retouche. L’installation de paquets n’a
pas été relancée pendant cet ajustement ; les difficultés réseau des essais
précédents ne constituent pas une validation du verrouillage complet.

Les tests du diagnostic et de sécurité validés précédemment restent inchangés.
Le serveur local refuse toujours l’ouverture du port 5173 (`EPERM`) ; le rendu
visuel interactif n’a donc pas été validé ici. Aucun push ni déploiement.

## Éléments à raccorder avant publication

Le diagnostic ne collecte ni nom, ni email, ni téléphone. Les réponses restent
en mémoire dans la page et disparaissent à son actualisation. Aucun envoi,
stockage, pixel publicitaire ou service tiers de questionnaire n’a été ajouté.
Le résultat dirige vers le formulaire existant pour demander un Bilan.

L’URL réelle du rendez-vous Calendly n’est pas fournie : aucune fausse réservation
n’est affichée. Le formulaire indique que le cabinet doit confirmer un créneau.
L’envoi EmailJS n’a pas été déclenché pendant les contrôles.

Les prix sont repris de la grille de test du dossier, et doivent être confirmés
par le cabinet avant publication. Le droit du travail n’a pas été injecté dans
la base distante : les autres domaines restent administrables par leur outil
existant. Le compte Instagram n’étant pas fourni, aucun lien fictif n’est ajouté.

Le titre, les métadonnées et le sitemap ont été actualisés. Les routes restent
rendues côté client : cette modification n’ajoute pas de pré-rendu HTML par route
pour les robots de partage qui n’exécutent pas JavaScript.

Aucun déploiement Render ou IONOS n’a été lancé.

## Sources des repères juridiques vérifiés le 9 novembre 2026

- [Niveau de français](https://www.service-public.gouv.fr/particuliers/vosdroits/F11926)
- [Examen civique](https://www.service-public.gouv.fr/particuliers/vosdroits/F39426)
- [Naturalisation par décret](https://www.service-public.gouv.fr/particuliers/vosdroits/F2213)
- [Nationalité par mariage](https://www.service-public.gouv.fr/particuliers/vosdroits/F2726)
- [Frère ou sœur de Français](https://www.service-public.gouv.fr/particuliers/vosdroits/F33800)
- [Ascendant de Français](https://www.service-public.gouv.fr/particuliers/vosdroits/F33430)
- [Filiation et naissance](https://www.service-public.gouv.fr/particuliers/vosdroits/F3068)
- [Réintégration par décret](https://www.service-public.gouv.fr/particuliers/vosdroits/F2214)
- [Enfant adopté](https://www.service-public.gouv.fr/particuliers/vosdroits/F3070)
- [Enfant recueilli](https://www.service-public.gouv.fr/particuliers/vosdroits/F31919)
- [Code civil, article 21-13 : possession d’état](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070721/LEGISCTA000006117612/2026-01-01/)
