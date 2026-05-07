<template>
  <div class="reset-password-container auth-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Contenu principal -->
    <div class="reset-password-card auth-card">
      <h1 class="title">Réinitialiser le mot de passe</h1>

      <!-- Formulaire -->
      <form v-if="!tokenValid" @submit.prevent="handleResetPassword" class="reset-form auth-form">
        <div class="form-group password-group">
          <div class="password-input-wrapper">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Nouveau mot de passe"
              class="form-input"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showNewPassword = !showNewPassword"
              :aria-label="showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            >
              <img
                v-if="!showNewPassword"
                src="/eye-password-hide-svgrepo-com.svg"
                alt="Afficher"
                class="password-icon"
              />
              <img
                v-else
                src="/eye-password-show-svgrepo-com.svg"
                alt="Masquer"
                class="password-icon"
              />
            </button>
          </div>
        </div>

        <div class="form-group password-group">
          <div class="password-input-wrapper">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirmer le mot de passe"
              class="form-input"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
              :aria-label="
                showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
              "
            >
              <img
                v-if="!showConfirmPassword"
                src="/eye-password-hide-svgrepo-com.svg"
                alt="Afficher"
                class="password-icon"
              />
              <img
                v-else
                src="/eye-password-show-svgrepo-com.svg"
                alt="Masquer"
                class="password-icon"
              />
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          Réinitialiser le mot de passe
        </button>
      </form>

      <!-- Lien de retour a la connexion -->
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
import { useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()

const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const tokenValid = ref(false)
const token = ref('')

const handleResetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    message.error('Les mots de passe ne correspondent pas', {
      duration: 3000,
    })
    return
  }

  if (newPassword.value.length < 6) {
    message.warning('Le mot de passe doit contenir au moins 6 caractères', {
      duration: 3000,
    })
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.value,
        newPassword: newPassword.value,
      }),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la réinitialisation')
    }

    message.success('Mot de passe réinitialisé avec succès!', {
      duration: 3000,
    })
    tokenValid.value = true

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    message.error('Erreur lors de la réinitialisation du mot de passe', {
      duration: 3000,
    })
    console.error('Reset password error:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  token.value = params.get('token') || ''

  if (!token.value) {
    message.error('Token manquant. Lien de réinitialisation invalide.', {
      duration: 3000,
    })
    tokenValid.value = true
  }
})
</script>

<style scoped>
@import '@/styles/auth-forms.css';

.reset-password-card {
  max-width: 600px;
  max-height: 400px;
}

.reset-form {
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.submit-btn {
  margin-top: auto;
}

.title {
  text-align: left;
  margin-left: 5px;
  margin-bottom: 30px;
  font-size: 35px;
}

.logo {
  width: 160px;
  height: 160px;
}

.password-group {
  position: relative;
}

.password-group:last-of-type {
  margin-bottom: 32px;
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
