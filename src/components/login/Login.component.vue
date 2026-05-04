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
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="Mot de passe"
            class="form-input"
            required
          />
        </div>

        <!-- Forgot password link -->
        <div class="forgot-password">
          <a href="#" class="forgot-link auth-link">Mot de passe oublié ?</a>
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
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const login = ref('')
const password = ref('')
const isLoading = ref(false)

const handleSignIn = async () => {
  isLoading.value = true
  try {
    await authStore.signIn({
      login: login.value,
      password: password.value,
    })
    router.push('/')
  } catch (error) {
    alert('Identifiants incorrects')
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
</style>
