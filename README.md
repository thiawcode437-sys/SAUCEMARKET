# 🛍️ Sauce Market

**Marketplace mobile-first pour le Sénégal** — Acheter, vendre, échanger. Abonnement mensuel pour vendeurs, paiements Wave/Orange Money/Free Money.

---

## 📑 Sommaire

1. [Architecture technique](#1-architecture-technique)
2. [Schéma de base de données](#2-schéma-de-base-de-données)
3. [API Endpoints](#3-api-endpoints)
4. [UI/UX Maquettes](#4-uiux-maquettes)
5. [Code de base & démarrage](#5-code-de-base--démarrage)
6. [Modèle économique](#6-modèle-économique)
7. [Roadmap](#7-roadmap)

---

## 1. Architecture technique

### Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────────┐
│                       CLIENTS                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐   │
│  │  Mobile (Expo)   │  │  Web Admin (Vite)│  │  PWA légère   │   │
│  │  React Native    │  │  React + Shadcn  │  │  (Fallback 2G)│   │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘   │
└───────────┼─────────────────────┼────────────────────┼───────────┘
            │ HTTPS/WSS           │                    │
            ▼                     ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Nginx)                         │
│          Rate-limit · TLS · Compression Brotli · Cache CDN       │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                 BACKEND — Node.js / Express                      │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────┐  │
│  │   Auth   │ │ Products │ │Subscription│ │ Messages│ │ Admin │  │
│  │ JWT+OTP  │ │  CRUD    │ │  Billing   │ │Socket.IO│ │Panel  │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────┘ └───────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Services: Payment · Notification · Upload · Search       │  │
│  └────────────────────────────────────────────────────────────┘  │
└────┬──────────────┬──────────────┬──────────────┬───────────────┘
     ▼              ▼              ▼              ▼
┌─────────┐  ┌─────────────┐ ┌───────────┐ ┌────────────────┐
│PostgreSQL│ │ Redis Cache │ │ S3/Cloud  │ │  FCM + Twilio  │
│(Prisma)  │ │ Session+Job │ │Cloudinary │ │  Push + SMS    │
└─────────┘  └─────────────┘ └───────────┘ └────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│         PASSERELLES PAIEMENT LOCALES (Sénégal)                   │
│   Wave API  ·  Orange Money API  ·  Free Money  ·  PayDunya      │
└──────────────────────────────────────────────────────────────────┘
```

### Stack technique

| Couche | Technologie | Raison |
|---|---|---|
| **Mobile** | React Native (Expo SDK 51) | 1 code Android+iOS, OTA updates, rapide à déployer |
| **Web Admin** | React + Vite + Tailwind + shadcn/ui | Dashboard admin moderne |
| **Backend** | Node.js 20 + Express | Écosystème riche, async I/O parfait pour marketplace |
| **ORM** | Prisma | Type-safe, migrations simples |
| **DB** | PostgreSQL 16 | Transactions ACID pour paiements/abonnements |
| **Cache** | Redis | Sessions, rate-limit, file d'attente BullMQ |
| **Temps réel** | Socket.IO | Chat + notifications |
| **Stockage** | Cloudinary | Images auto-optimisées (WebP, compression) |
| **Paiement** | PayDunya (agrégateur) + Wave direct | Couvre Wave, OM, Free en 1 intégration |
| **Notif** | Firebase Cloud Messaging + SMS Twilio/Orange | Push + SMS OTP |
| **Recherche** | PostgreSQL `tsvector` (puis Meilisearch si >100k produits) | Léger au départ |
| **Hosting** | Render/Railway (backend) · Cloudflare (CDN) | Low-cost, scaling simple |
| **CI/CD** | GitHub Actions | Build + test + déploiement auto |

### Choix optimisés pour le marché sénégalais

- **Mobile-first** : UI optimisée pour écrans 5-6", mode une main.
- **Low-bandwidth** : images servies en WebP 80% qualité, lazy-load, pagination `cursor`.
- **Offline-first** : cache local `AsyncStorage` + `@tanstack/react-query` avec `persistQueryClient`.
- **OTP SMS** : OTP via Orange SMS API (moins cher que Twilio au Sénégal).
- **Français + Wolof** : i18n via `i18next`, fichiers `fr.json` / `wo.json`.

---

## 2. Schéma de base de données

Voir [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) pour l'implémentation exécutable.

### Diagramme relationnel (ERD)

```
 ┌─────────────┐       ┌──────────────┐        ┌──────────────┐
 │    User     │──1:N──│ Subscription │        │   Category   │
 │─────────────│       │──────────────│        │──────────────│
 │ id          │       │ id           │        │ id           │
 │ phone       │       │ userId FK    │        │ name         │
 │ email       │       │ plan         │        │ nameWolof    │
 │ name        │       │ amount       │        │ icon         │
 │ role        │       │ status       │        │ parentId FK  │
 │ avatarUrl   │       │ startsAt     │        └──────┬───────┘
 │ city        │       │ endsAt       │               │ 1:N
 │ isVerified  │       │ provider     │               ▼
 │ ratingAvg   │       │ ref          │        ┌──────────────┐
 │ createdAt   │       └──────────────┘        │   Product    │
 └──────┬──────┘                               │──────────────│
        │ 1:N                                  │ id           │
        ├──────────────────────────────────────│ sellerId FK  │
        │                                      │ categoryId FK│
        │ 1:N                                  │ title        │
        │                  ┌───────────────────│ description  │
        │                  │                   │ price        │
        ▼                  ▼                   │ currency     │
 ┌──────────────┐   ┌──────────────┐           │ stock        │
 │ Conversation │   │    Review    │           │ status       │
 │──────────────│   │──────────────│           │ city         │
 │ id           │   │ id           │           │ views        │
 │ buyerId FK   │   │ productId FK │           │ isPromoted   │
 │ sellerId FK  │   │ authorId FK  │           │ promoUntil   │
 │ productId FK │   │ targetId FK  │           │ createdAt    │
 │ lastMessage  │   │ rating 1-5   │           └──────┬───────┘
 │ updatedAt    │   │ comment      │                  │ 1:N
 └──────┬───────┘   └──────────────┘                  ▼
        │ 1:N                                  ┌──────────────┐
        ▼                                      │ ProductImage │
 ┌──────────────┐                              │──────────────│
 │   Message    │                              │ id           │
 │──────────────│                              │ productId FK │
 │ id           │                              │ url          │
 │ convId FK    │                              │ order        │
 │ senderId FK  │                              └──────────────┘
 │ body         │
 │ imageUrl     │                              ┌──────────────┐
 │ readAt       │                              │    Order     │
 │ createdAt    │                              │──────────────│
 └──────────────┘                              │ id           │
                                               │ buyerId FK   │
 ┌──────────────┐                              │ sellerId FK  │
 │    Report    │                              │ productId FK │
 │──────────────│                              │ amount       │
 │ id           │                              │ commission   │
 │ reporterId FK│                              │ status       │
 │ targetType   │                              │ paymentRef   │
 │ targetId     │                              │ createdAt    │
 │ reason       │                              └──────────────┘
 │ status       │
 └──────────────┘                              ┌──────────────┐
                                               │ Notification │
 ┌──────────────┐                              │──────────────│
 │   OtpCode    │                              │ id           │
 │──────────────│                              │ userId FK    │
 │ phone        │                              │ type         │
 │ code (hash)  │                              │ payload JSON │
 │ expiresAt    │                              │ readAt       │
 │ attempts     │                              └──────────────┘
 └──────────────┘
```

### Tables clés

| Table | Rôle | Indexation critique |
|---|---|---|
| `User` | Tous les utilisateurs (acheteur/vendeur/admin) | `phone` UNIQUE, `email` UNIQUE |
| `Subscription` | Abonnements mensuels vendeurs | `userId`, `status` partial idx `active` |
| `Product` | Annonces/produits | `sellerId`, `categoryId`, `city`, GIN sur `tsvector(title, description)` |
| `ProductImage` | Images multiples par produit | `productId` |
| `Category` | Taxonomie hiérarchique | `parentId` |
| `Conversation` + `Message` | Chat 1:1 acheteur/vendeur | `(buyerId, sellerId, productId)` UNIQUE |
| `Order` | Transactions + commission | `buyerId`, `sellerId`, `status` |
| `Review` | Notes & avis vendeurs | `targetId` (user noté) |
| `Report` | Signalements | `targetType`, `status` |
| `Notification` | Inbox in-app | `userId`, `readAt` IS NULL |
| `OtpCode` | Codes OTP temporaires | TTL via `expiresAt` + cron de purge |

**Règles métier DB :**
- `Product.status` ne peut passer à `PUBLISHED` que si le vendeur a `Subscription.status = ACTIVE` (vérif applicative + trigger).
- `Order.commission` = `Order.amount × commission_rate` (config admin, défaut 5%).
- `Review` : 1 avis max par couple `(authorId, targetId, orderId)`.

---

## 3. API Endpoints

Base URL : `https://api.saucemarket.sn/v1`

### Conventions

- REST + JSON. Auth : header `Authorization: Bearer <JWT>`.
- Pagination cursor : `?cursor=<id>&limit=20`.
- Erreurs : `{ "error": { "code": "INVALID_OTP", "message": "..." } }`.
- WebSocket : `wss://api.saucemarket.sn/ws` (Socket.IO, auth via `auth.token`).

### 🔐 Auth

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Créer compte (phone/email, password optionnel) |
| `POST` | `/auth/otp/request` | Demander OTP SMS (phone) |
| `POST` | `/auth/otp/verify` | Vérifier OTP → retourne JWT |
| `POST` | `/auth/login` | Login email+password |
| `POST` | `/auth/refresh` | Refresh token |
| `POST` | `/auth/logout` | Révoquer session |
| `GET` | `/auth/me` | Profil courant |
| `PATCH` | `/auth/me` | MAJ profil (nom, avatar, ville) |

### 💳 Subscription

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/subscriptions/plans` | Liste plans disponibles |
| `POST` | `/subscriptions` | Souscrire → renvoie URL paiement |
| `GET` | `/subscriptions/me` | Mon abonnement actuel |
| `POST` | `/subscriptions/cancel` | Annuler (reste actif jusqu'à `endsAt`) |
| `POST` | `/webhooks/payment` | Webhook paiement (Wave/OM/PayDunya) |

### 🛍️ Produits

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | Liste + filtres `?q=&category=&city=&minPrice=&maxPrice=&cursor=` |
| `GET` | `/products/:id` | Détail produit (incrémente `views`) |
| `POST` | `/products` | Publier (vendeur actif uniquement) |
| `PATCH` | `/products/:id` | MAJ (propriétaire) |
| `DELETE` | `/products/:id` | Supprimer |
| `POST` | `/products/:id/images` | Upload image(s) — multipart |
| `POST` | `/products/:id/promote` | Booster (paiement) |
| `GET` | `/products/mine` | Mes annonces (vendeur) |
| `GET` | `/categories` | Arbre catégories |

### 💬 Messagerie

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/conversations` | Liste conversations |
| `POST` | `/conversations` | Ouvrir une conv (à partir d'un produit) |
| `GET` | `/conversations/:id/messages` | Historique |
| `POST` | `/conversations/:id/messages` | Envoyer (texte ou image) |
| `POST` | `/conversations/:id/read` | Marquer lu |
| **WS** | `message:new` | Push nouveau message |
| **WS** | `message:read` | Accusé lecture |
| **WS** | `typing` | Indicateur frappe |

### 💰 Commandes & Paiement

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Initier achat → URL paiement |
| `GET` | `/orders/mine` | Mes commandes (acheteur/vendeur) |
| `GET` | `/orders/:id` | Détail |
| `POST` | `/orders/:id/confirm` | Confirmer réception |
| `POST` | `/orders/:id/dispute` | Ouvrir litige |

### ⭐ Avis & Signalements

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/reviews` | Noter un vendeur (après commande) |
| `GET` | `/users/:id/reviews` | Avis d'un vendeur |
| `POST` | `/reports` | Signaler produit/user |

### 📊 Dashboard vendeur

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/seller/stats` | KPIs : ventes, vues, revenu, top produits |
| `GET` | `/seller/revenue?from=&to=` | Série temporelle |

### 🛠 Admin

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/users` | Liste + filtres |
| `PATCH` | `/admin/users/:id` | Bloquer/vérifier |
| `GET` | `/admin/subscriptions` | Toutes souscriptions |
| `GET` | `/admin/products?status=pending` | Modération |
| `POST` | `/admin/products/:id/approve` | Approuver |
| `GET` | `/admin/reports` | File signalements |
| `GET` | `/admin/stats` | KPIs globaux (GMV, MAU, churn) |
| `PATCH` | `/admin/config` | Commission, prix abonnement |

---

## 4. UI/UX Maquettes

### Principes de design

- **Mobile-first**, écrans 360×640 de référence.
- **Couleurs** : primaire `#16A34A` (vert Sénégal), accent `#EAB308` (or), neutre `#0F172A`.
- **Typographie** : Inter (EN/FR), Noto Sans pour chars diacritiques wolof.
- **Composants** : boutons 48px min (tactile), contrastes AA, icônes Phosphor.
- **Inspirations** : WhatsApp (chat épuré) + Jumia (cartes produit) + Wave (paiement en 2 taps).

### Écrans principaux

#### 4.1 Onboarding / Auth

```
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│  🛍️ Sauce Market   │   │  Entre ton numéro  │   │  Code reçu par SMS │
│                    │   │                    │   │                    │
│  Achète, vends,    │   │  🇸🇳 +221 ___ __ __│   │    ┌─┬─┬─┬─┬─┬─┐   │
│  chat directement  │   │                    │   │    │ │ │ │ │ │ │   │
│                    │   │  [ Recevoir code ] │   │    └─┴─┴─┴─┴─┴─┘   │
│  [ Commencer ]     │   │                    │   │                    │
│                    │   │  Déjà un compte ?  │   │  Renvoyer (30s)    │
│  [ J'ai un compte ]│   │  Se connecter      │   │                    │
└────────────────────┘   └────────────────────┘   └────────────────────┘
```

#### 4.2 Home / Marketplace

```
┌────────────────────────────────┐
│ 📍 Dakar ▾        🔔  💬      │ ← Header : ville, notif, chat
├────────────────────────────────┤
│ 🔍 Rechercher un produit...    │ ← Search sticky
├────────────────────────────────┤
│ [Tous][Mode][Tech][Maison]►   │ ← Chips catégories scroll-x
├────────────────────────────────┤
│ 🔥 Promotions                  │
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │ IMG  │ │ IMG  │ │ IMG  │    │ ← Carousel produits boostés
│ │15 000│ │ 5 000│ │25 000│    │
│ └──────┘ └──────┘ └──────┘    │
├────────────────────────────────┤
│ Près de toi                    │
│ ┌────────┐ ┌────────┐          │
│ │ IMG    │ │ IMG    │          │ ← Grid 2 col
│ │ Samsung│ │ Robe   │          │
│ │ 85 000 │ │ 12 000 │          │
│ │ ⭐ 4.8 │ │ ⭐ 4.5 │          │
│ │ Dakar  │ │ Thiès  │          │
│ └────────┘ └────────┘          │
├────────────────────────────────┤
│ 🏠 🔍  ➕  💬  👤            │ ← Tab bar (Home/Search/Publier/Chat/Profil)
└────────────────────────────────┘
```

#### 4.3 Détail produit

```
┌────────────────────────────────┐
│ ← [Image 1/4 swipe] ♡          │ ← Retour + fav
├────────────────────────────────┤
│ Samsung Galaxy A54             │
│ 💰 85 000 FCFA     ⭐ 4.8 (24) │
│ 📍 Dakar, Plateau · il y a 2j  │
├────────────────────────────────┤
│ Description                    │
│ Téléphone comme neuf, 128 Go,  │
│ boîte d'origine, garantie...   │
├────────────────────────────────┤
│ 👤 Vendeur                     │
│ ┌────┐ Modou D. ✓ Vérifié     │
│ │AVA │ ⭐ 4.9 · 32 ventes       │
│ └────┘ [ Voir profil ]         │
├────────────────────────────────┤
│ [ 💬 Contacter ]  [ 🛒 Acheter]│ ← CTAs collants bas
└────────────────────────────────┘
```

#### 4.4 Publier un produit

```
┌────────────────────────────────┐
│ ← Publier                 [✓]  │
├────────────────────────────────┤
│ 📷 Ajoute des photos (max 6)   │
│ ┌────┐┌────┐┌────┐┌────┐      │
│ │ ➕ ││IMG ││IMG ││ ➕ │      │
│ └────┘└────┘└────┘└────┘      │
├────────────────────────────────┤
│ Titre *                        │
│ ┌──────────────────────────┐  │
│ │                          │  │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ Catégorie *          [Choisir▾]│
│ Prix (FCFA) *    [         ]   │
│ Ville            [Dakar    ▾]  │
│ Description                    │
│ ┌──────────────────────────┐  │
│ │                          │  │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ ⚠️ Abonnement requis           │ ← Si pas abonné
│ [ Activer pour 1 000 FCFA/mois]│
└────────────────────────────────┘
```

#### 4.5 Chat

```
┌────────────────────────────────┐
│ ← Modou D.  ●en ligne  ⋮       │
│   Samsung Galaxy A54 · 85 000  │ ← Contexte produit
├────────────────────────────────┤
│                                │
│    ┌─────────────────┐         │
│    │ Bonjour, dispo? │         │
│    └─────────────────┘ 14:02   │
│                                │
│         ┌────────────────────┐ │
│         │ Oui, tu passes où? │ │
│         │                 ✓✓ │ │
│         └────────────────────┘ │
│                          14:03 │
│                                │
├────────────────────────────────┤
│ 📎 [ Écrire un message...] ➤  │
└────────────────────────────────┘
```

#### 4.6 Profil / Dashboard vendeur

```
┌────────────────────────────────┐
│ ┌────┐ Modou Diop ✓           │
│ │AVA │ ⭐ 4.9 · 32 ventes       │
│ └────┘ 📍 Dakar                │
│        [ Modifier profil ]     │
├────────────────────────────────┤
│ 💼 Abonnement : Actif          │
│    Expire le 19/05/2026        │
│    [ Renouveler ]              │
├────────────────────────────────┤
│ 📊 Ce mois                     │
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │Ventes│ │ Vues │ │Revenu│    │
│ │  12  │ │ 1.2k │ │250k  │    │
│ └──────┘ └──────┘ └──────┘    │
├────────────────────────────────┤
│ Mes annonces (8)       [ ➕ ]  │
│ ┌──────────────────────────┐  │
│ │ IMG  Samsung A54 · 85k   │  │
│ │      👁 245 · 💬 12       │  │
│ └──────────────────────────┘  │
└────────────────────────────────┘
```

#### 4.7 Abonnement

```
┌────────────────────────────────┐
│ ← Devenir vendeur              │
├────────────────────────────────┤
│   💼                           │
│   Publie jusqu'à 50 annonces   │
│   Badge vendeur vérifié        │
│   Statistiques détaillées      │
│   Priorité support             │
├────────────────────────────────┤
│   1 000 FCFA / mois            │
│                                │
│   Choisis ton paiement :       │
│   ┌──────────────────────────┐ │
│   │ 🟦 Wave                  │ │
│   └──────────────────────────┘ │
│   ┌──────────────────────────┐ │
│   │ 🟧 Orange Money          │ │
│   └──────────────────────────┘ │
│   ┌──────────────────────────┐ │
│   │ 🟩 Free Money            │ │
│   └──────────────────────────┘ │
│                                │
│   [ Confirmer 1 000 FCFA ]     │
└────────────────────────────────┘
```

---

## 5. Code de base & démarrage

### Arborescence

```
sauce-market/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           # Modèle BDD complet
│   ├── src/
│   │   ├── config/db.js            # Prisma client + Redis
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT + role guard
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── subscriptionController.js
│   │   │   ├── messageController.js
│   │   │   ├── reviewController.js
│   │   │   └── adminController.js
│   │   ├── routes/index.js
│   │   ├── services/
│   │   │   ├── paymentService.js   # Wave / OM / PayDunya
│   │   │   ├── otpService.js       # SMS OTP
│   │   │   └── socketService.js    # Chat temps réel
│   │   ├── utils/jwt.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── navigation/AppNavigator.js
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── OtpScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── ProductDetailScreen.js
│   │   │   ├── PublishProductScreen.js
│   │   │   ├── ChatScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── SubscriptionScreen.js
│   │   ├── components/ProductCard.js
│   │   ├── services/api.js
│   │   ├── store/authStore.js      # Zustand
│   │   └── theme/colors.js
│   ├── App.js
│   └── package.json
│
└── docs/
    └── ARCHITECTURE.md
```

### Démarrage rapide

**Backend :**
```bash
cd backend
cp .env.example .env           # Configure DATABASE_URL, JWT_SECRET, PAYDUNYA_KEY...
npm install
npx prisma migrate dev         # Crée le schéma en local
npm run seed                   # Catégories + admin par défaut
npm run dev                    # http://localhost:4000
```

**Mobile :**
```bash
cd mobile
npm install
npx expo start                 # Scan QR avec app Expo Go
```

Voir le code dans les fichiers du repo.

---

## 6. Modèle économique

| Source | Détail | Est. MRR (500 vendeurs actifs) |
|---|---|---|
| **Abonnement** | 1 000 FCFA/mois × 500 | **500 000 FCFA** |
| **Commission** | 5% sur ventes payées in-app (GMV ~10M) | **500 000 FCFA** |
| **Promotion** | Boost 500 FCFA / 7 jours × 200/mois | **100 000 FCFA** |
| **Total MRR** | | **≈ 1 100 000 FCFA** |

**Coûts mensuels estimés** : hosting (30k) + SMS OTP (40k) + Cloudinary (15k) + domaine/CDN (5k) ≈ **90 000 FCFA**.

Break-even : ~50 abonnés actifs.

---

## 7. Roadmap

### 🟢 MVP (4-6 semaines)
- [x] Auth OTP
- [x] Abonnement Wave/OM via PayDunya
- [x] Publier / parcourir produits
- [x] Chat acheteur-vendeur
- [x] Avis & signalements
- [x] Dashboard vendeur basique
- [x] Admin panel minimal

### 🟡 v1.1 (2 mois)
- [ ] Paiement in-app + escrow
- [ ] Mode Wolof complet
- [ ] Notifications push FCM
- [ ] Recherche Meilisearch
- [ ] App Store + Play Store

### 🔵 v1.2
- [ ] Livraison (partenariat Yango/Paps)
- [ ] Vérification KYC vendeurs haut volume
- [ ] Programme parrainage
- [ ] Boutique web publique (SEO)

---

## Licence

© 2026 Sauce Market. Tous droits réservés.
