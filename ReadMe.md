# Ask4Skill — Auth & Coach Services

## HAOUILI YANI - HADJRES MOURAD - CHAUFOURNAIS LOIC

> On n’oublie pas le bonus du vendredi 05/09 (+2 ^^)

Plateforme en micro-services (pour l’instant **auth-service** et **coach-service**) + un **frontend** React.  
Objectif : gérer l’inscription/connexion, profils utilisateurs et profils *coach* (jeux, spécialités, palmarès, indisponibilités), avec recherche publique des coachs.

---

## 🧱 Stack & grandes lignes

- **Node.js / Express** (APIs REST)
- **Sequelize** (ORM) + **MySQL**
- **JWT** (authentification stateless) — même `JWT_SECRET` partagé entre services
- **Nodemailer** (emails de confirmation / reset)
- **Swagger UI** : documentation API sur `/api-docs`
- **CORS** activé
- **Logs et sécurité** : bannis, révocation de tokens, validations fortes

```
backend/
  auth-service/
    src/...
  coach-service/
    src/...
frontend/
  (React + Vite + MUI)
```

---

## 🚀 Démarrage rapide (local)

### 1) Prérequis
- Node 20+
- MySQL 8+ (DB et utilisateur configurés)
- MailDev (ou un SMTP équivalent) recommandé pour capturer les emails de test


### 2) Lancement de docker


```bash
cd docker/
# Lancer docker-compose
```

### 3) Migrations

Migrations (tables + seed des refs : roles, sexes, levels, connexion_types)
dans le contenaire auth-service et dans le contenaire de coach-service (shell) lancer :

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

> Verifié dans phpmyadmin (nom de la base : ask4skill) supprimer toutes les tables avant de faire les migrations



### 4) Frontend (facultatif pour tester l’UI)
```bash
cd frontend
npm i
npm run dev   # Vite démarre le front
```
Le front utilise React 19 + Vite + MUI. Configurez vos URLs API (ex: via variables ou un fichier `api.ts`) vers vos services `auth-service` et `coach-service`.

---

## 📚 Swagger / Documentation

- **Auth** : `http://localhost:<port-auth>/api-docs`
- **Coach** : `http://localhost:<port-coach>/api-docs`

---

## 🔐 auth-service — Endpoints & comportements

### Public
- **GET `/`** — ping (“Service auth-service OK”)
- **POST `/auth/register`** — inscription  
  Validations fortes (email, pseudo, âge, password policy), unicité email/pseudo, hash bcrypt, création d’un `EmailConfirmation` + **envoi d’e-mail** avec lien.
- **GET `/auth/confirm?token=…`** — confirmation d’e-mail  
  Vérifie expiration, marque `is_email_verified=true`, purge les tokens restants.
- **POST `/auth/login`** — login email+pwd  
  Refuse si e-mail non confirmé, vérifie ban actif, log de connexion (`ip`, `user_agent`), retourne **JWT (12h)**.
- **POST `/auth/forgot`** — demande de reset  
  Génère un token **1h**, envoie l’e-mail, nettoie les anciens tokens de reset.
- **POST `/auth/reset`** — réinitialise via token  
  Règles de complexité, hash, **invalide les JWT existants** via `TokenRevocation.invalid_before`, purge des resets.
- **GET `/auth/ref/roles|sexes|levels`** — tables de référence (seedées).
- **GET `/auth/validate/pseudo?pseudo=…[&exclude_id=…]`** — disponibilité d’un pseudo.

### Authentifié (JWT requis)
- **GET `/auth/me`** — profil utilisateur (sans `mot_de_passe`)
- **PATCH `/auth/me`** — MAJ profil (validations format/âge, existence FKs, unicité pseudo/téléphone)
- **POST `/auth/logout`** — invalide tous les JWT émis avant `now` (via `TokenRevocation`)

### Sécurité & Règles
- Middleware **ensureAuth** : vérifie JWT, charge l’utilisateur, refuse **bannis** (403), vérifie **TokenRevocation** (JWT antérieurs invalidés).
- **Password policy** : min 8, 1 maj, 1 min, 1 chiffre, 1 spécial.
- **Logs** de connexion + `derniere_connexion` mis à jour.

---

## 🧑‍🏫 coach-service — Endpoints & comportements

### Privé (JWT + rôle **COACH**/**ADMIN** requis)
- **GET `/coach/profile`** — retourne le profil coach de l’utilisateur courant.
- **POST `/coach/profile`** — crée le profil coach (unique par user) : `titre`, `devise (ISO4217)`, `prix_par_heure|replay|groupe`, flags (`disponible_actuellement`, `disponibilite_auto`, `est_certifie`).
- **PATCH `/coach/profile`** — met à jour les champs modifiables.

**Jeux**
- **GET `/coach/games`**
- **POST `/coach/games`** — ajoute un jeu (contrainte unique `coach_id+game`)
- **DELETE `/coach/games/:game`** — supprime un jeu (clé composite)

**Spécialités**
- **GET `/coach/specialites`**
- **POST `/coach/specialites`** — ajoute une spécialité (`coach_id+specialty` unique, normalisée en minuscule dans le validateur)
- **DELETE `/coach/specialites/:specialty`**

**Palmarès**
- **GET `/coach/palmares`**
- **POST `/coach/palmares`** — crée `titre` (requis), `description?`, `annee?`
- **PATCH `/coach/palmares/:id`**
- **DELETE `/coach/palmares/:id`**

**Indisponibilités**
- **GET `/coach/indisponibilites`** — liste (filtres `from`, `to`, `actif`)
- **POST `/coach/indisponibilites`** — crée un créneau **`repetitif`** (par `jour`) **ou** **`unique`** (par `date_unique`) avec `heure_debut < heure_fin`, `slot_max_par_heure >= 1`, `actif` par défaut `true`
- **PATCH `/coach/indisponibilites/:id`** — MAJ heures/jour/date/slot/actif (validations intégrées)
- **DELETE `/coach/indisponibilites/:id`**

### Public (sans auth)
- **GET `/coachs`** — recherche avec filtres :
  - `game`, `specialty`
  - `priceField` = `heure|replay|groupe` (défaut: `heure`)
  - `priceMin`, `priceMax` (bornes inclusives)
  - `sort` = `price_asc|price_desc|date_asc|date_desc` (défaut: `date_desc`)
- **GET `/coachs/:id`** — détail public du coach (profil **sans** `user_id` / `compte_stripe_id`) + `games`, `specialites`, `palmares`
- **GET `/coachs/:id/indisponibilites`** — liste publique des indispos (mêmes filtres)

### Autres routes utilitaires
- **GET `/health`** — état du service (uptime, timestamp)
- **GET `/api-docs`** — Swagger
- **GET `/`** — ping (“coach-service OK”)

---

## 🧩 MCD (extrait)

### Utilisateur & Référentiels
- `users` (profil de base : rôle, pseudo, email, hash, infos perso, flags, dates)
- `roles`, `sexes`, `levels` (seedées via migration)
- `users_provider` (prévu pour OAuth : google/steam/discord)
- `email_confirmations`, `password_resets`, `token_revocations`
- `bans` (ban actif → **403** global), `log_connexion`

### Coach & Dérivés
- `coach_profiles` (1–1 avec `users.id`)
- `coach_games` (unique `coach_id+game`)
- `coach_specialites` (unique `coach_id+specialty`)
- `coach_palmares` (auto-incrément)
- `indisponibilites` (créneaux `repetitif`/`unique`, `slot_max_par_heure`, `actif`)

> Les tables futures (conception esquissée) : `session`, `paiement`, `message`, `avis`, `notification`, `signalement`, `faq`…

---

## 🔁 Parcours conseillé (démo rapide)

> **Assume** : `AUTH=http://localhost:5000`, `COACH=http://localhost:5002` (si services sur des ports différents).

```bash
# 1) Vérifier
curl -s $AUTH/        # → Service auth-service OK
curl -s $COACH/health # → {status:ok,...}

# 2) Rôles & enregistrement d’un COACH
curl -s $AUTH/auth/ref/roles | jq .

curl -s -X POST $AUTH/auth/register -H "Content-Type: application/json" -d '{
  "email":"coach1@example.com",
  "password":"StrongP@ssw0rd!",
  "pseudo":"coach1",
  "prenom":"Jean",
  "nom":"Coach",
  "role_id":2
}' | jq .

# (Confirmer l’email via le lien reçu — en dev via MailDev)

# 3) Login → récupérer le JWT
JWT=$(curl -s -X POST $AUTH/auth/login -H "Content-Type: application/json" \
  -d '{"email":"coach1@example.com","password":"StrongP@ssw0rd!"}' | jq -r .token)

# 4) Créer le profil coach
curl -s -X POST $COACH/coach/profile \
  -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" \
  -d '{
    "titre":"Coach Valorant FR",
    "devise":"EUR",
    "prix_par_heure":45,
    "prix_replay":15,
    "prix_session_groupe":25,
    "disponible_actuellement":true
  }' | jq .

COACH_ID=$(curl -s $COACH/coach/profile -H "Authorization: Bearer $JWT" | jq -r .id)

# 5) Jeux & spécialités
curl -s -X POST $COACH/coach/games -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" -d '{"game":"Valorant"}' | jq .

curl -s -X POST $COACH/coach/specialites -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" -d '{"specialty":"individuel"}' | jq .

# 6) Palmarès
PALM=$(curl -s -X POST $COACH/coach/palmares -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" -d '{"titre":"Champion Régional","description":"Tournoi 2024","annee":2024}')

PALM_ID=$(echo "$PALM" | jq -r .id)

# 7) Indispos
curl -s -X POST $COACH/coach/indisponibilites -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"type":"repetitif","jour":"lundi","heure_debut":"09:00:00","heure_fin":"12:00:00","slot_max_par_heure":2}' | jq .

curl -s -X POST $COACH/coach/indisponibilites -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"type":"unique","date_unique":"2025-09-20","heure_debut":"14:00:00","heure_fin":"16:00:00"}' | jq .

# 8) Recherche publique
curl -s "$COACH/coachs?game=Valorant&specialty=individuel&priceField=heure&priceMin=40&priceMax=50&sort=price_asc" | jq .

# 9) Détail public
curl -s "$COACH/coachs/$COACH_ID" | jq .
```

---

## ⚙️ Notes techniques & décisions

- **Rôles** : 1=`JOUEUR`, 2=`COACH`, 3=`ADMIN` (seedés en migration)
- **ensureCoach** (coach-service) : autorise `role_id ∈ {2,3}`
- **Clés d’unicité** : `coach_games (coach_id, game)` et `coach_specialites (coach_id, specialty)`
- **Indispos** :
  - `repetitif` ⇒ filtre par `jour`
  - `unique` ⇒ filtre par `date_unique`
  - contrôles `HH:mm:ss`, `heure_debut < heure_fin`, `slot_max_par_heure ≥ 1`
- **Révocation JWT** : `TokenRevocation.invalid_before` rend invalides tous les tokens émis avant cet instant (logout, reset pwd).
- **Bannis** : si `ban.actif` et non expiré ⇒ API retourne **403** partout (auth-service).
- **Swagger** : base déjà branchée, annotations à enrichir au fil des routes.

---

## 🧪 Dépendances principales

**Frontend**
- React 19 + Vite + MUI (`@mui/material`, `@emotion/*`), `axios`, `react-router-dom`

**Auth-service**
- `express`, `sequelize`, `mysql2`, `jsonwebtoken`, `bcrypt`, `nodemailer`, `validator`, `swagger-*`

**Coach-service**
- `express`, `sequelize`, `mysql2`, `jsonwebtoken`, `joi` (schemas), `swagger-*`

--- 

## ✅ Santé & monitoring

- **GET `/health`** (coach-service) : `status`, `uptime_sec`, `timestamp`
- Pings racine : `GET /` sur chaque service
- Healthcheck Docker (curl la racine)

