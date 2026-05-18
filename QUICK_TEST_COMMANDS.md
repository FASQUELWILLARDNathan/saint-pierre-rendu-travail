# 🚀 Commandes de test rapides

## 👀 Avant de commencer

```bash
# Installer les dépendances
npm install

# Vérifier l'installation
npm run test --version
```

## ✅ Tester avant commit

```bash
# Tous les tests + coverage
npm run test:all && npm run test:coverage

# Ou plus simple
npm run test:unit && npm run type-check
```

## 🎯 Commandes principales

```bash
# Lancer tests en mode watch (recommandé pour dev)
npm run test

# Interface graphique (très utile!)
npm run test:ui

# Exécuter tout une seule fois
npm run test:unit

# Voir la couverture
npm run test:coverage
```

## 🧪 Tests spécifiques

```bash
# Backend uniquement
npm run test:backend

# Frontend uniquement
npm run test:frontend

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Un fichier spécifique
npm run test -- jwt-manager.test.ts

# Pattern matching
npm run test -- backend/utils
npm run test -- auth.store
npm run test -- api-routes
```

## 📊 Coverage en détail

```bash
# Rapport complet
npm run test:coverage

# Rapport HTML (ouvre automatiquement)
npm run test:coverage:html

# Voir les lignes non testées
npm run test:coverage -- --reporter=text

# Coverage pour un fichier
npm run test:coverage -- src/stores/auth.store.ts
```

## 🐛 Déboguer

```bash
# Mode debug (VS Code debugger automatique)
npm run test:debug

# Ensuite: Ajouter breakpoints dans le test
# Fenêtre: chrome://inspect
# Sélectionner le process Node

# Test en single-thread (plus lent, plus stable)
npm run test -- --single-thread

# Verbose output
npm run test -- --reporter=verbose

# Très verbose
npm run test -- --reporter=verbose --reporter=verbose
```

## 📈 Cas particuliers

```bash
# Tester un seul "it"
it.only('should do something', () => {
  // ...
})

# Passer un test
it.skip('incomplete test', () => {
  // ...
})

# Tester une suite complète
describe.only('Auth Tests', () => {
  // Seuls ces tests vont tourner
})

# Ignorer une suite
describe.skip('Slow tests', () => {
  // ...
})
```

## ⚡ Performance

```bash
# Voir temps d'exécution par test
npm run test:unit -- --reporter=verbose

# Voir les 10 tests les plus lents
npm run test:unit -- --reporter=verbose | tail -20

# Paralléliser sur plus de workers
npm run test -- --workers=8

# Ou moins de workers
npm run test -- --workers=2
```

## 🔧 Configuration avancée

```bash
# Changer l'environnement
npm run test -- --environment=node

# Changer le provider de coverage
npm run test:coverage -- --coverage.provider=v8

# Voir la config
npm run test -- --inspect-config

# Avec variables d'env
DATABASE_URL=test npm run test:backend
```

## 🎬 Enregistrer les résultats

```bash
# Enregistrer dans un fichier
npm run test:unit > test-results.txt

# JSON output
npm run test -- --reporter=json > results.json

# JUnit XML (pour CI)
npm run test -- --reporter=junit > results.xml
```

## 📱 Tests par contexte

### Avant de commit

```bash
npm run type-check && npm run test:all
```

### Avant de push

```bash
npm run test:coverage && npm run test:e2e
```

### En développement

```bash
npm run test:ui  # Interface web interactive
```

### Debugging

```bash
npm run test:debug  # Breakpoints VS Code
```

## 🔄 Watch mode utile

```bash
# Watch frontend tests
npm run test -- tests/unit/frontend

# Watch backend tests
npm run test -- tests/unit/backend

# Watch spécifique
npm run test -- auth.store.test.ts --watch

# Watch + UI
npm run test:ui
```

## 🎯 Quick reference

| Commande                | But                         |
| ----------------------- | --------------------------- |
| `npm run test`          | Watch mode (DEV)            |
| `npm run test:ui`       | Interface web (DEV)         |
| `npm run test:unit`     | Tous les tests once         |
| `npm run test:coverage` | Couverture de code          |
| `npm run test:backend`  | Tests backend seulement     |
| `npm run test:frontend` | Tests frontend seulement    |
| `npm run test:all`      | Tous les tests with details |
| `npm run test:debug`    | Debug mode                  |
| `npm run test:e2e`      | End-to-end tests            |

## 💡 Tips & Tricks

```bash
# Créer un alias
alias t='npm run test'
alias tc='npm run test:coverage'
alias ti='npm run test:ui'

# Tester à chaque save (Linux/Mac)
npm run test -- --watch

# Tester sur changement de fichier
npm run test -- --watch -- tests/unit/backend

# Voir help complet
npm run test -- --help
```

## 🐍 Shell scripts utiles

```bash
#!/bin/bash
# test-and-commit.sh

echo "Running tests..."
npm run test:coverage

if [ $? -eq 0 ]; then
  echo "✅ Tests passed!"
  git add .
  git commit -m "test: add/update tests"
else
  echo "❌ Tests failed!"
  exit 1
fi
```

## 🔐 Pre-commit hook

```bash
# .husky/pre-commit
npm run test:unit && npm run type-check
```

## 📊 CI/CD

```bash
# Simuler CI localement
npm run test:unit
npm run test:coverage
npm run type-check
```

## 🚨 Troubleshooting

```bash
# Tests timeout?
npm run test -- --testTimeout=10000

# Memory issues?
npm run test -- --workers=1

# Module not found?
npm run test -- --clearCache

# Vitest corruption?
rm -rf node_modules/.vitest
npm run test
```

---

**Sauvegardez cette page!** 📌

**Dernière mise à jour**: Mai 2026
