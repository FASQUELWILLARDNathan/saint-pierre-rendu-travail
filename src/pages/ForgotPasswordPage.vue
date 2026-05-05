<template>
  <div class="forgot-password-container auth-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Main content -->
    <div class="forgot-password-card auth-card">
      <!-- Title -->
      <h1 class="title">Mot de passe oublié</h1>

      <!-- Subtitle -->
      <p class="subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>

      <!-- Status message -->
      <div v-if="message" :class="['status-message', messageType]">
        {{ message }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleForgotPassword" class="forgot-form auth-form">
        <div class="form-group">
          <input v-model="email" type="email" placeholder="Email" class="form-input" required />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
        </button>
      </form>

      <!-- Back to login link -->
      <div class="sign-in-section">
        <span>Retour à la </span>
        <router-link to="/login" class="sign-in-link auth-link">connexion</router-link>
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

const email = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('error')

const handleForgotPassword = async () => {
  if (!email.value) {
    message.value = 'Veuillez entrer votre email'
    messageType.value = 'error'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la demande')
    }

    message.value = 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    messageType.value = 'success'
    email.value = ''
  } catch (error) {
    message.value = 'Erreur lors de la demande. Veuillez réessayer.'
    messageType.value = 'error'
    console.error('Forgot password error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth-forms.css';

.forgot-password-card {
  max-width: 600px;
}

.forgot-form {
  gap: 20px;
}

.title {
  text-align: left;
  margin-left: 10px;
  font-size: 35px;
}

.subtitle {
  text-align: left;
  color: #656262;
  margin-bottom: 20px;
  margin-left: 10px
}

.logo {
  width: 160px;
  height: 160px;
}

.status-message {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 14px;
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.sign-in-section {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
}

.sign-in-section span {
  color: #000000;
  font-size: 15px;
  font-weight: 400;
}
</style>
