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

const userMenuOptions = [
  {
    label: 'Profil',
    key: 'profile',
  },
  {
    label: 'Déconnexion',
    key: 'logout',
  },
]

const userName = computed(() => {
  if (authStore.user?.prenom && authStore.user?.nom) {
    return `${authStore.user.prenom} ${authStore.user.nom}`
  }
  return authStore.user?.username || 'Utilisateur'
})

const userClass = computed(() => {
  return authStore.user?.eleve?.classe || 'Classe non définie'
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
  } else if (key === 'profile') {
    router.push('/profil')
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
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
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
}

.user-details {
  display: flex;
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

@media (min-width: 768px) {
  .user-details {
    display: block;
  }

  .home-header {
    padding: 24px 48px;
  }
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

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: 1;
  }
}

@media (max-width: 640px) {
  .main-wrapper {
    margin-left: 0;
  }

  .header-title h1 {
    font-size: 20px;
  }

  .home-header {
    padding: 16px 12px;
  }

  .home-content {
    padding: 16px 12px;
  }
}
</style>
