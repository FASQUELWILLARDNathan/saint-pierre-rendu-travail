# 📚 Guide de Maintenance - Plateforme Saint-Pierre

Ce document explique comment maintenir et utiliser la plateforme Saint-Pierre pour gérer les élèves, les professeurs et les ressources pédagogiques.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation & démarrage](#installation--démarrage)
3. [Comment ajouter des élèves](#comment-ajouter-des-élèves)
4. [Comment ajouter des professeurs](#comment-ajouter-des-professeurs)
5. [Gestion des classes et matières](#gestion-des-classes-et-matières)
6. [Accès administrateur](#accès-administrateur)
7. [Gestion de la base de données](#gestion-de-la-base-de-données)
8. [Maintenance & dépannage](#maintenance--dépannage)
9. [Points clés de sécurité](#points-clés-de-sécurité)

---

## 🎯 Vue d'ensemble

La plateforme Saint-Pierre est une application web pour :

- **Élèves** : consulter les cours, devoirs, rendre les travaux, voir l'agenda
- **Professeurs** : créer des cours, assigner des devoirs, noter les rendus
- **Administrateurs** : gérer les utilisateurs, les classes, les matières

### Technologies utilisées

- **Frontend** : Vue.js 3 (interface web moderne)
- **Backend** : Express.js (serveur Node.js)
- **Base de données** : PostgreSQL (stockage des données)
- **Déploiement** : Docker & Docker Compose (conteneurisation)

### Rôles utilisateurs

| Rôle               | Permissions                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Administrateur** | Accès total : gérer les utilisateurs, les classes, les matières, importer les données |
| **Professeur**     | Créer des cours, assigner des devoirs, corriger, noter les rendus                     |
| **Élève**          | Consulter les cours, voir les devoirs, rendre les travaux                             |

---

## ⚙️ Installation & démarrage

### Prérequis

- **Docker** et **Docker Compose** installés sur le serveur
- **Node.js** (version 18+) pour développement local
- **PostgreSQL** (optionnel si Docker est utilisé)

### 1️⃣ Première installation

```bash
# Cloner le projet
git clone <url-repo>
cd saint-pierre-rendu-travail

# Installer les dépendances
npm install

# Configurer la base de données Prisma
npx prisma generate

# Initialiser les migrations et seed
npm run prisma:setup
```

### 2️⃣ Démarrer l'application

#### 🔧 Mode développement

```bash
npm run dev:api          # Lance le serveur Express (port 5000)
npm run dev             # Lance l'interface Vue (port 5173)
```

#### 🚀 Mode production avec Docker

```bash
# Démarrer tous les services
docker compose -f docker-compose-prod.yml up -d --build

# Vérifier le statut
docker compose -f docker-compose-prod.yml ps
```

#### ⚡ Mode développement avec Docker

```bash
docker compose up -d --build
```

### 3️⃣ Accéder à l'application

| Service                             | URL                             |
| ----------------------------------- | ------------------------------- |
| **Interface web**                   | `http://localhost:3000`         |
| **API**                             | `http://localhost:5000/api`     |
| **Swagger (documentation API)**     | `http://localhost:5000/swagger` |
| **Prisma Studio (base de données)** | `http://localhost:5555`         |

---

## 👥 Comment ajouter des élèves

### Méthode 1 : Import par fichier Excel (RECOMMANDÉ)

C'est la méthode la plus rapide pour importer plusieurs élèves à la fois.

#### Étape 1 : Préparer le fichier Excel

Créer un fichier `.xlsx` (Excel) avec les colonnes suivantes :

| Nom    | Prénom | Login   | Email                  | Classe      | Année     | Spécialités            | Options |
| ------ | ------ | ------- | ---------------------- | ----------- | --------- | ---------------------- | ------- |
| Dupont | Jean   | jdupont | jean.dupont@ecole.fr   | Terminale A | 2025-2026 | Mathématiques,Physique | Sport   |
| Martin | Sophie | smartin | sophie.martin@ecole.fr | 1ère B      | 2025-2026 | SVT                    | Latin   |

**Colonnes obligatoires :**

- `Nom`, `Prénom`, `Login`, `Email`, `Classe`

**Colonnes optionnelles :**

- `Année` : année scolaire (ex: 2025-2026)
- `Spécialités` : séparées par des virgules (Mathématiques, Physique, SVT, etc.)
- `Options` : séparées par des virgules (Sport, Latin, etc.)

#### Étape 2 : Importer le fichier

1. Se connecter avec un compte **administrateur**
2. Aller dans **Paramètres** → **Gestion des élèves** → **Importer des élèves**
3. Sélectionner le fichier Excel
4. Vérifier l'aperçu et les erreurs
5. Cliquer sur **Importer**

#### Étape 3 : Résultats

- ✅ Les élèves sont créés automatiquement
- ✅ Un mot de passe temporaire est généré (affiché ou envoyé par email)
- ✅ Les élèves sont associés à leurs classes
- ⚠️ En cas d'erreur, le fichier d'erreurs est téléchargeable

### Méthode 2 : Créer manuellement un élève

1. Se connecter comme **administrateur**
2. Aller dans **Utilisateurs** → **Ajouter un élève**
3. Remplir le formulaire :
   - Nom et Prénom
   - Login (unique)
   - Email (unique)
   - Mot de passe
   - Classe
   - Année scolaire
4. Ajouter des spécialités/options si nécessaire
5. Valider

### Notes importantes pour les élèves

⚠️ **Chaque élève doit avoir :**

- Un login **unique**
- Une adresse email **unique**
- Être associé à une **classe**
- Avoir au minimum une **année scolaire** renseignée

💡 **Bonnes pratiques :**

- Utiliser un login simple : `nom.prenom` ou `initialnom`
- Attribuer les spécialités/options correctement (important pour les cours/devoirs)
- Vérifier l'orthographe du nom de la classe avant l'import

---

## 👨‍🏫 Comment ajouter des professeurs

### Méthode 1 : Import par fichier Excel (RECOMMANDÉ)

#### Étape 1 : Préparer le fichier Excel

Créer un fichier `.xlsx` avec les colonnes suivantes :

| Nom     | Prénom | Login    | Email                   | Matière       | Classes                 |
| ------- | ------ | -------- | ----------------------- | ------------- | ----------------------- |
| Bernard | Marie  | mbernard | marie.bernard@ecole.fr  | Mathématiques | Terminale A,Terminale B |
| Lefevre | Pierre | plefevre | pierre.lefevre@ecole.fr | Français      | 1ère A                  |

**Colonnes obligatoires :**

- `Nom`, `Prénom`, `Login`, `Email`

**Colonnes optionnelles :**

- `Matière` : la discipline enseignée (ex: Mathématiques, Français, Physique...)
- `Classes` : classes enseignées, séparées par des virgules

#### Étape 2 : Importer le fichier

1. Se connecter comme **administrateur**
2. Aller dans **Paramètres** → **Gestion des professeurs** → **Importer des professeurs**
3. Sélectionner le fichier Excel
4. Vérifier l'aperçu et les erreurs
5. Cliquer sur **Importer**

### Méthode 2 : Créer manuellement un professeur

1. Se connecter comme **administrateur**
2. Aller dans **Utilisateurs** → **Ajouter un professeur**
3. Remplir le formulaire :
   - Nom et Prénom
   - Login (unique)
   - Email (unique)
   - Mot de passe
   - Matière (optionnel)
4. Ajouter les classes à enseigner
5. Valider

### Notes importantes pour les professeurs

⚠️ **Chaque professeur doit avoir :**

- Un login **unique**
- Une adresse email **unique**
- Au minimum une **classe** associée

💡 **Bonnes pratiques :**

- Mettre à jour la **matière** pour chaque professeur (utilisée pour filtrer les cours/devoirs)
- Vérifier les **classes enseignées** pour éviter que les devoirs ne s'affichent mal
- Les professeurs peuvent avoir plusieurs classes

---

## 🏫 Gestion des classes et matières

### Ajouter une classe

1. Se connecter comme **administrateur**
2. Aller dans **Paramètres** → **Classes** → **Ajouter une classe**
3. Remplir :
   - **Niveau** : Terminale, 1ère, 2nde, etc.
   - **Lettre** : A, B, C, etc.
   - **Nom complet** : auto-généré (ex: "Terminale A")
4. Valider

### Ajouter une matière

1. Se connecter comme **administrateur**
2. Aller dans **Paramètres** → **Matières** → **Ajouter une matière**
3. Remplir :
   - **Nom** : Mathématiques, Français, Physique, etc.
   - **Description** : (optionnel)
   - **Couleur** : (optionnel, pour l'interface)
   - **Icône** : (optionnel)
4. Valider

### Ajouter une spécialité

1. Se connecter comme **administrateur**
2. Aller dans **Paramètres** → **Spécialités** → **Ajouter une spécialité**
3. Remplir :
   - **Nom** : NSI, SVT, Maths, etc.
4. Valider

### Ajouter une option

1. Se connecter comme **administrateur**
2. Aller dans **Paramètres** → **Options** → **Ajouter une option**
3. Remplir :
   - **Nom** : Sport, Latin, Musique, etc.
4. Valider

---

## 🔐 Accès administrateur

### Premier administrateur

Lors de l'initialisation, le premier administrateur est créé avec le seed :

```bash
npm run prisma:seed
```

**Identifiants par défaut :**

- **Login** : `admin`
- **Email** : `admin@ecole.fr`
- **Mot de passe** : `AdminPassword123!` (À CHANGER IMMÉDIATEMENT)

### Ajouter un nouvel administrateur

1. Se connecter comme administrateur existant
2. Aller dans **Utilisateurs** → **Ajouter un administrateur**
3. Remplir le formulaire
4. Valider

⚠️ **IMPORTANT** : Garder le nombre d'administrateurs limité pour la sécurité

---

## 🗄️ Gestion de la base de données

### Visualiser les données avec Prisma Studio

```bash
npm run prisma:studio
```

Accès via `http://localhost:5555`

**Permet de :**

- Consulter/modifier les données directement
- Tester les relations
- Déboguer les problèmes

### Sauvegarder la base de données

#### Mode Docker

```bash
# Créer une sauvegarde
docker exec saint-pierre-db pg_dump -U app_user -d saint_pierre > backup.sql

# Restaurer une sauvegarde
docker exec -i saint-pierre-db psql -U app_user -d saint_pierre < backup.sql
```

#### Mode local PostgreSQL

```bash
# Sauvegarde
pg_dump -U username -d saint_pierre > backup.sql

# Restaure
psql -U username -d saint_pierre < backup.sql
```

### Exécuter une migration Prisma

Après modification du `schema.prisma` :

```bash
# Créer une migration
npx prisma migrate dev --name description_migration

# Appliquer les migrations en production
npm run prisma:migrate
```

---

## 🔧 Maintenance & dépannage

### Vérifier l'état des services Docker

```bash
# Liste des conteneurs
docker compose -f docker-compose-prod.yml ps

# Voir les logs d'un service
docker compose -f docker-compose-prod.yml logs -f api
docker compose -f docker-compose-prod.yml logs -f frontend
docker compose -f docker-compose-prod.yml logs -f db

# Redémarrer les services
docker compose -f docker-compose-prod.yml restart
```

### Problème : L'application ne démarre pas

```bash
# 1. Vérifier la base de données
docker compose -f docker-compose-prod.yml logs db

# 2. Vérifier l'API
docker compose -f docker-compose-prod.yml logs api

# 3. Redémarrer tous les services
docker compose -f docker-compose-prod.yml down
docker compose -f docker-compose-prod.yml up -d --build
```

### Problème : Les données d'import ne s'affichent pas

```bash
# Vérifier la migration de la base de données
npm run prisma:migrate

# Réinitialiser la base de données (⚠️ SUPPRIME TOUTES LES DONNÉES)
npx prisma db push --force-reset
npm run prisma:seed
```

### Problème : Connexion impossible

- Vérifier les **identifiants** (login/mot de passe)
- Vérifier que l'utilisateur existe dans **Utilisateurs**
- Vérifier que l'utilisateur a un rôle valide (administrateur, professeur, élève)
- Essayer de **réinitialiser le mot de passe** via le bouton "Mot de passe oublié"

### Problème : "Port déjà utilisé"

```bash
# Arrêter les conteneurs Docker existants
docker compose down

# OU : Trouver et tuer le processus
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Exécuter les tests

```bash
# Tests unitaires
npm run test

# Tests avec interface
npm run test:ui

# Coverage (couverture de code)
npm run test:coverage
```

---

## 🔒 Points clés de sécurité

### Mots de passe

⚠️ **À faire absolument :**

1. Changer le mot de passe de l'admin par défaut immédiatement
2. Utiliser des mots de passe forts (minimum 12 caractères)
3. Ne jamais partager les identifiants
4. Implémenter une **politique de réinitialisation périodique des mots de passe**

### Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL=postgresql://app_user:app_password@localhost:5432/saint_pierre

# JWT
JWT_SECRET=votre-clé-secrète-très-sécurisée-changez-moi

# Email (optionnel)
MAILJET_API_KEY=votre-clé-api
MAILJET_SECRET_KEY=votre-clé-secrète

# Environnement
NODE_ENV=production
API_PORT=5000
```

⚠️ **NE PAS commiter le `.env` dans Git** - ajouter à `.gitignore`

### Accès à la base de données

- Toujours utiliser des **identifiants forts** pour PostgreSQL
- Limiter l'accès à la base de données **par IP**
- Ne jamais exposer le port PostgreSQL (5432) sur Internet

### Authentification

- JWT (JSON Web Token) stocké en cookie sécurisé
- Expiration des tokens après 24 heures
- Déconnexion automatique après inactivité

---

## 📞 Support & contact

### Fichiers clés à connaître

| Fichier                   | Utilité                            |
| ------------------------- | ---------------------------------- |
| `docker-compose.yml`      | Configuration Docker développement |
| `docker-compose-prod.yml` | Configuration Docker production    |
| `prisma/schema.prisma`    | Schéma base de données             |
| `backend/server.ts`       | Point d'entrée serveur             |
| `backend/routes/`         | Endpoints API                      |
| `src/pages/`              | Pages frontend Vue.js              |

### Logs importants

```bash
# API logs
docker compose logs -f api

# Database logs
docker compose logs -f db

# Frontend
npm run dev
```

### Documentation API

Accessible via `/swagger` sur le serveur (ex: `http://localhost:5000/swagger`)

---

## 📝 Checklist de démarrage

Avant de mettre en production :

- [ ] Installer Docker et Docker Compose
- [ ] Cloner le projet
- [ ] Configurer le `.env` avec les bonnes valeurs
- [ ] Exécuter `npm install`
- [ ] Exécuter `npm run prisma:setup`
- [ ] Changer le mot de passe administrateur par défaut
- [ ] Tester l'import des élèves/professeurs
- [ ] Vérifier l'accès à la base de données avec Prisma Studio
- [ ] Configurer les sauvegardes régulières
- [ ] Documenter les procédures de maintenance
- [ ] Former les administrateurs à l'utilisation

---

**Dernière mise à jour : Décembre 2026**

Pour toute question ou problème, consultez la documentation API ou les logs Docker.
