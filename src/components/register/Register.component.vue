<template>
  <div class="register-container auth-container">
    <!-- Logo -->
    <div class="logo-section">
      <img src="/saintpierre_logo_white.svg" alt="Saint-Pierre" class="logo" />
    </div>

    <!-- Main content -->
    <div class="register-card auth-card">
      <!-- Title -->
      <h1 class="title">Inscription</h1>

      <!-- Subtitle -->
      <p class="subtitle">Créez votre compte pour accéder à la plateforme</p>

      <!-- Form -->
      <form @submit.prevent="handleSignUp" class="register-form auth-form">
        <!-- Nom and Prenom row -->
        <div class="form-row">
          <div class="form-group">
            <input v-model="nom" type="text" placeholder="Nom" class="form-input" required />
          </div>
          <div class="form-group">
            <input v-model="prenom" type="text" placeholder="Prénom" class="form-input" required />
          </div>
        </div>

        <!-- Role and Classe/Email row -->
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

        <!-- Auto-generated email for students -->
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
        <router-link to="/login" class="sign-in-link auth-link">Se connecter</router-link>
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
const email = ref('')
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

const emailDisplay = computed(() => {
  if (role.value === 'eleve' && nom.value && prenom.value) {
    const clean = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/\s+/g, '') // remove spaces

    return `${clean(nom.value)}.${clean(prenom.value)}@cs-saintpierrecalais.fr`
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

  if (role.value === 'professeur' && !email.value) {
    alert('Email obligatoire pour un professeur')
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

  // For students, email is auto-generated
  const finalEmail = role.value === 'eleve' ? emailDisplay.value : email.value

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
      email: finalEmail,
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
@import '@/styles/auth-forms.css';

/* Register specific overrides */
.register-card {
  max-width: 520px;
}

.register-form {
  gap: 16px;
}

.title {
  text-align: center;
}

.subtitle {
  text-align: center;
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
</style>
