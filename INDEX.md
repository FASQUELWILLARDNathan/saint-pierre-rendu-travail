# 📚 Documentation Complète - Plateforme Saint-Pierre

**Bienvenue !** Cette plateforme est maintenant à vos mains. Voici toute la documentation pour la maintenir et l'utiliser.

---

## 🎯 Choisissez votre guide selon votre rôle

### 👨‍💼 Vous êtes **administrateur** (utilisateur de l'app)

➡️ Lire : **[GUIDE_RAPIDE.md](GUIDE_RAPIDE.md)**

**Contenu :**

- Démarrer l'application en 5 minutes
- Ajouter des élèves par Excel
- Ajouter des professeurs par Excel
- Gérer les classes et matières
- Tasks principales avec étapes

**Durée de lecture :** ~15 minutes

---

### 🔧 Vous êtes **informaticien/développeur** (maintenance technique)

➡️ Lire : **[GUIDE_MAINTENANCE.md](GUIDE_MAINTENANCE.md)** + **[GUIDE_TECHNIQUE.md](GUIDE_TECHNIQUE.md)**

**GUIDE_MAINTENANCE.md contient :**

- Installation complète
- Architecture générale
- Comment ajouter élèves/profs (détaillé)
- Gestion base de données
- Maintenance & dépannage
- Sécurité & variables d'environnement

**GUIDE_TECHNIQUE.md contient :**

- Structure du projet (fichiers/dossiers)
- Schéma base de données
- Endpoints API clés
- Développement local
- Déploiement production
- Sécurité (détail technique)
- Debugging

**Durée de lecture :** ~1-2 heures

---

### 🆘 Vous avez un **problème** (ça ne fonctionne pas)

➡️ Lire : **[FAQ_DEPANNAGE.md](FAQ_DEPANNAGE.md)**

**Contient :**

- Solutions aux problèmes courants
- Checklist de vérification
- Commandes de dépannage
- Quand appeler un spécialiste
- SOS Express (< 15 min)

**Durée de lecture :** Chercher votre problème (~5 min)

---

## 📂 Structure des documents

```
DOCUMENTATION/
├── 📄 INDEX.md                 ← Vous êtes ici
├── 📄 GUIDE_RAPIDE.md          → Pour administrateurs
├── 📄 GUIDE_MAINTENANCE.md     → Pour informaticiens (complet)
├── 📄 GUIDE_TECHNIQUE.md       → Pour développeurs (code)
└── 📄 FAQ_DEPANNAGE.md         → Pour les problèmes
```

---

## 🚀 Start rapide (5 min)

### Démarrer l'application

```bash
docker compose -f docker-compose-prod.yml up -d --build
```

Puis accédez à : **http://localhost:3000**

### Se connecter

- **Login :** `admin`
- **Mot de passe :** `AdminPassword123!` (À CHANGER)

### Première action

1. Créer les **classes** (Terminale A, 1ère B, etc.)
2. Créer les **matières** (Mathématiques, Français, etc.)
3. **Importer les élèves** par Excel
4. **Importer les professeurs** par Excel

✅ Prêt !

---

## 📋 Tableau des contenus

### Pour administrateurs

| Besoin          | Document      | Section                       |
| --------------- | ------------- | ----------------------------- |
| Démarrer rapido | GUIDE_RAPIDE  | ⚡ Démarrage rapide           |
| Ajouter élèves  | GUIDE_RAPIDE  | TASK 3                        |
| Ajouter profs   | GUIDE_RAPIDE  | TASK 4                        |
| Interface       | GUIDE_RAPIDE  | Vue d'ensemble de l'interface |
| Workflow année  | GUIDE_RAPIDE  | Workflow type                 |
| Problème ?      | FAQ_DEPANNAGE | Chercher votre symptôme       |

### Pour informaticiens

| Besoin                  | Document          | Section                         |
| ----------------------- | ----------------- | ------------------------------- |
| Installer               | GUIDE_MAINTENANCE | Installation & démarrage        |
| Ajouter élèves (détail) | GUIDE_MAINTENANCE | Comment ajouter des élèves      |
| Ajouter profs (détail)  | GUIDE_MAINTENANCE | Comment ajouter des professeurs |
| BD                      | GUIDE_MAINTENANCE | Gestion de la base de données   |
| Problème ?              | FAQ_DEPANNAGE     | Tous les problèmes              |
| Sécurité                | GUIDE_MAINTENANCE | Points clés de sécurité         |

### Pour développeurs

| Besoin       | Document        | Section                     |
| ------------ | --------------- | --------------------------- |
| Structure    | GUIDE_TECHNIQUE | Structure du projet         |
| DB schema    | GUIDE_TECHNIQUE | Schéma base de données      |
| API          | GUIDE_TECHNIQUE | API Endpoints clés          |
| Dev local    | GUIDE_TECHNIQUE | Développement local         |
| Deploy       | GUIDE_TECHNIQUE | Déploiement                 |
| Debug        | GUIDE_TECHNIQUE | Debugging                   |
| CVE/Sécurité | GUIDE_TECHNIQUE | Sécurité - Points critiques |

---

## 🎓 Scénarios courants

### Scénario 1 : Nouvelle année scolaire

**Étapes :**

1. Lire : GUIDE_RAPIDE → Workflow type
2. Créer les classes
3. Créer/vérifier les matières
4. Importer les élèves (fichier Excel)
5. Importer les profs (fichier Excel)
6. ✅ Prêt pour le démarrage

**Document :** GUIDE_RAPIDE.md (30 min)

---

### Scénario 2 : "L'app ne démarre pas"

**Étapes :**

1. Lire : FAQ_DEPANNAGE → "L'application ne démarre pas"
2. Vérifier le problème
3. Appliquer la solution
4. Tester

**Document :** FAQ_DEPANNAGE.md (10 min)

---

### Scénario 3 : "Je dois modifier le code"

**Étapes :**

1. Lire : GUIDE_TECHNIQUE → Structure du projet
2. Lire : GUIDE_TECHNIQUE → Développement local
3. Faire vos modifications
4. Lire : GUIDE_TECHNIQUE → Tests et Déploiement
5. Déployer

**Document :** GUIDE_TECHNIQUE.md (2 heures)

---

### Scénario 4 : "Je dois ajouter une nouvelle classe/matière"

**Étapes :**

1. Lire : GUIDE_RAPIDE → TASK 1 ou TASK 2
2. Ajouter via l'interface
3. ✅ C'est fait

**Document :** GUIDE_RAPIDE.md (5 min)

---

### Scénario 5 : "Les élèves ne voient pas les cours"

**Étapes :**

1. Lire : FAQ_DEPANNAGE → "Les élèves ne voient pas leurs cours"
2. Vérifier les points
3. Corriger le problème

**Document :** FAQ_DEPANNAGE.md (5-10 min)

---

## 💡 Tips & bonnes pratiques

### Avant de déployer

```
✓ Tester en développement
✓ Sauvegarder la base de données
✓ Vérifier les logs
✓ Documenter les changements
```

### Maintenance mensuelle

```
✓ Vérifier l'app répond
✓ Vérifier les logs (pas d'erreurs)
✓ Mettre à jour les dépendances npm
✓ Sauvegarder les données
```

### Sécurité (CRITIQUE)

```
✓ Changer le mot de passe admin par défaut
✓ Utiliser HTTPS en production
✓ Sauvegarder régulièrement
✓ Monitorer les accès
✓ Maintenir les dépendances à jour
```

---

## 🔗 Liens rapides

**Démarrer rapidement :**

- [GUIDE_RAPIDE.md](GUIDE_RAPIDE.md) - Pour administrateurs

**Pour maintenance :**

- [GUIDE_MAINTENANCE.md](GUIDE_MAINTENANCE.md) - Installation, utilisation, sécurité
- [GUIDE_TECHNIQUE.md](GUIDE_TECHNIQUE.md) - Architecture, code, développement
- [FAQ_DEPANNAGE.md](FAQ_DEPANNAGE.md) - Problèmes et solutions

**Accès à l'app :**

- Interface web : `http://localhost:3000`
- API docs : `http://localhost:5000/swagger`
- DB management : `http://localhost:5555` (Prisma Studio)

---

## 📞 Contact & support

### En cas de problème

1. **Chercher dans [FAQ_DEPANNAGE.md](FAQ_DEPANNAGE.md)**
   - 80% des problèmes y sont résolus

2. **Consulter les logs**

   ```bash
   docker compose -f docker-compose-prod.yml logs -f
   ```

3. **Prisma Studio** (pour vérifier la BD)

   ```bash
   npm run prisma:studio
   ```

4. **En dernier recours**
   - Contactez le développeur original
   - Fournissez les logs complets
   - Décrivez exactement le problème

---

## ✅ Checklist première utilisation

- [ ] Lire ce fichier INDEX
- [ ] Choisir le bon guide selon votre rôle
- [ ] Démarrer l'application
- [ ] Se connecter
- [ ] Changer le mot de passe admin
- [ ] Créer les classes
- [ ] Créer les matières
- [ ] Importer les données
- [ ] Tester une action
- [ ] Sauvegarder la base de données

---

## 📊 Vue d'ensemble

```
┌─────────────────────────────────────────┐
│    Plateforme Saint-Pierre              │
│    (Application web pour l'école)       │
└─────────────────────────────────────────┘
        ↓
        │
    ┌───┴────────────────────────┐
    │                              │
    ↓                              ↓
┌─────────────────┐        ┌──────────────────┐
│  ADMINISTRATEUR │        │  INFORMATICIEN   │
│  (Utilise app)  │        │  (Maintient app) │
└─────────────────┘        └──────────────────┘
    ↓                              ↓
 GUIDE_RAPIDE                GUIDE_MAINTENANCE
 (30 min)                    GUIDE_TECHNIQUE
                            (2-3 heures)
    │                              │
    └──────────┬────────────────┬──┘
               │                │
               ↓                ↓
        Problème ?
         ↓
    FAQ_DEPANNAGE
    (5-10 min)
```

---

## 🎓 Ressources externes

- **Docker** : https://docs.docker.com/
- **PostgreSQL** : https://www.postgresql.org/docs/
- **Prisma** : https://www.prisma.io/docs/
- **Express.js** : https://expressjs.com/
- **Vue.js** : https://vuejs.org/

---

## 📝 Historique & version

- **Version** : 1.0
- **Date** : Décembre 2026
- **Créée pour** : Maintenance à long terme
- **Couvre** : Installation, utilisation, développement, dépannage

---

## 🎯 Votre prochaine action

```
Vous êtes :                  Lisez :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin (utilisateur)         → GUIDE_RAPIDE.md
Informaticien (maintenance) → GUIDE_MAINTENANCE.md
Développeur (code)          → GUIDE_TECHNIQUE.md
Quelque chose ne marche     → FAQ_DEPANNAGE.md
```

---

**Bonne chance ! 🚀**

N'hésitez pas à revenir à ce guide si vous avez des questions.
