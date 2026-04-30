<template>
  <NForm @submit.prevent="handleSignIn">
    <NFormItem label="Login" required>
      <NInput v-model:value="login" type="text" placeholder="login" />
    </NFormItem>
    <NFormItem label="Mot de passe" required>
      <NInput
        v-model:value="password"
        type="password"
        show-password-on="mousedown"
        placeholder="Password"
      />
    </NFormItem>
    <NButton type="primary" attr-type="submit" :disabled="isLoading"
      >Se connecter</NButton
    >
    <div class="footer">
      <p>Jamais enregistrer ?</p>
      <RouterLink to="/register">S'enregistrer</RouterLink>
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
    router.push(ROUTES.HOME)
  } catch {
    alert('Identifiants incorrects')
  } finally {
    isLoading.value = false
  }
}
</script>
