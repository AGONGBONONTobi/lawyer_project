# Déploiement sur IONOS

Le site est une application statique : il n'y a **aucun serveur applicatif à
faire tourner**. On construit un dossier de fichiers, on le dépose, c'est tout.
Toute la partie dynamique (domaines d'expertise, back office) est portée par
Supabase, qui est hébergé ailleurs.

---

## 1. Identifier son offre IONOS

La marche à suivre dépend du produit. Dans l'espace client IONOS, menu
**Hébergement** ou **Sites web & boutiques** :

| Ce qui est affiché | Offre | Section à suivre |
| --- | --- | --- |
| « Hébergement Web », « Webspace », un accès **SFTP** | mutualisé | §3 |
| « VPS », « Serveur Cloud », un accès **SSH root** | VPS | §4 |
| « Deploy Now » | CI/CD | §5 |

En cas de doute : s'il n'y a pas d'accès SSH, c'est du mutualisé.

---

## 2. Construire le site (commun à toutes les offres)

```bash
cd react-app
npm install
npm run build
```

Le dossier `dist/` est produit. C'est **son contenu** qui part en ligne.

### Attention aux variables d'environnement

Vite **fige les variables au moment du build**, elles ne sont pas lues à
l'exécution. Le fichier `.env` doit donc être présent et correct *avant* de
lancer `npm run build` :

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Sans lui, le site s'affiche normalement mais avec les trois domaines livrés par
défaut, et `/admin` répond « Back office non configuré ».

Vérification rapide avant de téléverser :

```bash
grep -c "supabase.co" dist/assets/*.js   # doit renvoyer au moins 1
grep -c "service_role" dist/assets/*.js  # doit renvoyer 0
```

La seconde commande est importante : seule la clé `anon` (ou `publishable`) a le
droit de figurer dans le bundle. Elle est publique par nature, ce sont les
politiques RLS qui protègent les données.

---

## 3. Hébergement mutualisé (webspace)

1. Récupérer les identifiants **SFTP** dans l'espace client IONOS. Ce ne sont pas
   ceux du compte IONOS : ils se trouvent dans *Hébergement → Accès SFTP*.

2. Se connecter avec FileZilla ou en ligne de commande, puis déposer **le contenu
   de `dist/`** (et non le dossier lui-même) dans le répertoire racine du site —
   généralement `/` ou `/htdocs`, parfois un dossier au nom du domaine.

   ```bash
   # exemple en ligne de commande
   cd react-app/dist
   sftp <utilisateur>@<hôte-ionos>
   > cd /
   > put -r *
   ```

3. **Vérifier que `.htaccess` est bien monté.** C'est un fichier caché : la
   plupart des clients FTP ne l'affichent pas par défaut, et l'oublier casse
   toutes les URL autres que la page d'accueil. Dans FileZilla :
   *Serveur → Forcer l'affichage des fichiers cachés*.

4. Pointer le domaine sur cet espace dans *Domaines & SSL*, et activer le
   certificat SSL s'il ne l'est pas.

### Si le site s'affiche mais que `/admin` renvoie une erreur 404

`.htaccess` n'est pas là, ou `mod_rewrite` est inactif. C'est le symptôme le plus
courant : le site est une application à page unique, seul `index.html` existe
réellement sur le disque, et c'est la règle de réécriture qui renvoie toutes les
autres URL vers lui.

### Si le site devient inaccessible juste après la mise en ligne

La redirection HTTPS en tête de `.htaccess` s'applique avant que le certificat
IONOS ne soit émis. Commenter les trois lignes `RewriteCond %{HTTPS}` … et les
remettre une fois le certificat actif.

---

## 4. VPS / serveur dédié

Servir `dist/` avec Nginx. La directive qui compte est le repli SPA :

```nginx
server {
    listen 80;
    server_name exemple.fr www.exemple.fr;
    root /var/www/badirou/dist;
    index index.html;

    # Repli SPA : même rôle que le .htaccess du mutualisé.
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(css|js|jpg|jpeg|png|svg|webp|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache, must-revalidate";
    }
}
```

HTTPS avec `certbot --nginx -d exemple.fr -d www.exemple.fr`.

---

## 5. Deploy Now

Brancher le dépôt GitHub, puis dans les réglages du projet :

- **Build command** : `cd react-app && npm ci && npm run build`
- **Dossier publié** : `react-app/dist`
- **Variables d'environnement** : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
  (indispensables — le build a lieu chez IONOS, pas sur le poste local)

Chaque push sur la branche configurée reconstruit et publie le site.

---

## 5b. Configurer EmailJS (formulaire de contact)

Le formulaire de contact utilise [EmailJS](https://www.emailjs.com/) pour envoyer les messages vers `badirou.avocat@gmail.com`.

### Étapes (une seule fois)

1. Créer un compte gratuit sur **emailjs.com**.
2. **Ajouter un service** : choisir *Gmail*, relier le compte `badirou.avocat@gmail.com`.
   - Copier le **Service ID** affiché.
3. **Créer un template** d'e-mail. Variables à inclure dans le corps :
   ```
   De : {{name}} <{{email}}>
   Téléphone : {{phone}}
   Sujet : {{subject}}
   
   {{message}}
   ```
   - Copier le **Template ID**.
4. Dans *Account → General*, copier la **Public Key**.
5. Renseigner les trois valeurs dans `react-app/.env` :
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
   ```
6. Si déployé via **Render** ou **IONOS Deploy Now**, ajouter ces trois variables dans les *Environment Variables* du service (même noms).

---

## 5c. Déployer l'Edge Function de gestion des comptes

L'onglet **Comptes** du back office utilise une Edge Function Supabase sécurisée.

### Prérequis

```bash
npm install -g supabase
supabase login
```

### Déploiement

```bash
cd react-app
supabase link --project-ref dzzkqlwdlzooejehufep   # l'ID de votre projet
supabase functions deploy manage-users
```

C'est tout — les variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont injectées automatiquement par Supabase dans la fonction. Aucune variable à configurer manuellement.

### Vérification

Après déploiement, l'URL de la fonction est :
```
https://dzzkqlwdlzooejehufep.supabase.co/functions/v1/manage-users
```

Un appel `GET` sans token doit retourner `401`. Un appel avec un token valide doit retourner la liste des comptes.

---


- [ ] La page d'accueil s'affiche
- [ ] `/mentions-legales` et `/confidentialite` répondent (test du routage)
- [ ] `/admin` mène à l'écran de connexion, et la connexion fonctionne
- [ ] Les trois domaines d'expertise s'affichent bien
- [ ] Le formulaire de contact envoie un message
- [ ] Le cadenas HTTPS est présent

### Ajouter le domaine de production à Supabase

Dans *Authentication → URL Configuration*, renseigner l'URL du site en **Site
URL** et en **Redirect URL**. Sans cela la connexion au back office peut échouer
en production alors qu'elle fonctionne en local.

---

## 7. Mises à jour ultérieures

Chaque modification du site demande un nouveau `npm run build` puis un nouveau
dépôt de `dist/`. **Les contenus gérés depuis le back office — domaines
d'expertise, images — n'en font pas partie** : ils vivent dans Supabase et sont
modifiables par le cabinet à tout moment, sans redéploiement.
