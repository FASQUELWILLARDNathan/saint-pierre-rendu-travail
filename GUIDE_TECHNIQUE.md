# 🔧 Guide Technique - Maintenance du Code

Documentation pour les développeurs/informaticiens qui maintiennent la plateforme.

---

## 📂 Structure du projet

```
saint-pierre-rendu-travail/
├── backend/                    # Serveur Express (Node.js)
│   ├── app.ts                 # Configuration app
│   ├── server.ts              # Point d'entrée
│   ├── config.ts              # Config (JWT, Prisma, etc)
│   ├── routes/                # Endpoints API
│   │   ├── auth.ts            # Connexion/authentification
│   │   ├── users.ts           # Gestion utilisateurs
│   │   ├── import.ts          # Import Excel élèves/profs
│   │   ├── cours.ts           # Gestion des cours
│   │   ├── devoirs.ts         # Gestion des devoirs
│   │   ├── rendus.ts          # Gestion des rendus
│   │   └── ...
│   ├── middleware/            # Middlewares Express
│   │   ├── auth.ts            # JWT authentication
│   │   ├── role.ts            # Vérification des rôles
│   │   ├── security-headers.ts # Headers de sécurité
│   │   └── ...
│   ├── services/              # Logique métier
│   │   ├── cron-manager.ts    # Tasks planifiées
│   │   └── cleanup-*.ts       # Nettoyage périodique
│   └── types/                 # Types TypeScript
├── src/                        # Frontend Vue.js
│   ├── pages/                 # Pages Vue
│   ├── components/            # Composants Vue
│   ├── stores/                # Pinia stores (état)
│   ├── router.ts              # Routes frontend
│   └── utils/                 # Utilitaires
├── prisma/                     # ORM Prisma
│   ├── schema.prisma          # Schéma BD
│   ├── migrations/            # Historique migrations
│   └── seed.ts                # Données initiales
├── docker/                     # Docker config
├── docker-compose.yml         # Config dev
├── docker-compose-prod.yml    # Config prod
├── vite.config.ts             # Config Vite (bundler)
├── tsconfig.json              # Config TypeScript
└── package.json               # Dépendances npm
```

---

## 🗄️ Schéma base de données

```sql
-- Utilisateurs (table principale)
utilisateur
├── id_user (PK)
├── nom, prenom
├── login (unique)
├── email (unique)
├── hashed_password
├── role: ENUM('administrateur', 'professeur', 'eleve')
└── created_at

-- Extensions utilisateur
eleve
├── id_user (FK → utilisateur)
├── id_classe (FK → classe)
├── annee
├── specialites (M:M → EleveSpecialite)
└── options (M:M → EleveOption)

professeur
├── id_user (FK → utilisateur)
├── matiere (FK → matiere)
├── classes_enseignees (M:M → ClasseProfesseur)
├── specialites_enseignees (M:M → ProfesseurSpecialite)
└── options_enseignees (M:M → ProfesseurOption)

-- Structures académiques
classe
├── id_classe (PK)
├── niveau (ex: Terminale)
├── lettre (A, B, C...)
├── nom_classe (ex: Terminale A) [UNIQUE]
└── eleves, professeurs, cours...

matiere
├── id_matiere (PK)
├── nom_matiere [UNIQUE]
└── cours, evenements...

specialite & option
├── Structures pour les filières
└── Liaisons M:M avec élèves/profs

-- Contenu académique
cours
├── id_cours (PK)
├── id_professeur (FK)
├── id_classe (FK)
├── id_matiere (FK)
└── titre, description, date_cours...

devoir
├── id_devoir (PK)
├── id_professeur (FK)
├── id_classe (FK)
├── titre, description, date_limite
└── attachements...

rendu
├── id_rendu (PK)
├── id_eleve (FK)
├── id_devoir (FK)
├── fichier_rendu
├── date_rendu
├── note, feedback...
└── status (en attente, rendu, corrigé)
```

---

## 🔌 API Endpoints clés

### Authentification

```
POST   /api/auth/login          Connexion
POST   /api/auth/logout         Déconnexion
POST   /api/auth/refresh        Rafraîchir JWT
POST   /api/auth/forgot         Oublié mot de passe
POST   /api/auth/reset          Réinitialiser mot de passe
```

### Utilisateurs (Admin)

```
GET    /api/users/eleves/list   Liste élèves
GET    /api/users/profs/list    Liste profs
POST   /api/users               Créer utilisateur
GET    /api/users/:id           Détails utilisateur
PUT    /api/users/:id           Modifier utilisateur
DELETE /api/users/:id           Supprimer utilisateur
```

### Import Excel

```
POST   /api/import/profs        Importer professeurs
POST   /api/import/eleves       Importer élèves
GET    /api/import/template     Télécharger template
```

### Cours

```
GET    /api/cours               Liste cours
POST   /api/cours               Créer cours
GET    /api/cours/:id           Détails cours
PUT    /api/cours/:id           Modifier cours
DELETE /api/cours/:id           Supprimer cours
```

### Devoirs

```
GET    /api/devoirs             Liste devoirs
POST   /api/devoirs             Créer devoir
GET    /api/devoirs/:id         Détails devoir
PUT    /api/devoirs/:id         Modifier devoir
DELETE /api/devoirs/:id         Supprimer devoir
```

### Rendus

```
GET    /api/rendus              Liste rendus
POST   /api/rendus              Envoyer rendu
GET    /api/rendus/:id          Détails rendu
PUT    /api/rendus/:id          Corriger rendu
DELETE /api/rendus/:id          Supprimer rendu
```

Voir `/swagger` pour la documentation complète.

---

## 🛠️ Développement local

### Setup initial

```bash
# Installation
npm install
npx prisma generate

# Démarrer API + Frontend
npm run dev:api          # Terminal 1 (port 5000)
npm run dev             # Terminal 2 (port 5173)

# Database
npm run prisma:studio   # Terminal 3 (port 5555)
```

### Workflow développement

```bash
# 1. Éditer le schéma Prisma
# 2. Créer migration
npx prisma migrate dev --name description

# 3. Éditer le code backend/frontend
# 4. Les serveurs redémarrent auto (watch mode)

# 5. Tester les changements
npm run test
npm run test:coverage

# 6. Formater le code
npm run format
```

---

## 🚀 Déploiement

### Build production

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build-only

# Vérifier TypeScript
npm run type-check
```

### Lancer en production

```bash
docker compose -f docker-compose-prod.yml up -d --build

# Vérifier
docker compose -f docker-compose-prod.yml ps
docker compose -f docker-compose-prod.yml logs -f
```

### Sauvegardes

```bash
# Backup BD
docker exec saint-pierre-db pg_dump -U app_user -d saint_pierre > backup_$(date +%Y%m%d).sql

# Restaurer
docker exec -i saint-pierre-db psql -U app_user -d saint_pierre < backup.sql
```

---

## 🔐 Sécurité - Points critiques

### 1. Authentification JWT

```typescript
// backend/middleware/auth.ts
// Vérifier la validité du token
// Refresh auto avant expiration
// Stocké en cookie HttpOnly
```

### 2. Autorisation par rôle

```typescript
// backend/middleware/role.ts
// Vérifier que l'utilisateur a le bon rôle
// Admin > Professeur > Élève
```

### 3. Hachage des mots de passe

```typescript
// backend/routes/auth.ts
const hashed = await bcrypt.hash(password, 10)
// Jamais stocker en clair
```

### 4. Protection CSRF

```typescript
// backend/middleware/csrf-protection.ts
// Tokens CSRF générés pour chaque session
```

### 5. Rate limiting

```typescript
// backend/middleware/rate-limit.ts
// Limiter les tentatives de connexion
// 5 essais / 15 minutes
```

### 6. Headers de sécurité

```typescript
// backend/middleware/security-headers.ts
// Helmet + custom headers
// Content-Security-Policy, X-Frame-Options, etc.
```

### À faire absolument

- [ ] Changer les JWT_SECRET en production
- [ ] Changer les identifiants BD
- [ ] Activer HTTPS
- [ ] Restreindre CORS
- [ ] Configurer des sauvegardes
- [ ] Monitorer les logs pour les attaques

---

## 🐛 Debugging

### Logs

```bash
# Voir tous les logs
docker compose -f docker-compose-prod.yml logs

# Seulement API
docker compose -f docker-compose-prod.yml logs api

# Temps réel
docker compose -f docker-compose-prod.yml logs -f
```

### Prisma Studio (UI pour BD)

```bash
npm run prisma:studio
# http://localhost:5555
```

### Tests

```bash
# Tests unitaires
npm run test

# Avec interface
npm run test:ui

# Coverage
npm run test:coverage
```

### VSCode Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Express Server",
      "program": "${workspaceFolder}/backend/server.ts",
      "restart": true,
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 📦 Dépendances clés

| Paquet             | Utilité               | Version |
| ------------------ | --------------------- | ------- |
| **express**        | Framework serveur     | 4.22    |
| **@prisma/client** | ORM database          | 7.8     |
| **bcrypt**         | Hachage mots de passe | 6.0     |
| **jsonwebtoken**   | JWT auth              | 9.0     |
| **vue**            | Frontend framework    | 3.5     |
| **vue-router**     | Routing frontend      | 5.0     |
| **pinia**          | State management      | 3.0     |
| **vite**           | Bundler               | 6.0     |
| **typescript**     | Type checking         | 5.x     |

### Mettre à jour

```bash
# Voir ce qui est outdated
npm outdated

# Mettre à jour tout
npm update

# Vers latest (majeur)
npm install -g npm-check-updates
ncu -u
npm install
```

---

## 🔄 Migrations Prisma

### Créer une migration

```bash
# Après modification de schema.prisma
npx prisma migrate dev --name nom_migration

# En production
npx prisma migrate deploy
```

### Exemple : Ajouter un champ

```prisma
// schema.prisma
model utilisateur {
  ...
  telephone String? // Nouveau champ
}
```

```bash
npx prisma migrate dev --name add_telephone_to_user
```

### Rollback

```bash
# Dernière migration
npx prisma migrate resolve --rolled-back <migration-name>

# ⚠️ Attention : peut perdre données
```

---

## 📋 Checklist mises à jour système

Chaque mois / trimestre :

- [ ] Mettre à jour les dépendances npm (`npm outdated`)
- [ ] Vérifier les CVE (`npm audit`)
- [ ] Tester les changements localement
- [ ] Exécuter tests complets (`npm test`)
- [ ] Backup avant déploiement
- [ ] Déployer en production
- [ ] Vérifier les logs pour erreurs
- [ ] Valider fonctionnalités principales

---

## 🚨 Urgences

### L'app crash

```bash
docker compose -f docker-compose-prod.yml logs api | tail -50
docker compose -f docker-compose-prod.yml restart api
```

### Base de données corrompue

```bash
# Backup d'abord
docker exec saint-pierre-db pg_dump -U app_user -d saint_pierre > backup_emergency.sql

# Réinitialiser
npx prisma migrate resolve --rolled-back <last-migration>
npx prisma db push --force-reset
npm run prisma:seed
```

### Oubli mot de passe admin

```bash
# Accès direct à la BD
docker exec -it saint-pierre-db psql -U app_user -d saint_pierre

-- Réinitialiser le mot de passe
UPDATE utilisateur SET hashed_password = '$2b$10$...' WHERE login = 'admin';
```

(Générer un hash avec : `npx bcrypt-cli hash "newpassword"`)

---

## 📚 Ressources

- **Express.js** : https://expressjs.com
- **Prisma** : https://www.prisma.io/docs
- **Vue.js** : https://vuejs.org
- **TypeScript** : https://www.typescriptlang.org
- **Docker** : https://docs.docker.com
- **PostgreSQL** : https://www.postgresql.org/docs

---

## 👥 Points de contact clé

### Code

- **Frontend** : `/src` - Vue.js, composants, pages
- **Backend** : `/backend` - Express, routes, logique
- **Database** : `/prisma` - Schéma, migrations

### Configuration

- **Environnement** : `.env` - variables sensibles
- **Docker** : `docker-compose*.yml` - services
- **Build** : `vite.config.ts`, `tsconfig.json`

### Documentation

- **API** : `/swagger` endpoint
- **Code** : Types TypeScript, interfaces
- **Logs** : Docker logs, Prisma logs

---

**Dernière mise à jour : Décembre 2026**

Pour toute question : consulter les logs, Prisma Studio, ou la doc API.
