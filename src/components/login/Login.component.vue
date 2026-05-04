<template>
  <div class="login-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Main content -->
    <div class="login-card">
      <!-- Title -->
      <h1 class="title">Connexion</h1>

      <!-- Subtitle -->
      <p class="subtitle">Veuillez vous connectez pour acceder a votre compte</p>

      <!-- Form -->
      <form @submit.prevent="handleSignIn" class="login-form">
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
          <a href="#" class="forgot-link">Mot de passe oublié ?</a>
        </div>

        <!-- Submit button -->
        <button type="submit" class="submit-btn" :disabled="isLoading">Se connecter</button>
      </form>

      <!-- Sign up link -->
      <div class="sign-up-section">
        <span>Pas de compte ? </span>
        <router-link to="/register" class="sign-up-link">Inscrivez vous!</router-link>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
    font-family: 'Inter', sans-serif;
}

.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 100vh;
    background: linear-gradient(135deg, #205781 0%, #1a3a5c 100%);
    padding: 20px;
}

.logo-section {
    margin-top: 20px;
    margin-bottom: 20px;
    animation: slideDown 0.6s ease-out;
}

.logo {
    width: 120px;
    height: 120px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.login-card {
    width: 100%;
    max-width: 650px;
    background: #ffffff;
    border-radius: 20px;
    padding: 50px 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.6s ease-out;
}

.title {
    color: #205781;
    font-size: 48px;
    font-weight: 800;
    margin: 0 0 16px 0;
    text-align: left;
    letter-spacing: -0.5px;
    margin-left: 5px;
}

.subtitle {
    color: #000000;
    opacity: 0.5;
    font-size: 18px;
    font-weight: 400;
    margin: 0 0 32px 0;
    text-align: left;
    line-height: 1.5;
    margin-left: 10px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
}

.form-group {
    position: relative;
}

.form-input {
    width: 100%;
    padding: 14px 18px;
    font-size: 16px;
    font-weight: 400;
    border: 2px solid #656262;
    border-radius: 20px;
    background: #ffffff;
    color: #000000;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.form-input::placeholder {
    color: #656262;
    opacity: 0.7;
}

.form-input:focus {
    outline: none;
    border-color: #4f959d;
    box-shadow: 0 0 0 3px rgba(79, 149, 157, 0.1);
}

.forgot-password {
    text-align: left;
    margin-bottom: 8px;
    margin-left: 20px;
}

.forgot-link {
    color: #4f959d;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s ease;
}

.forgot-link:hover {
    opacity: 0.8;
    text-decoration: underline;
}

.submit-btn {
    width: 100%;
    padding: 16px 24px;
    background-color: #4f959d;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    font-size: 24px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
    background-color: #438a92;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 149, 157, 0.3);
}

.submit-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(79, 149, 157, 0.2);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

.sign-up-link {
    color: #4f959d;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s ease;
}

.sign-up-link:hover {
    opacity: 0.8;
    text-decoration: underline;
}

.footer {
    color: #ffffff;
    font-size: 14px;
    font-weight: 400;
    opacity: 0.9;
    text-align: center;
    margin-top: 60px;
    padding-bottom: 10px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 600px) {
  .login-card {
    padding: 30px 20px;
  }

  .title {
    font-size: 36px;
  }

  .subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .submit-btn {
    font-size: 18px;
    padding: 14px 20px;
  }

  .form-input {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
