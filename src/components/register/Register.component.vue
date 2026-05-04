<template>
  <div class="register-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Main content -->
    <div class="register-card">
      <!-- Title -->
      <h1 class="title">Inscription</h1>

      <!-- Subtitle -->
      <p class="subtitle">Créez votre compte pour accéder à la plateforme</p>

      <!-- Form -->
      <form @submit.prevent="handleSignUp" class="register-form">
        <!-- Nom and Prenom row -->
        <div class="form-row">
          <div class="form-group">
            <input v-model="nom" type="text" placeholder="Nom" class="form-input" required />
          </div>
          <div class="form-group">
            <input v-model="prenom" type="text" placeholder="Prénom" class="form-input" required />
          </div>
        </div>

        <!-- Role and Classe row -->
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
        </div>

        <!-- Année scolaire input (full width) -->
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

        <!-- Password input (full width) -->
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="Mot de passe"
            class="form-input"
            required
          />
        </div>

        <!-- Submit button -->
        <button type="submit" class="submit-btn" :disabled="isLoading">S'inscrire</button>
      </form>

      <!-- Sign in link -->
      <div class="sign-in-section">
        <span>Déjà inscrit ? </span>
        <router-link to="/login" class="sign-in-link">Se connecter</router-link>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Copyright © 2026, Tous droits réservés.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTES } from '@/router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const nom = ref('')
const prenom = ref('')
const password = ref('')
const isLoading = ref(false)
const now = Date.now()
const oneYearAgo = new Date().setFullYear(new Date().getFullYear() - 1)
const annee = ref<[number, number]>([oneYearAgo, now])
const role = ref<'eleve' | 'professeur'>('eleve')
const classe = ref<string | null>(null)

const model = ref({
  selectValue: null,
})

const generalOptions = [
  'sixieme',
  'cinquieme',
  'quatrieme',
  'troisieme',
  'seconde',
  'premiere',
  'terminale',
  'autre',
].map((v) => ({
  label: v,
  value: v,
}))

const isEleve = computed(() => role.value === 'eleve')

const anneeDisplay = computed(() => {
  if (annee.value) {
    const [year1, year2] = annee.value.map((t) => new Date(t).getFullYear())
    return `${year1}-${year2}`
  }
  return ''
})

const handleSignUp = async () => {
  if (!nom.value || !prenom.value || !password.value || !annee.value || !role.value) {
    alert('Veuillez remplir tous les champs')
    return
  }

  if (role.value === 'eleve' && !classe.value) {
    alert('Classe obligatoire pour un élève')
    return
  }

  // création du login
  const [year1, year2] = annee.value.map((t) => new Date(t).getFullYear())
  const clean = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // enlève accents
      .replace(/\s+/g, '')

  const generatedLogin = clean(nom.value) + '.' + clean(prenom.value)

  isLoading.value = true
  try {
    await authStore.signUp({
      nom: nom.value,
      prenom: prenom.value,
      login: generatedLogin,
      password: password.value,
      role: role.value,
      classe: role.value === 'eleve' ? (classe.value ?? '') : '',
      annee: `${year1}-${year2}`,
    })
    router.push(ROUTES.HOME)
  } catch (error) {
    console.error('Sign up error:', error)
    alert("Erreur lors de l'inscription")
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

.register-container {
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
    width: 160px;
    height: 160px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.register-card {
    width: 100%;
    max-width: 520px;
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
    text-align: center;
    letter-spacing: -0.5px;
}

.subtitle {
    color: #000000;
    opacity: 0.5;
    font-size: 18px;
    font-weight: 400;
    margin: 0 0 32px 0;
    text-align: center;
    line-height: 1.5;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-row .form-group {
    position: relative;
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

.form-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23656262' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 18px center;
    padding-right: 45px;
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

.sign-in-link {
    color: #4f959d;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s ease;
}

.sign-in-link:hover {
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
  .register-card {
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

  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
