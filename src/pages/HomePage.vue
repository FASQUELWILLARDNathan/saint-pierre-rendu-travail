<template>
  <div class="home-layout" :class="{ 'dark-mode': isDarkMode }">
    <!-- Sidebar Navigation -->
    <Sidebar :is-dark-mode="isDarkMode" />

    <!-- Main Wrapper -->
    <div class="main-wrapper">
      <!-- Header -->
      <header class="home-header">
        <div class="header-content">
          <div class="header-title">
            <h1>Bonjour, {{ userName }} !</h1>
            <p>Voici votre espace de travail.</p>
          </div>
        </div>

        <div class="header-controls">
          <!-- Dark Mode Toggle -->
          <div class="dark-mode-toggle">
            <span class="toggle-label">🌙</span>
            <input type="checkbox" id="darkModeSwitch" v-model="isDarkMode" class="toggle-switch" />
            <label for="darkModeSwitch" class="toggle-slider"></label>
          </div>
        </div>

        <div class="user-info">
          <n-dropdown trigger="click" :options="userMenuOptions" @select="handleUserMenuSelect">
            <div class="user-dropdown">
              <div class="user-avatar">{{ userInitials }}</div>
              <div class="user-details">
                <p class="user-name">{{ userName }}</p>
                <p class="user-class">{{ userClass }}</p>
              </div>
              <span class="dropdown-arrow">▼</span>
            </div>
          </n-dropdown>
        </div>
      </header>

      <!-- Main Content -->
      <main class="home-content">
        <div class="content-grid">
          <!-- Mes matières (gauche) -->
          <div class="left-column">
            <Matieres :is-dark-mode="isDarkMode" />
          </div>

          <!-- Travaux récents (droite) -->
          <div class="right-column">
            <TravauxRecents :is-dark-mode="isDarkMode" />
          </div>
        </div>

        <!-- À venir (dessous, pleine largeur) -->
        <div class="full-width">
          <TravauxAVenir :is-dark-mode="isDarkMode" />
        </div>
      </main>
    </div>

    <!-- Onboarding Modal -->
    <ProfOnBoardingModal :is-visible="onboardingStore.showModal" @onboarded="handleOnboarded" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NDropdown } from 'naive-ui'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import Sidebar from '../components/home/Sidebar.vue'
import Matieres from '../components/home/Matieres.vue'
import TravauxRecents from '../components/home/TravauxRecents.vue'
import TravauxAVenir from '../components/home/TravauxAVenir.vue'
import ProfOnBoardingModal from '../components/onboarding/ProfOnBoardingModal.component.vue'

const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const router = useRouter()
const isDarkMode = ref(false)
onMounted(async () => {
  console.log('onMounted fetchMe start')
  await authStore.fetchMe()
  console.log('onMounted fetchMe done')
})

const userMenuOptions = computed(() => {
  const options: any[] = [
    {
      label: 'Profil',
      key: 'profil',
    },
  ]

  // Add gestion des élèves option for teachers
  if (authStore.user?.role === 'administrateur') {
    options.push({
      label: 'Gestion des élèves',
      key: 'gestion-eleves',
    })
  }

  options.push({
    label: 'Déconnexion',
    key: 'logout',
  })

  return options
})

const userName = computed(() => {
  if (authStore.user?.prenom && authStore.user?.nom) {
    return `${authStore.user.prenom} ${authStore.user.nom}`
  }
  return authStore.user?.username || 'Utilisateur'
})

const userClass = computed(() => {
  const user = authStore.user

  if (!user) return 'Classe non définie'

  if (user.role === 'eleve') {
    return user.eleve?.classe?.nom_classe ?? 'Classe non définie'
  }

  if (user.role === 'professeur') {
    console.log('specialites_enseignees:', user.professeur?.specialites_enseignees)
    const classes = user.professeur?.classes_enseignees
    if (classes && classes.length > 0) {
      return classes.map((c) => c.classe.nom_classe).join(', ')
    }

    const specialites = user.professeur?.specialites_enseignees
    if (specialites && specialites.length > 0) {
      return specialites.map((s) => s.specialite.nom_specialite).join(', ')
    }

    return user.professeur?.matiere ?? 'Aucune matière'
  }

  return 'Classe non définie'
})

const userInitials = computed(() => {
  const parts = userName.value.split(' ')
  return parts
    .map((p) => p[0])
    .join('')
    .toUpperCase()
})

const handleUserMenuSelect = (key: string) => {
  if (key === 'logout') {
    handleLogout()
  } else if (key === 'profil') {
    router.push('/profil')
  } else if (key === 'gestion-eleves') {
    router.push('/gestion-eleves')
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleOnboarded = () => {
  onboardingStore.setShowModal(false)
}
</script>

<style scoped>
.home-layout {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  transition: all 0.3s ease;
}

.home-layout.dark-mode {
  background: #1a1a1a;
}

.main-wrapper {
  flex: 1;
  margin-left: 180px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.home-layout.dark-mode .main-wrapper {
  background: #2d2d2d;
}

.home-header {
  background: transparent;
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  box-shadow: none;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.home-layout.dark-mode .home-header {
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 200px;
}

.header-title h1 {
  font-size: 40px;
  font-weight: 700;
  color: #205781;
  margin: 0;
  transition: all 0.3s ease;
}

.home-layout.dark-mode .header-title h1 {
  color: #64b5f6;
}

.header-title p {
  font-size: 16px;
  color: #817f7f;
  margin: 4px 0 0 0;
  transition: all 0.3s ease;
}

.home-layout.dark-mode .header-title p {
  color: #b0b0b0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Dark Mode Toggle Styles */
.dark-mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(32, 87, 129, 0.1);
  transition: all 0.3s ease;
}

.home-layout.dark-mode .dark-mode-toggle {
  background: rgba(100, 181, 246, 0.1);
}

.toggle-label {
  font-size: 16px;
  font-weight: 600;
}

.toggle-switch {
  display: none;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  background-color: #d3d3d3;
  border-radius: 11px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch:checked + .toggle-slider {
  background-color: #64b5f6;
}

.toggle-switch:checked + .toggle-slider::before {
  left: 20px;
  background-color: white;
}

.toggle-switch:hover + .toggle-slider {
  box-shadow: 0 0 8px rgba(32, 87, 129, 0.3);
}

.home-layout.dark-mode .toggle-switch:hover + .toggle-slider {
  box-shadow: 0 0 8px rgba(100, 181, 246, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-dropdown:hover {
  background: rgba(32, 87, 129, 0.1);
}

.home-layout.dark-mode .user-dropdown:hover {
  background: rgba(100, 181, 246, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #205781;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.home-layout.dark-mode .user-avatar {
  background: #64b5f6;
  color: #1a1a1a;
}

.user-details {
  display: none;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #205781;
  margin: 0;
  transition: all 0.3s ease;
}

.home-layout.dark-mode .user-name {
  color: #64b5f6;
}

.user-class {
  font-size: 12px;
  color: #817f7f;
  margin: 0;
  transition: all 0.3s ease;
}

.home-layout.dark-mode .user-class {
  color: #b0b0b0;
}

.dropdown-arrow {
  color: #205781;
  font-size: 12px;
  margin-left: 8px;
  transition: all 0.3s ease;
}

.home-layout.dark-mode .dropdown-arrow {
  color: #64b5f6;
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  flex: 1;
  width: 100%;
  transition: all 0.3s ease;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.left-column {
  flex: 1;
}

.right-column {
  flex: 1;
}

.full-width {
  grid-column: 1 / -1;
}

/* Tablette (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .main-wrapper {
    margin-left: 80px;
  }

  .home-header {
    padding: 24px 16px;
    gap: 16px;
  }

  .header-title h1 {
    font-size: 32px;
  }

  .header-title p {
    font-size: 14px;
  }

  .user-details {
    display: none;
  }

  .home-content {
    padding: 24px 16px;
  }

  .content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .dark-mode-toggle {
    order: -1;
  }
}

/* Grand écran (> 1024px) */
@media (min-width: 1025px) {
  .user-details {
    display: flex;
  }
}

/* Téléphone (< 768px) */
@media (max-width: 767px) {
  .main-wrapper {
    margin-left: 0;
  }

  .home-header {
    padding: 16px 12px;
    padding-left: 60px;
    gap: 12px;
    justify-content: space-between;
  }

  .header-content {
    display: none;
  }

  .header-controls {
    display: flex;
    gap: 12px;
  }

  .header-title h1 {
    font-size: 20px;
  }

  .header-title p {
    font-size: 12px;
  }

  .user-details {
    display: none;
  }

  .user-dropdown {
    padding: 6px 8px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .dropdown-arrow {
    font-size: 10px;
    margin-left: 4px;
  }

  .home-content {
    padding: 16px 12px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .dark-mode-toggle {
    padding: 6px 10px;
  }

  .toggle-slider {
    width: 36px;
    height: 20px;
  }

  .toggle-slider::before {
    width: 16px;
    height: 16px;
  }

  .toggle-switch:checked + .toggle-slider::before {
    left: 18px;
  }

  .toggle-label {
    font-size: 14px;
  }
}

/* Petit téléphone (< 480px) */
@media (max-width: 479px) {
  .home-header {
    padding: 12px 8px;
  }

  .home-content {
    padding: 12px 8px;
  }

  .dark-mode-toggle {
    padding: 5px 8px;
    gap: 5px;
  }

  .toggle-slider {
    width: 32px;
    height: 18px;
  }

  .toggle-slider::before {
    width: 14px;
    height: 14px;
  }

  .toggle-switch:checked + .toggle-slider::before {
    left: 16px;
  }

  .toggle-label {
    font-size: 12px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }
}
</style>
