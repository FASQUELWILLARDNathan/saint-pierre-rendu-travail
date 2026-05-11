<template>
  <nav class="sidebar">
    <!-- Logo Header -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="sidebar-logo" />
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="sidebar-menu">
      <router-link to="/" class="menu-item active">
        <img src="/accueil-icon.svg" alt="Accueil" class="menu-icon" />
        <span class="menu-text">Accueil</span>
      </router-link>

      <router-link to="/notes" class="menu-item">
        <img src="/notes-icon.svg" alt="Notes" class="menu-icon" />
        <span class="menu-text">Notes</span>
      </router-link>

      <router-link to="/travaux" class="menu-item">
        <img src="/travaux-icon.svg" alt="Travaux" class="menu-icon" />
        <span class="menu-text">Travaux</span>
      </router-link>

      <router-link to="/devoirs" class="menu-item">
        <img src="/devoirs-icon.svg" alt="Devoirs" class="menu-icon" />
        <span class="menu-text">Devoirs</span>
      </router-link>

      <router-link to="/cours" class="menu-item">
        <img src="/cours-icon.svg" alt="Cours" class="menu-icon" />
        <span class="menu-text">Cours</span>
      </router-link>

      <router-link to="/messagerie" class="menu-item">
        <img src="/messagerie-icon.svg" alt="Messagerie" class="menu-icon" />
        <span class="menu-text">Messagerie</span>
      </router-link>

      <router-link to="/profil" class="menu-item">
        <img src="/profil-icon.svg" alt="Profil" class="menu-icon" />
        <span class="menu-text">Profil</span>
      </router-link>
    </div>

    <!-- Logout -->
    <div class="sidebar-logout">
      <button class="logout-item" @click="handleLogout">
        <img src="/deconnexion-icon.svg" alt="Déconnexion" class="menu-icon" />
        <span class="menu-text">Déconnexion</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
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
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  padding: 12px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
}

.logout-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>
