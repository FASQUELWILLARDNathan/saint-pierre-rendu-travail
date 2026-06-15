# ❓ FAQ & Dépannage rapide

Solutions aux problèmes les plus courants.

---

## 🔴 L'application ne démarre pas

### Symptôme

```
docker compose -f docker-compose-prod.yml up
ERROR: Web server failed to start
```

### Solutions

**1. Port déjà utilisé**

```bash
# Vérifier quel process utilise le port
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :5000
lsof -i :3000

# Tuer le process
taskkill /PID <PID> /F
```

**2. Docker daemon non lancé**

```bash
# Windows : Relancer Docker Desktop
# Linux/Mac :
sudo systemctl restart docker
```

**3. Conteneurs bloqués**

```bash
# Supprimer les vieux conteneurs
docker compose down -v
docker compose -f docker-compose-prod.yml up -d --build
```

**4. Erreur de mémoire**

```bash
# Augmenter la RAM disponible pour Docker
docker stats  # Pour vérifier l'utilisation
```

---

## 🔴 Connexion impossible

### Symptôme

> "Identifiants invalides" ou "Erreur 401 Unauthorized"

### Vérifier

```
✓ Login/Email exact ? (case-sensitive)
✓ Mot de passe correct ?
✓ Utilisateur existe dans Utilisateurs ?
✓ L'utilisateur a un rôle valide ?
✓ Compte pas désactivé ?
```

### Solutions

**1. Mot de passe oublié**

- Cliquer **"Mot de passe oublié"** sur page connexion
- Email reçu avec lien
- Créer nouveau mot de passe

**2. Réinitialiser comme admin**

1. Connexion avec autre compte admin
2. Menu **Utilisateurs** → chercher utilisateur
3. **Réinitialiser le mot de passe**
4. Email envoyé à l'utilisateur

---

## 🔴 Import Excel échoue

### Symptôme

```
✗ Erreur lors de l'import : "Colonne 'Classe' invalide"
✗ 0 utilisateurs importés
✗ Fichier rejeté
```

### Vérifier

**Checklist avant import :**

```
✓ Fichier au format .xlsx (pas .xls, pas .csv)
✓ Colonnes obligatoires présentes : Nom, Prénom, Login, Email, Classe
✓ Pas de doublon Login ou Email dans le fichier
✓ Les Classes existent dans l'app
  (Exemple : si vous mettez "Terminale A", elle doit exister)
✓ Les Logins uniques (pas répétés dans l'app existante)
```

### Solutions

**1. Vérifier que les classes existent**

```
Menu Paramètres → Classes
Vérifier que "Terminale A", "1ère B", etc. existent
```

**2. Corriger le fichier Excel**

```
❌ "Term A"           →  ✅ "Terminale A"
❌ "1ère"             →  ✅ "1ère A"
❌ duplicate@ex.com   →  ✅ unique@ex.com
❌ "Martin,Dupont"    →  ✅ "Martin, Dupont" (pas de virgule dans colonne Nom)
```

**3. Télécharger les erreurs**

- Après import échoué, cliquer "Télécharger les erreurs"
- Fichier contient le détail de chaque problème

**4. Réessayer**

- Corriger le fichier
- Recommencer l'import
- Les utilisateurs en erreur ne seront pas réimportés

---

## 🔴 Les élèves ne voient pas leurs cours

### Symptôme

> Les élèves se connectent mais ne voient aucun cours

### Vérifier

```
✓ L'élève est dans la bonne classe ?
✓ Le professeur a créé le cours pour cette classe ?
✓ Le cours n'est pas défini comme "brouillon" ?
✓ La date du cours n'est pas dans le passé ?
```

### Solutions

**1. Vérifier la classe de l'élève**

1. Menu **Utilisateurs** → Cliquer l'élève
2. Vérifier le champ **Classe** (ex: "Terminale A")
3. Si vide ou incorrect, modifier et enregistrer

**2. Vérifier le cours du professeur**

1. Menu **Cours** → chercher le cours
2. Vérifier **Classe** = classe de l'élève
3. Vérifier **Status** = "Publié" (pas "Brouillon")
4. Vérifier **Date** = aujourd'hui ou futur

**3. Rafraîchir l'app**

- Élève appuie **F5** ou **Ctrl+R** pour recharger
- Déconnexion/reconnexion

**4. Vérifier les spécialités/options**
Si le cours est pour une spécialité :

1. Menu Utilisateurs → Élève
2. Vérifier qu'il a la bonne **Spécialité** cochée

---

## 🔴 Les fichiers ne s'upload pas

### Symptôme

```
✗ "Erreur lors du téléchargement"
✗ Fichier trop volumineux
✗ Format non accepté
```

### Solutions

**1. Taille limite**

```
Limite par défaut : 5 MB
Si fichier > 5 MB → compression recommandée
```

**2. Format accepté**

```
✓ Images : .jpg, .png, .gif
✓ Documents : .pdf, .docx, .xlsx, .pptx, .txt
✓ Vidéo : .mp4, .webm
✓ Archive : .zip, .rar, .7z
✗ .exe, .bat, .sh → BLOQUÉS (sécurité)
```

**3. Tester le upload**

```bash
# Vérifier l'espace disque
df -h /

# Vérifier les permissions
ls -la /public/uploads/
```

---

## 🔴 "Erreur 500 serveur"

### Symptôme

```
✗ Erreur 500 Internal Server Error
✗ Quelque chose s'est mal passé
```

### Solutions

**1. Vérifier les logs**

```bash
docker compose -f docker-compose-prod.yml logs api | tail -50
```

**2. Redémarrer l'API**

```bash
docker compose -f docker-compose-prod.yml restart api
```

**3. Vérifier la base de données**

```bash
docker compose -f docker-compose-prod.yml logs db
docker compose -f docker-compose-prod.yml exec db pg_isready
```

**4. Entièrement redémarrer**

```bash
docker compose -f docker-compose-prod.yml down
docker compose -f docker-compose-prod.yml up -d --build
```

---

## 🔴 "Base de données corrompue"

### Symptôme

```
✗ Erreur Prisma : "FOREIGN KEY constraint failed"
✗ Données perdues/incohérentes
```

### Solutions

⚠️ **ATTENTION : Les solutions suivantes suppriment des données**

**1. Vérifier d'abord l'intégrité**

```bash
npm run prisma:studio
# Essayer de naviguer dans les données
```

**2. Réinitialiser la base**

```bash
# Backup AVANT
docker exec saint-pierre-db pg_dump -U app_user -d saint_pierre > backup_emergency.sql

# Reset (⚠️ perte des données)
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma db push --force-reset
npm run prisma:seed

# Vérifier
npm run prisma:studio
```

**3. Restaurer depuis backup**

```bash
docker exec -i saint-pierre-db psql -U app_user -d saint_pierre < backup.sql
```

---

## 🔴 Performance lente

### Symptôme

> L'application est très lente, les pages mettent du temps à charger

### Solutions

**1. Vérifier les ressources**

```bash
# CPU/RAM
docker stats

# Disk space
df -h
du -sh /var/lib/docker/

# Si disque plein > nettoyer les anciens conteneurs
docker system prune
```

**2. Optimiser la base de données**

```bash
# Vérifier l'indexation
npm run prisma:studio
# Aller dans DB → tables → vérifier les index
```

**3. Réduire les données anciennes**

```sql
-- Supprimer les devoirs/rendus de + de 2 ans
DELETE FROM rendu WHERE created_at < NOW() - INTERVAL '2 years';
DELETE FROM devoir WHERE created_at < NOW() - INTERVAL '2 years';
```

**4. Vérifier les logs pour les erreurs**

```bash
docker compose -f docker-compose-prod.yml logs | grep ERROR
```

---

## 🔴 "Erreur CORS"

### Symptôme

```
✗ Erreur : "Cross-Origin Request Blocked"
✗ Frontend ne peut pas appeler l'API
```

### Solutions

**1. Vérifier la configuration CORS**

```typescript
// backend/middleware/cors.ts
// Vérifier que le origin est autorisé
// Exemple : http://localhost:3000 (dev) ou https://monsite.com (prod)
```

**2. En développement**

- Frontend tourne sur `http://localhost:5173`
- API tourne sur `http://localhost:5000`
- CORS doit autoriser cette combinaison

**3. En production**

- Frontend : `https://monsite.com`
- API : `https://api.monsite.com` (ou même domaine)
- Vérifier les DNS

---

## 🟢 Vérifier que tout fonctionne

### Checklist rapide

```bash
# 1. App démarre
docker compose -f docker-compose-prod.yml ps
# Tous les statuts = "Up" ✓

# 2. API répond
curl http://localhost:5000/swagger
# Page Swagger reçue ✓

# 3. Frontend accessible
curl http://localhost:3000
# Page HTML reçue ✓

# 4. Base de données OK
npm run prisma:studio
# Prisma Studio ouvre ✓

# 5. Connexion possible
# Aller à http://localhost:3000
# Se connecter avec admin/AdminPassword123! ✓

# 6. Import possible
# Menu Paramètres → Importer élèves → upload test.xlsx ✓
```

---

## 📞 Quand appeler un spécialiste ?

Contacter le développeur original si :

```
⚠️ Erreurs de code dans les logs (StackTrace)
⚠️ Impossible de fix la base de données
⚠️ Données corrompues/perdues
⚠️ Besoin d'ajouter une nouvelle fonctionnalité
⚠️ Performance dégradée sans raison
⚠️ Faille de sécurité découverte
```

---

## 📋 Template email d'urgence

```
Bonjour,

La plateforme Saint-Pierre a un problème :

[Décrire le problème]

Erreur : [Copier-coller du message d'erreur]

Logs (dernières 20 lignes) :
[Copier : docker compose -f docker-compose-prod.yml logs api | tail -20]

Timestamp : [Date/heure]

Merci de corriger rapidement !
```

---

## 🆘 SOS Express (< 15 min pour fix)

Si l'app est complètement down :

```bash
#!/bin/bash

# 1. Stop tout
docker compose -f docker-compose-prod.yml down

# 2. Clean
docker system prune -f

# 3. Redémarrer
docker compose -f docker-compose-prod.yml up -d --build

# 4. Vérifier
docker compose -f docker-compose-prod.yml ps

# 5. Check app
curl http://localhost:3000 && echo "✓ OK"
curl http://localhost:3000/api/docs && echo "✓ OK"
```

Si toujours KO :

```bash
# Logs complets
docker compose -f docker-compose-prod.yml logs > logs_emergency.txt

# Contacter le dev avec ce fichier
```

---

**Version 1.0 - Juin 2026**

**Dernière mise à jour : Vérifiez régulièrement qu'aucune erreur ne s'accumule dans les logs !**
