<template>
  <div class="reset-password-container auth-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Main content -->
    <div class="reset-password-card auth-card">
      <!-- Title -->
      <h1 class="title">Réinitialiser le mot de passe</h1>

      <!-- Status message -->
      <div v-if="message" :class="['status-message', messageType]">
        {{ message }}
      </div>

      <!-- Form -->
      <form v-if="!tokenValid" @submit.prevent="handleResetPassword" class="reset-form auth-form">
        <div class="form-group">
          <input
            v-model="newPassword"
            type="password"
            placeholder="Nouveau mot de passe"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe"
            class="form-input"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          Réinitialiser le mot de passe
        </button>
      </form>

      <!-- Back to login link -->
      <div v-if="tokenValid" class="sign-in-section">
        <router-link to="/login" class="sign-in-link auth-link">Retour à la connexion</router-link>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Copyright © 2026, Tous droits réservés.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('error')
const tokenValid = ref(false)
const token = ref('')

const handleResetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Les mots de passe ne correspondent pas'
    messageType.value = 'error'
    return
  }

  if (newPassword.value.length < 6) {
    message.value = 'Le mot de passe doit contenir au moins 6 caractères'
    messageType.value = 'error'
    return
  }

  isLoading.value = true

  try {
    const useAPI = useApi()
    await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.value,
        newPassword: newPassword.value,
      }),
    })

    message.value = 'Mot de passe réinitialisé avec succès! Redirection vers la connexion...'
    messageType.value = 'success'
    tokenValid.value = true

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    message.value = 'Erreur lors de la réinitialisation du mot de passe'
    messageType.value = 'error'
    console.error('Reset password error:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  token.value = params.get('token') || ''

  if (!token.value) {
    message.value = 'Token manquant. Lien de réinitialisation invalide.'
    messageType.value = 'error'
    tokenValid.value = true
  }
})
</script>

<style scoped>
@import '@/styles/auth-forms.css';

.reset-password-card {
  max-width: 420px;
}

.reset-form {
  gap: 16px;
}

.title {
  text-align: center;
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
