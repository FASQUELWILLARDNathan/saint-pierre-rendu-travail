<template>
  <NForm @submit.prevent="handleSignUp">
    <NFormItem label="Nom" required>
      <NInput v-model:value="nom" type="text" placeholder="Fasquel" />
    </NFormItem>
    <NFormItem label="Prenom" required>
      <NInput v-model:value="prenom" type="text" placeholder="Nathan" />
    </NFormItem>
    <n-form-item label="Classe" path="selectValue">
      <n-select
        v-model:value="model.selectValue"
        placeholder="Premiere"
        :options="generalOptions"
      />
    </n-form-item>
    <NFormItem label="Annee Scolaire" requied>
      <n-date-picker v-model:value="timestamp" type="yearrange" clearable />
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
import { ref } from 'vue'
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
const timestamp = ref<[number, number]>([oneYearAgo, now])

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

const handleSignUp = async () => {
  if (
    !nom.value ||
    !prenom.value ||
    !password.value ||
    !timestamp.value ||
    !model.value.selectValue
  ) {
    alert('Veuillez remplir tous les champs')
    return
  }

  // Générer le login: 3 premières lettres du nom + 2 derniers chiffres première année + 3 premières lettres du prénom + 2 derniers chiffres deuxième année
  const [year1, year2] = timestamp.value.map((t) => new Date(t).getFullYear())
  const generatedLogin =
    nom.value.substring(0, 3) +
    String(year1).slice(-2) +
    prenom.value.substring(0, 3) +
    String(year2).slice(-2)

  isLoading.value = true
  try {
    await authStore.signUp({
      nom: nom.value,
      prenom: prenom.value,
      login: generatedLogin,
      password: password.value,
      role: model.value.selectValue,
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
