# Sauce Market — Admin

Panneau d'administration React + Vite + Tailwind, déployable sur Vercel.

## Démarrage local

```bash
cd admin
cp .env.example .env      # Renseigne VITE_API_URL
npm install
npm run dev               # http://localhost:5173
```

## Déploiement Vercel

### Option A — via l'interface web (recommandé)

1. Pousse le dossier `sauce-market/` sur un repo GitHub.
2. Va sur **https://vercel.com/new**.
3. Importe ton repo.
4. **Root Directory** = `admin` (important, sinon Vercel build la racine).
5. Vercel détecte Vite automatiquement.
6. Dans **Environment Variables**, ajoute :
   - `VITE_API_URL` = URL publique de ton backend (ex : `https://api.saucemarket.sn/v1`)
7. Clique **Deploy**. Vercel te donne une URL du type `https://sauce-market-admin.vercel.app`.

### Option B — via la CLI

```bash
npm i -g vercel
cd admin
vercel                    # premier déploiement (preview)
vercel --prod             # déploiement production
```

À la première exécution, Vercel demande :
- Scope (ton compte)
- Link to existing project ? **No**
- Project name : `sauce-market-admin`
- Directory : `.` (tu es déjà dans `admin/`)
- Override settings ? **No**

Puis définis les env vars :
```bash
vercel env add VITE_API_URL production
# Colle l'URL de ton backend
```

## Écrans

- `/login` — Connexion admin (email + mot de passe)
- `/` — Tableau de bord (MRR, GMV, utilisateurs actifs, graphique)
- `/users` — Liste utilisateurs, recherche, suspendre/vérifier
- `/products` — Modération (approuver/rejeter annonces en attente)
- `/subscriptions` — Suivi des abonnements par statut
- `/reports` — File des signalements
- `/config` — Commission, prix abo, prix boost (modifiables à chaud)

## Stack

| Lib | Usage |
|---|---|
| React 18 + Vite | App SPA |
| Tailwind CSS | Styling utility-first |
| React Router v6 | Routing |
| TanStack Query | Fetch + cache + invalidation |
| Zustand | Store auth |
| Axios | HTTP client avec interceptor JWT |
| Recharts | Graphiques du dashboard |
| Lucide | Icônes |

## Notes

- **Accès admin uniquement** : login vérifie `user.role === 'ADMIN'`. Les autres utilisateurs sont rejetés même s'ils ont des identifiants valides.
- Token stocké dans `localStorage` (acceptable pour un back-office interne; pour un panel client, préférer cookie HttpOnly).
- Le backend doit activer **CORS** pour l'origine Vercel (ajoute ton `*.vercel.app` dans `backend/src/server.js`).
