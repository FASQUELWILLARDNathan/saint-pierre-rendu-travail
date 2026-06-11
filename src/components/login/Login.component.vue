<template>
  <div class="login-container auth-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Contenu principal -->
    <div class="login-card auth-card">
      <h1 class="title">Connexion</h1>

      <p class="subtitle">Veuillez vous connectez pour acceder a votre compte</p>

      <!-- Champ de login -->
      <form @submit.prevent="handleSignIn" class="login-form auth-form">
        <div class="form-group">
          <input
            v-model="login"
            type="text"
            placeholder="Identifiant"
            class="form-input"
            required
          />
        </div>

        <!-- Champ de mot de passe -->
        <div class="form-group password-group">
          <div class="password-input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mot de passe"
              class="form-input"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            >
              <img
                v-if="!showPassword"
                src="/eye-password-show-svgrepo-com.svg"
                alt="Afficher"
                class="password-icon"
              />
              <img
                v-else
                src="/eye-password-hide-svgrepo-com.svg"
                alt="Masquer"
                class="password-icon"
              />
            </button>
          </div>
        </div>

        <!-- Lien mot de passe oublié -->
        <div class="forgot-password">
          <router-link to="/forgot-password" class="forgot-link auth-link"
            >Mot de passe oublié ?</router-link
          >
        </div>

        <!-- Bouton se connecter -->
        <button type="submit" class="submit-btn" :disabled="isLoading">Se connecter</button>
      </form>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Copyright © 2026, Tous droits réservés.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const login = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const handleSignIn = async () => {
  isLoading.value = true
  try {
    await authStore.signIn({
      login: login.value,
      password: password.value,
    })
    message.success('Connexion réussie!', {
      duration: 3000,
    })
    router.push('/')
  } catch (error) {
    message.error('Identifiants incorrects', {
      duration: 3000,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth-forms.css';

.login-card {
  max-width: 650px;
}

.login-form {
  gap: 20px;
}

.title {
  text-align: left;
  margin-left: 5px;
}

.subtitle {
  text-align: left;
  margin-left: 10px;
}

.forgot-password {
  text-align: left;
  margin-bottom: 8px;
  margin-left: 20px;
}

.logo {
  width: 120px;
  height: 120px;
}

.sign-up-section {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
}

.sign-up-section span {
  color: #000000;
  font-size: 15px;
  font-weight: 400;
}

.password-group {
  position: relative;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  flex: 1;
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #656262;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #1a5f7a;
}

.password-icon {
  width: 20px;
  height: 20px;
}
</style>
