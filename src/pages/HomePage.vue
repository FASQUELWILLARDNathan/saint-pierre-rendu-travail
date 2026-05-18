<template>
  <div class="home-layout">
    <!-- Sidebar Navigation -->
    <Sidebar />

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
            <Matieres />
          </div>

          <!-- Travaux récents (droite) -->
          <div class="right-column">
            <TravauxRecents />
          </div>
        </div>

        <!-- À venir (dessous, pleine largeur) -->
        <div class="full-width">
          <TravauxAVenir />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NDropdown } from 'naive-ui'
import { useAuthStore } from '@/stores/auth.store'
import Sidebar from '../components/home/Sidebar.vue'
import Matieres from '../components/home/Matieres.vue'
import TravauxRecents from '../components/home/TravauxRecents.vue'
import TravauxAVenir from '../components/home/TravauxAVenir.vue'

const authStore = useAuthStore()
const router = useRouter()

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
  return authStore.user?.eleve?.classe?.nom_classe || 'Classe non définie'
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
</script>

<style scoped>
.home-layout {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
}

.main-wrapper {
  flex: 1;
  margin-left: 180px;
  display: flex;
  flex-direction: column;
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
}

.header-title p {
  font-size: 16px;
  color: #817f7f;
  margin: 4px 0 0 0;
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
}

.user-class {
  font-size: 12px;
  color: #817f7f;
  margin: 0;
}

.dropdown-arrow {
  color: #205781;
  font-size: 12px;
  margin-left: 8px;
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  flex: 1;
  width: 100%;
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
    justify-content: flex-end;
  }

  .header-content {
    display: none;
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
}

/* Petit téléphone (< 480px) */
@media (max-width: 479px) {
  .home-header {
    padding: 12px 8px;
  }

  .home-content {
    padding: 12px 8px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }
}
</style>
