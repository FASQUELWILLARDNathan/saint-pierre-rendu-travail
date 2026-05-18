import { test, expect } from '@playwright/test'

/**
 * Tests E2E - Flux utilisateur complet
 */

test.describe('Authentication Flow', () => {
  test('should complete user login flow', async ({ page }) => {
    // Naviguer vers la page de connexion
    await page.goto('/login')

    // Vérifier que le formulaire est visible
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Connexion")')).toBeVisible()

    // Remplir le formulaire
    await page.fill('input[placeholder="Login"]', 'testuser')
    await page.fill('input[placeholder="Password"]', 'TestPassword123!')

    // Soumettre
    await page.click('button:has-text("Connexion")')

    // Vérifier la redirection
    await expect(page).toHaveURL('/home')
    await expect(page.locator('text=Accueil')).toBeVisible()
  })

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[placeholder="Login"]', 'wronguser')
    await page.fill('input[placeholder="Password"]', 'wrongpassword')
    await page.click('button:has-text("Connexion")')

    // Vérifier le message d'erreur
    await expect(page.locator('text=Identifiants invalides')).toBeVisible()
  })

  test('should logout user', async ({ page }) => {
    // Supposer que l'utilisateur est connecté
    await page.goto('/home')

    // Cliquer sur le menu utilisateur
    await page.click('button[aria-label="User menu"]')

    // Cliquer sur déconnexion
    await page.click('a:has-text("Déconnexion")')

    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login')
  })

  test('should reset password', async ({ page }) => {
    await page.goto('/login')

    // Cliquer sur "Mot de passe oublié"
    await page.click('a:has-text("Mot de passe oublié")')

    // Vérifier la page de récupération
    await expect(page).toHaveURL('/forgot-password')

    // Remplir l'email
    await page.fill('input[type="email"]', 'user@example.com')
    await page.click('button:has-text("Envoyer")')

    // Vérifier le message de succès
    await expect(page.locator('text=Email envoyé')).toBeVisible()
  })
})

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Connexion avant chaque test
    await page.goto('/login')
    await page.fill('input[placeholder="Login"]', 'testuser')
    await page.fill('input[placeholder="Password"]', 'TestPassword123!')
    await page.click('button:has-text("Connexion")')
    await page.waitForURL('/home')
  })

  test('should display student matieres', async ({ page }) => {
    await page.goto('/home')

    // Vérifier que les matières sont affichées
    const matieres = page.locator('[data-testid="matiere-card"]')
    await expect(matieres).not.toHaveCount(0)
  })

  test('should display upcoming assignments', async ({ page }) => {
    await page.goto('/home')

    // Vérifier la section devoirs
    await expect(page.locator('text=Devoirs à venir')).toBeVisible()

    const devoirs = page.locator('[data-testid="devoir-item"]')
    const count = await devoirs.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display upcoming events', async ({ page }) => {
    await page.goto('/home')

    // Vérifier la section événements
    await expect(page.locator('text=Événements')).toBeVisible()

    const events = page.locator('[data-testid="event-item"]')
    const count = await events.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should filter by matiere', async ({ page }) => {
    await page.goto('/home')

    // Cliquer sur une matière
    const matiereCard = page.locator('[data-testid="matiere-card"]').first()
    await matiereCard.click()

    // Vérifier que les devoirs sont filtrés
    const devoirs = page.locator('[data-testid="devoir-item"]')
    const count = await devoirs.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="Login"]', 'testuser')
    await page.fill('input[placeholder="Password"]', 'TestPassword123!')
    await page.click('button:has-text("Connexion")')
  })

  test('should display user profile', async ({ page }) => {
    await page.goto('/profile')

    // Vérifier les informations utilisateur
    await expect(page.locator('text=Profil')).toBeVisible()
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User')
  })

  test('should edit user profile', async ({ page }) => {
    await page.goto('/profile')

    // Cliquer sur éditer
    await page.click('button:has-text("Éditer")')

    // Modifier les données
    await page.fill('input[data-testid="prenom"]', 'NewFirstName')
    await page.click('button:has-text("Sauvegarder")')

    // Vérifier la mise à jour
    await expect(page.locator('text=Profil mis à jour')).toBeVisible()
  })

  test('should change password', async ({ page }) => {
    await page.goto('/profile')

    // Cliquer sur l'onglet de sécurité
    await page.click('button:has-text("Sécurité")')

    // Remplir les mots de passe
    await page.fill('input[data-testid="current-password"]', 'TestPassword123!')
    await page.fill('input[data-testid="new-password"]', 'NewPassword456!')
    await page.fill('input[data-testid="confirm-password"]', 'NewPassword456!')

    // Soumettre
    await page.click('button:has-text("Changer le mot de passe")')

    // Vérifier le succès
    await expect(page.locator('text=Mot de passe changé')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="Login"]', 'testuser')
    await page.fill('input[placeholder="Password"]', 'TestPassword123!')
    await page.click('button:has-text("Connexion")')
  })

  test('should navigate through menu', async ({ page }) => {
    // Vérifier les liens du menu
    await expect(page.locator('a[href="/home"]')).toBeVisible()
    await expect(page.locator('a[href="/assignments"]')).toBeVisible()
    await expect(page.locator('a[href="/events"]')).toBeVisible()
    await expect(page.locator('a[href="/profile"]')).toBeVisible()
  })

  test('should highlight active page', async ({ page }) => {
    await page.goto('/home')

    // Vérifier que home est actif
    const homeLink = page.locator('a[href="/home"]')
    await expect(homeLink).toHaveClass(/active/)
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    // Changer la taille pour mobile
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/login')

    // Vérifier que le formulaire est visible
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should work on tablet', async ({ page }) => {
    // Changer la taille pour tablet
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/login')

    // Vérifier la disposition
    await expect(page.locator('form')).toBeVisible()
  })

  test('should work on desktop', async ({ page }) => {
    // Taille desktop standard
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto('/login')

    // Vérifier la disposition
    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load home page within 3 seconds', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/login')
    await page.fill('input[placeholder="Login"]', 'testuser')
    await page.fill('input[placeholder="Password"]', 'TestPassword123!')
    await page.click('button:has-text("Connexion")')

    const navigationTime = Date.now() - startTime

    expect(navigationTime).toBeLessThan(3000)
  })
})

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login')

    // Naviguer avec Tab
    await page.keyboard.press('Tab')
    await expect(page.locator('input[placeholder="Login"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('input[placeholder="Password"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('button:has-text("Connexion")')).toBeFocused()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login')

    // Vérifier les labels
    await expect(page.locator('input[aria-label="Login"]')).toBeVisible()
    await expect(page.locator('button[aria-label="Sign In"]')).toBeVisible()
  })
})
