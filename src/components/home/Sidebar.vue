<template>
  <!-- Hamburger button on mobile -->
  <button class="hamburger-btn" @click="isSidebarOpen = !isSidebarOpen">
    <span></span>
    <span></span>
    <span></span>
  </button>

  <!-- Mobile overlay backdrop -->
  <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="isSidebarOpen = false"></div>

  <!-- Sidebar -->
  <nav class="sidebar" :class="{ open: isSidebarOpen }">
    <!-- Close button on mobile -->
    <button class="sidebar-close-btn" @click="isSidebarOpen = false">✕</button>

    <!-- Logo Header -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="sidebar-logo" />
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="sidebar-menu">
      <router-link
        to="/"
        class="menu-item"
        :class="{ active: $route.path === '/' }"
        @click="isSidebarOpen = false"
      >
        <img src="/accueil-icon.svg" alt="Accueil" class="menu-icon" />
        <span class="menu-text">Accueil</span>
      </router-link>

      <router-link
        v-if="authStore.user?.role === 'eleve'"
        to="/notes"
        class="menu-item"
        :class="{ active: $route.path === '/notes' }"
        @click="isSidebarOpen = false"
      >
        <img src="/notes-icon.svg" alt="Notes" class="menu-icon" />
        <span class="menu-text">Notes</span>
      </router-link>

      <router-link
        v-if="authStore.user?.role === 'professeur'"
        to="/classes"
        class="menu-item"
        :class="{ active: $route.path === '/classes' }"
        @click="isSidebarOpen = false"
      >
        <img src="/classe-icon.svg" alt="Classes" class="menu-icon" />
        <span class="menu-text">Classes</span>
      </router-link>

      <router-link
        to="/devoirs"
        class="menu-item"
        :class="{ active: $route.path === '/devoirs' }"
        @click="isSidebarOpen = false"
      >
        <img src="/devoirs-icon.svg" alt="Devoirs" class="menu-icon" />
        <span class="menu-text">Devoirs</span>
      </router-link>

      <router-link
        to="/cours"
        class="menu-item"
        :class="{ active: $route.path === '/cours' }"
        @click="isSidebarOpen = false"
      >
        <img src="/cours-icon.svg" alt="Cours" class="menu-icon" />
        <span class="menu-text">Cours</span>
      </router-link>

      <router-link
        to="/messagerie"
        class="menu-item"
        :class="{ active: $route.path === '/messagerie' }"
        @click="isSidebarOpen = false"
      >
        <img src="/messagerie-icon.svg" alt="Messagerie" class="menu-icon" />
        <span class="menu-text">Messagerie</span>
      </router-link>

      <router-link
        to="/profil"
        class="menu-item"
        :class="{ active: $route.path === '/profil' }"
        @click="isSidebarOpen = false"
      >
        <img src="/profil-icon.svg" alt="Profil" class="menu-icon" />
        <span class="menu-text">Profil</span>
      </router-link>

      <router-link
        v-if="authStore.user?.role === 'administrateur'"
        to="/gestion-eleves"
        class="menu-item"
        :class="{ active: $route.path === '/gestion-eleves' }"
        @click="isSidebarOpen = false"
      >
        <img src="/settings-icon.svg" alt="Gestion des élèves" class="menu-icon" />
        <span class="menu-text">Gestion élèves</span>
      </router-link>
    </div>

    <!-- Logout -->
    <div class="sidebar-logout">
      <button class="logout-item" @click="handleLogout">
        <img src="/disconnect-icon.svg" alt="Déconnexion" class="menu-icon" />
        <span class="menu-text">Déconnexion</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.hamburger-btn {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px;
  z-index: 1001;
}

.hamburger-btn span {
  width: 24px;
  height: 3px;
  background: #205781;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.sidebar-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 180px;
  height: 100vh;
  background: #205781;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.sidebar-close-btn {
  display: none;
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.logo-container {
  width: 100%;
  aspect-ratio: 1;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.sidebar-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sidebar-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 12px;
  overflow-y: auto;
  scrollbar-width: none;
}

.sidebar-menu::-webkit-scrollbar {
  display: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item.active {
  background: rgba(93, 191, 163, 0.3);
  color: white;
  border-left: 3px solid #5dbfa3;
  padding-left: 9px;
}

.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

.menu-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-logout {
  padding: 20px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.logout-btn {
  width: 100%;
  padding: 10px 12px;
  background: rgba(217, 83, 79, 0.2);
  color: #d9534f;
  border: 1px solid rgba(217, 83, 79, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(217, 83, 79, 0.3);
  color: #ff6b6b;
}

.logout-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 14px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.logout-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Tablette (768px - 1024px) */
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }

  .sidebar-header {
    padding: 12px 8px;
  }

  .menu-item {
    gap: 0;
    padding: 12px 8px;
    justify-content: center;
    font-size: 0;
  }

  .menu-icon {
    width: 24px;
    height: 24px;
  }

  .menu-text {
    display: none;
  }

  .menu-item.active {
    border-left: none;
    border-bottom: 3px solid #5dbfa3;
    padding-left: 8px;
    padding-bottom: 9px;
  }

  .sidebar-menu {
    gap: 4px;
    padding: 12px 8px;
  }

  .sidebar-logout {
    padding: 12px 8px;
  }

  .logout-item {
    gap: 0;
    padding: 12px 8px;
    justify-content: center;
    font-size: 0;
  }
}

/* Téléphone (< 768px) */
@media (max-width: 767px) {
  .hamburger-btn {
    display: flex;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1001;
  }

  .sidebar-backdrop {
    display: block;
  }

  .sidebar {
    width: 80%;
    max-width: 250px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-close-btn {
    display: block;
  }

  .sidebar-header {
    padding: 16px 12px;
  }

  .menu-item {
    gap: 12px;
    padding: 12px 14px;
    justify-content: flex-start;
    font-size: 14px;
  }

  .menu-icon {
    width: 20px;
    height: 20px;
  }

  .menu-text {
    display: block;
  }

  .menu-item.active {
    border-left: 3px solid #5dbfa3;
    border-bottom: none;
    padding-left: 11px;
    padding-bottom: 12px;
  }

  .sidebar-menu {
    gap: 8px;
    padding: 20px 12px;
  }

  .sidebar-logout {
    padding: 20px 12px;
  }

  .logout-item {
    gap: 12px;
    padding: 12px 14px;
    justify-content: flex-start;
    font-size: 14px;
  }
}
</style>
