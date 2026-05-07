<template>
  <div class="login-container auth-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Main content -->
    <div class="login-card auth-card">
      <!-- Title -->
      <h1 class="title">Connexion</h1>

      <!-- Subtitle -->
      <p class="subtitle">Veuillez vous connectez pour acceder a votre compte</p>

      <!-- Form -->
      <form @submit.prevent="handleSignIn" class="login-form auth-form">
        <!-- Login input -->
        <div class="form-group">
          <input
            v-model="login"
            type="text"
            placeholder="Identifiant"
            class="form-input"
            required
          />
        </div>

        <!-- Password input -->
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
              <svg
                v-if="!showPassword"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Forgot password link -->
        <div class="forgot-password">
          <router-link to="/forgot-password" class="forgot-link auth-link"
            >Mot de passe oublié ?</router-link
          >
        </div>

        <!-- Submit button -->
        <button type="submit" class="submit-btn" :disabled="isLoading">Se connecter</button>
      </form>

      <!-- Sign up link -->
      <div class="sign-up-section">
        <span>Pas de compte ? </span>
        <router-link to="/register" class="sign-up-link auth-link">Inscrivez vous!</router-link>
      </div>
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

/* Login specific overrides */
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
