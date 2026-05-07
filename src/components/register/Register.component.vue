<template>
  <div class="register-container auth-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Contenu principale -->
    <div class="register-card auth-card">
      <h1 class="title">Inscription</h1>

      <p class="subtitle">Créez votre compte pour accéder à la plateforme</p>

      <!-- Formulaire -->
      <form @submit.prevent="handleSignUp" class="register-form auth-form">
        <div class="form-row">
          <div class="form-group">
            <input v-model="nom" type="text" placeholder="Nom" class="form-input" required />
          </div>
          <div class="form-group">
            <input v-model="prenom" type="text" placeholder="Prénom" class="form-input" required />
          </div>
        </div>

        <!-- Role classe/email -->
        <div class="form-row">
          <div class="form-group">
            <select v-model="role" class="form-input form-select" required>
              <option value="" disabled>Sélectionnez un rôle</option>
              <option value="eleve">Élève</option>
              <option value="professeur">Professeur</option>
            </select>
          </div>
          <div v-if="role === 'eleve'" class="form-group">
            <select v-model="classe" class="form-input form-select">
              <option value="" disabled>Sélectionnez une classe</option>
              <option value="sixieme">Sixième</option>
              <option value="cinquieme">Cinquième</option>
              <option value="quatrieme">Quatrième</option>
              <option value="troisieme">Troisième</option>
              <option value="seconde">Seconde</option>
              <option value="premiere">Première</option>
              <option value="terminale">Terminale</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div v-else-if="role === 'professeur'" class="form-group">
            <input v-model="email" type="email" placeholder="Email" class="form-input" required />
          </div>
        </div>

        <!-- Mail pour les etudiants -->
        <div v-if="role === 'eleve'" class="form-group">
          <input
            :value="emailDisplay"
            type="text"
            placeholder="Email (généré automatiquement)"
            class="form-input"
            disabled
          />
          <small style="color: #656262; margin-top: 4px; display: block"
            >Email généré: nom.prenom@cs-saintpierrecalais.fr</small
          >
        </div>

        <!-- Année scolaire -->
        <div class="form-group">
          <input
            :value="anneeDisplay"
            type="text"
            placeholder="Année scolaire"
            class="form-input"
            disabled
          />
          <small style="color: #656262; margin-top: 4px; display: block"
            >Années scolaires (par défaut: présent)</small
          >
        </div>

        <!-- Champ mot de passe -->
        <div class="form-group password-group">
          <div class="password-input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mot de passe"
              class="form-input"
              autocomplete="new-password"
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

        <!-- Bouton envoie -->
        <button type="submit" class="submit-btn" :disabled="isLoading">S'inscrire</button>
      </form>

      <!-- Lien de connexion -->
      <div class="sign-in-section">
        <span>Déjà inscrit ? </span>
        <router-link to="/login" class="sign-in-link auth-link">Se connecter</router-link>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Copyright © 2026, Tous droits réservés.</p>
    </div>

    <!-- Composant pour afficher le login -->
    <div v-if="showLoginModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Compte créé avec succès!</h2>
        <p style="margin: 20px 0; font-size: 16px; color: #656262">Votre identifiant est:</p>
        <div class="login-display">
          <span class="login-value">{{ generatedLogin }}</span>
          <div class="login-actions">
            <button type="button" class="copy-btn" @click="copyToClipboard" title="Copier">
              <img src="/copy-icon.svg" alt="Copier" />
            </button>
          </div>
        </div>
        <p style="margin-top: 16px; font-size: 14px; color: #656262">
          Conservez cet identifiant pour vos connexions ultérieures.
        </p>
        <button type="button" class="modal-btn" @click="closeModal">Valider</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

import { ROUTES } from '@/router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const nom = ref('')
const prenom = ref('')
const password = ref('')
const showPassword = ref(false)
const email = ref('')
const isLoading = ref(false)
const showLoginModal = ref(false)
const generatedLogin = ref('')
const now = Date.now()
const oneYearAgo = new Date().setFullYear(new Date().getFullYear() - 1)
const annee = ref<[number, number]>([oneYearAgo, now])
const role = ref<'eleve' | 'professeur'>('eleve')
const classe = ref<string | null>(null)

const model = ref({
  selectValue: null,
})

const isEleve = computed(() => role.value === 'eleve')

const anneeDisplay = computed(() => {
  if (annee.value) {
    const [year1, year2] = annee.value.map((t) => new Date(t).getFullYear())
    return `${year1}-${year2}`
  }
  return ''
})

const emailDisplay = computed(() => {
  if (role.value === 'eleve' && nom.value && prenom.value) {
    const clean = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enleve les accents
        .replace(/\s+/g, '') // Supprime les espaces

    return `${clean(nom.value)}.${clean(prenom.value)}@cs-saintpierrecalais.fr`
  }
  return ''
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedLogin.value)
    message.success('Identifiant copié', {
      duration: 2000,
    })
  } catch (err) {
    message.error('Erreur lors de la copie', {
      duration: 2000,
    })
  }
}

const closeModal = () => {
  showLoginModal.value = false
  router.push(ROUTES.HOME)
}

const handleSignUp = async () => {
  if (!nom.value || !prenom.value || !password.value || !annee.value || !role.value) {
    message.warning('Veuillez remplir tous les champs', {
      duration: 3000,
    })
    return
  }

  if (role.value === 'eleve' && !classe.value) {
    message.warning('Classe obligatoire pour un élève', {
      duration: 3000,
    })
    return
  }

  if (role.value === 'professeur' && !email.value) {
    message.warning('Email obligatoire pour un professeur', {
      duration: 3000,
    })
    return
  }

  // création du login
  const [year1, year2] = annee.value.map((t) => new Date(t).getFullYear())
  const clean = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // enlève accents
      .replace(/\s+/g, '') // enleve les espaces

  const login = clean(nom.value) + '.' + clean(prenom.value)
  generatedLogin.value = login

  // Pour les etudiants le mail est autogénéré
  const finalEmail = role.value === 'eleve' ? emailDisplay.value : email.value

  isLoading.value = true
  try {
    await authStore.signUp({
      nom: nom.value,
      prenom: prenom.value,
      login: login,
      password: password.value,
      role: role.value,
      classe: role.value === 'eleve' ? (classe.value ?? '') : '',
      annee: `${year1}-${year2}`,
      email: finalEmail,
    })
    message.success('Compte créé avec succès!', {
      duration: 3000,
    })
    showLoginModal.value = true
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    message.error("Erreur lors de l'inscription", {
      duration: 3000,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth-forms.css';

.register-card {
  max-width: 650px;
}

.register-form {
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.logo {
  width: 160px;
  height: 160px;
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-content h2 {
  color: #205781;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
}

.login-display {
  background-color: #f5f5f5;
  border: 2px solid #4f959d;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
}

.login-value {
  font-size: 18px;
  font-weight: 600;
  color: #205781;
  flex: 1;
}

.login-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #4f959d;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.copy-btn:hover {
  color: #438a92;
}

.copy-btn img {
  width: 16px;
  height: 16px;
}

.download-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #4f959d;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.download-btn:hover {
  color: #438a92;
}

.download-btn img {
  width: 16px;
  height: 16px;
}

.modal-btn {
  width: 100%;
  padding: 16px 24px;
  background-color: #4f959d;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.modal-btn:hover {
  background-color: #438a92;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 149, 157, 0.3);
}

.modal-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(79, 149, 157, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
</style>
