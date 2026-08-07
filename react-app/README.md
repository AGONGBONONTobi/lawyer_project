# Site du cabinet Moradéké Badirou

Site vitrine (React 19 + Vite + Tailwind) et son back office.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Back office — domaines d'expertise

Le cabinet édite lui-même la section « Domaines d'intervention » de la page
d'accueil : titre, sous-titre, points, image, ordre d'affichage, et masquage
d'un domaine sans le supprimer.

| Adresse | Écran |
| --- | --- |
| `/admin` | Redirige vers la liste des domaines |
| `/admin/connexion` | Connexion (e-mail + mot de passe) |
| `/admin/domaines` | Liste et édition |

Ces adresses ne sont volontairement liées depuis aucune page publique.

### Mise en service

1. **Créer les tables et le bucket.** Exécuter
   [`supabase/domaines_schema.sql`](supabase/domaines_schema.sql) dans le SQL
   Editor du projet Supabase. Le script crée la table `domaines`, ses politiques
   RLS, le bucket de stockage `domaines`, et insère les trois domaines d'origine.

2. **Créer le compte du cabinet.** Dans Supabase, *Authentication → Users → Add
   user*. **Il n'y a pas d'inscription publique** : les politiques RLS autorisent
   l'écriture à tout compte authentifié, donc un formulaire d'inscription ouvert
   reviendrait à laisser n'importe qui modifier le site.

3. **Renseigner l'environnement.** Copier `.env.example` en `.env` et remplir :

   ```bash
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```

   La clé `anon` est publique par nature — elle part dans le bundle. Ce qui
   protège les données, ce sont les politiques RLS. Ne jamais placer la clé
   `service_role` ici.

### Comportement sans Supabase

Le site public **fonctionne sans configuration** : il affiche alors les trois
domaines livrés en dur dans `src/lib/domaines.js`. C'est aussi le repli en cas
de coupure Supabase ou de table vide — la section ne peut pas se retrouver vide
sur le site d'un cabinet en production. Seul `/admin` devient indisponible, et
le dit explicitement à l'écran.

### Points d'attention

- **Le `slug` ne suit le titre que sur une création.** Le modifier ensuite
  casserait la clé de rendu ; le champ est donc figé une fois la fiche créée.
- **Les images téléversées ne sont pas supprimées du bucket** quand on change
  l'image d'un domaine ou qu'on supprime la fiche. À nettoyer périodiquement
  depuis la console Supabase si le volume devient gênant.
- **Les styles du back office sont hors cascade Tailwind** (bloc `.admin` en fin
  de `src/index.css`). Les règles de formulaire du site public sont posées sur
  des sélecteurs d'élément nus, qui l'emportent sur les classes utilitaires :
  restyler les champs d'administration avec des classes Tailwind ne
  fonctionnerait pas.
