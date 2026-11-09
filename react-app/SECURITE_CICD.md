# Sécurité et préparation CI/CD

État du code examiné le 9 novembre 2026. Travail local uniquement : aucun push,
aucun déploiement et aucune modification des comptes ou de la base distante.

## Démarrage local

Le projet actif est dans `react-app/`. Les dépendances disponibles localement
permettent de compiler et de tester le site. Elles ne correspondent pas toutes
aux versions du verrouillage npm : voir `REFONTE.md`.

Depuis un terminal du poste avec accès réseau :

```bash
cd /home/agongbonontobiprince/lawyer_project/react-app
npm run dev:setup
```

Ce script vérifie l’accès au registre, effectue `npm ci` puis démarre Vite sur
`http://127.0.0.1:5173`. Le test réseau précède l’installation pour ne pas effacer
les dépendances utilisables en cas d’indisponibilité du registre.
Pour démarrer directement avec les dépendances déjà présentes : `npm run dev`.
Node 24 est indiqué dans `.nvmrc` pour la CI ; la validation locale a utilisé
Node 22.16.0 et Vite 6.4.2.

Dans l’environnement d’exécution actuel, le registre répond par `EAI_AGAIN` et
l’ouverture du port 5173 est refusée avec `EPERM`. Le serveur local n’a donc
**pas démarré**. Aucun test visuel ou test navigateur interactif n’est validé.

## Constats de sécurité

Les politiques SQL et l’Edge Function ci-dessous ont été lues dans le dépôt.
Leur présence et leur configuration réellement actives en production n’ont pas
été vérifiées : ce rapport n’est pas un audit de pénétration du service public.

| Priorité | Constat dans les sources | Action locale et suite nécessaire |
| --- | --- | --- |
| Haute | L’ancien `manage-users` utilisait `service_role` après une simple connexion, et permettait liste, création et suppression de comptes. | Fonction retirée du code : réponse 410, aucun accès au service admin. Déployer ce retrait ou supprimer la fonction distante après validation. |
| Haute | Domaines, pages légales et images modifiables par tout compte `authenticated`. | Script de durcissement RLS préparé, non exécuté. Enrôler les administrateurs et implémenter leur parcours MFA avant activation. |
| Haute | Un nom `VITE_*` rend une valeur accessible au navigateur ; une clé serveur pourrait y être placée par erreur. | Garde de configuration : noms autorisés, rejet des JWT privilégiés et des clés `sb_secret_*`. Contrôle supplémentaire des sources et du build. |
| Moyenne | Les liens saisis dans les pages légales acceptaient n’importe quel protocole. | Protocoles exécutables, caractères de contrôle, antislashs et URLs `//…` refusés. React continue de rendre du texte, sans HTML injecté. |
| Moyenne | Peu d’en-têtes navigateur dans la configuration Apache. | HSTS sans sous-domaines ni preload, Permissions-Policy et CSP de base ajoutés. CSP complète en mode report-only pour la préproduction. Réponse HTTP réelle à contrôler. |
| Moyenne | Envoi EmailJS directement depuis le navigateur ; aucune limitation serveur propre au projet. | Identifiants publics, pas des secrets serveur. Prévoir restrictions de domaines et anti-abus chez le fournisseur, puis endpoint serveur validant les demandes et limitant leur débit. |
| Moyenne | Les workflows existants ne faisaient que des pings. | CI de qualité/sécurité ajoutée et suivi Dependabot préparé. Aucun workflow de déploiement ajouté. |

Aucune clé privée reconnue n’a été trouvée dans l’état courant des fichiers
versionnés/non ignorés ni dans le build contrôlé. Le scanner local détecte une
liste limitée de formats ; il ne remplace pas Gitleaks, les alertes du fournisseur
ou un scan de l’historique. Les fichiers d’environnement locaux contiennent des
clés serveur et restent exclus de Git ; leurs valeurs n’ont pas été reproduites.
La clé Supabase `anon` précédemment écrite dans le keepalive est publique par
conception : sa présence n’est pas assimilée à une fuite `service_role`.
Le keepalive utilise désormais des variables GitHub publiques à configurer.

Les documents de cadrage `new_direction/` restent sur le poste et sont exclus
de Git pour éviter d’envoyer par erreur les documents internes de la cliente.

## CI préparée

`.github/workflows/ci.yml` s’exécutera après un futur push autorisé ou sur une PR :

1. Checkout sans conservation d’identifiants Git ; droits `contents: read`.
2. Node 24 sur runner hébergé GitHub, actions épinglées sur des SHA complets
   vérifiés dans leurs dépôts officiels.
3. Contrôle des fichiers et formats de secrets reconnus.
4. `npm ci` : installation exacte du verrouillage.
5. Tests du diagnostic et des protections, puis lint.
6. `npm audit --audit-level=high`, y compris les outils de build. Une erreur
   réseau ou une vulnérabilité haute/critique fait échouer cette étape.
7. Build puis contrôle du livrable, y compris l’absence de fichiers `.env`, SQL,
   source maps et clés privées reconnues.
8. Conservation sept jours de `dist/`, avec son `.htaccess`, sans déploiement.

La CI ne reçoit ni clé `service_role`, ni identifiant de déploiement, ni variable
publique de production. Son artefact utilise donc les contenus de repli : ce
n’est pas le livrable de production à mettre en ligne tel quel.

Dependabot est configuré pour npm et les actions GitHub. Les mises à jour sont
des propositions de PR ; elles ne sont pas fusionnées automatiquement.
Les deux keepalives ont maintenant un jeton sans permission et un délai maximal.

Contrôles encore à intégrer pour une pipeline complète :

- Tests navigateur avec Playwright : accueil, mobile, diagnostic, navigation,
  connexion/MFA, refus des écritures anonymes. Installation et verrouillage de
  la dépendance à effectuer avec accès réseau ; aucun envoi réel de formulaire.
- Scan Gitleaks sur le dépôt et son historique ; CodeQL ou Semgrep selon le
  type de dépôt, le plan GitHub et le budget.
- Tests SQL réels sur une instance Supabase de préproduction, pas seulement
  une lecture du script de politiques.
- Contrôle des réponses HTTP : HTTPS, headers, redirections, routes profondes,
  fichiers interdits et cache. Vérifier aussi que Render ne contourne pas les
  règles configurées uniquement sur Apache.

## RLS, administration et MFA

`supabase/security/admin_hardening.sql` est une préparation, pas une migration
appliquée. Il crée une liste d’administrateurs dans un schéma non exposé et
exige une session MFA `aal2`. Des politiques restrictives complètent les
politiques permissives afin qu’une autre permission large ne rouvre pas
l’écriture. Les images de présentation restent publiques.

Avant application :

1. Exporter les politiques réellement actives et sauvegarder la base.
2. Désactiver les inscriptions publiques si elles ne servent pas au projet.
3. Préparer le parcours d’enrôlement et de challenge TOTP, la récupération et
   un second administrateur de secours ; ne pas dépendre d’un seul téléphone.
4. Ajouter explicitement les UUID autorisés dans `cabinet_security.admins`.
5. Tester la matrice : anonyme, compte non admin, admin sans MFA, admin avec MFA.
6. Activer la migration en préproduction puis, après contrôle, en production.

Sans parcours MFA, activer ce script empêcherait l’administration d’écrire.
Masquer les routes `/admin` ou vérifier un rôle seulement dans React ne protège
pas l’API. La déconnexion d’inactivité existante reste une mesure d’interface,
pas une expiration serveur de session. Configurer aussi les durées et la
révocation des sessions dans Supabase.

## CD : ce qui manque pour choisir et l’activer

| Information à confirmer | Pourquoi elle change la solution |
| --- | --- |
| Hébergeur qui sert réellement le site | IONOS peut ne gérer que le domaine/DNS, avec Render qui sert le frontend. Dans ce cas `.htaccess` n’est pas interprété. |
| Offre IONOS exacte, si elle sert les fichiers | Mutualisé SFTP, Deploy Now et VPS ont des mécanismes de livraison différents. |
| Dépôt privé/public et plan GitHub | Les approbations d’environnements ne sont pas disponibles dans tous les plans, notamment pour un dépôt privé. |
| Branche de production et auto-deploy Render/IONOS | Empêcher qu’un push déclenche une livraison avant les tests et la validation attendue. |
| Hébergement et données de préproduction | Tester sans utiliser les comptes et données de production. |
| Personne habilitée à valider une release | Définir une validation réelle, sa trace et un accès minimal aux identifiants. |
| Objectifs de disponibilité et de restauration | Définir alertes, sauvegardes et retour arrière effectivement testés. |

Cible proposée : PR → CI bloquante → préproduction → tests navigateur et
sécurité HTTP → validation de release → production → tests de disponibilité.
Le déploiement se déclenche explicitement, pas depuis une PR non fiable.

La release doit être construite avec les variables publiques du bon environnement,
avec les mêmes contrôles et les dépendances verrouillées. Les clés serveur et
les identifiants de livraison ne vont jamais dans le bundle. Conserver le
livrable final, son empreinte SHA-256 et la version précédente pour le rollback.

- **Render sert le frontend** : définir les headers dans Render ; contrôler
  son auto-deploy ; utiliser un mécanisme de release après les vérifications.
  Un fichier `_headers` ou `.htaccess` seul n’active pas ces protections Render.
- **IONOS mutualisé** : compte SFTP limité au répertoire du site, clé dédiée,
  empreinte d’hôte vérifiée hors bande, livraison sans suppression préalable
  du site, assets avant `index.html`, conservation d’une version restaurable.
  Un remplacement atomique de répertoire dépend des possibilités de l’offre.
- **IONOS VPS** : utilisateur de déploiement sans root, service statique,
  répertoires de releases et bascule atomique ; la maintenance système devient
  aussi une responsabilité du projet.

Ne pas mettre les identifiants de production dans les jobs de PR. Les secrets
de livraison sont limités au seul job de release ; préférer des identités
courtes/OIDC lorsqu’elles sont prises en charge par la cible. Protéger la
branche, exiger la CI et une revue, interdire les pushes directs et limiter les
personnes capables de modifier les workflows ou les secrets.

Les sauvegardes doivent couvrir base et fichiers, être hors du seul compte
principal et faire l’objet d’un exercice de restauration. Prévoir des alertes
sur l’indisponibilité et les erreurs sans journaliser le contenu des demandes
juridiques. Le diagnostic actuel conserve ses réponses uniquement en mémoire.
Un futur espace de documents clients nécessiterait un stockage privé distinct
et des accès contrôlés ; le bucket public `domaines` ne doit pas servir à cela.

## Validation réalisée et limites

- Les dix tests du diagnostic et six tests de sécurité passent.
- `npm run check` passe : sources, tests, lint sans erreur bloquante, build et
  contrôle du livrable. Le lint conserve des avertissements préexistants.
- YAML des workflows et du fichier Dependabot analysé ; références d’actions
  contrôlées comme SHA complets ; script de démarrage vérifié avec `bash -n`.
- `npm audit` n’a pas abouti : registre inaccessible. Aucune conclusion
  « zéro vulnérabilité » n’est tirée.
- Installation exacte, exécution GitHub, validation visuelle, configuration
  Apache effective, fonction distante et migration PostgreSQL non validées.
- Aucune modification externe, aucun commit ni push n’a été réalisé.

## Références officielles consultées

- [Supabase : RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase : MFA](https://supabase.com/docs/guides/auth/auth-mfa)
- [GitHub : sécurité des workflows](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub : environnements et limites selon le plan](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [Render : headers des sites statiques](https://render.com/docs/static-site-headers)
- [Cloudflare : validation serveur Turnstile](https://developers.cloudflare.com/turnstile/get-started/)
- [MDN : CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
