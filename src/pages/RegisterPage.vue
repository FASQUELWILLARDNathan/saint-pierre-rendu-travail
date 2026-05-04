<template>
  <NForm @submit.prevent="handleSignUp">
    <NFormItem label="Nom" required>
      <NInput v-model:value="nom" type="text" placeholder="Fasquel" />
    </NFormItem>
    <NFormItem label="Prenom" required>
      <NInput v-model:value="prenom" type="text" placeholder="Nathan" />
    </NFormItem>
    <NFormItem label="Role" required>
      <n-select
        v-model:value="role"
        :options="[
          { label: 'Élève', value: 'eleve' },
          { label: 'Professeur', value: 'professeur' }
        ]"
      />
    </NFormItem>
    <n-form-item v-if="isEleve" label="Classe">
      <n-select v-model:value="classe" :options="generalOptions" />
    </n-form-item>
    <NFormItem label="Annee Scolaire">
      <n-date-picker v-model:value="annee" type="yearrange" clearable />
    </NFormItem>
    <NFormItem label="Mot de passe" required>
      <NInput
        v-model:value="password"
        type="password"
        show-password-on="mousedown"
        placeholder="Password"
      />
    </NFormItem>
    <NButton type="primary" attr-type="submit" :disabled="isLoading">S'inscrire</NButton>
    <div class="footer">
      <p>Déjà un compte ?</p>
      <RouterLink to="/login">Se connecter</RouterLink>
    </div>
  </NForm>
</template>

<script setup lang="ts">
import { NButton, NFormItem } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTES } from '@/router'
import { useAuthStore } from '../stores/auth.store'

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

  const generatedLogin =
    clean(nom.value) + '.' + clean(prenom.value)

  isLoading.value = true
  try {
    await authStore.signUp({
      nom: nom.value,
      prenom: prenom.value,
      login: generatedLogin,
      password: password.value,
      role: role.value,
      classe: role.value === 'eleve' ? classe.value ?? '' : '',
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
