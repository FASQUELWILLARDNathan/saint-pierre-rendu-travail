// src/store/auth.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useApi } from '@/composables/useApi'
import { useStorage } from '../composables/useStorage'
import type { SignUpPayload, User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const { get, set } = useStorage()
  const token = ref(get<string>('token'))
  const user = ref(get<User>('user'))

  const isAuth = computed((): boolean => {
    return token.value && user.value ? true : false
  })

  const signIn = async (payload: { login: string; password: string }) => {
    const { login, password } = payload
    const useAPI = useApi()
    const response = await useAPI.signIn({
      login: login,
      password: password,
    })
    set('token', response.token)
    set('user', response.user)
    token.value = response.token
    user.value = response.user
  }

  const signUp = async (payload: SignUpPayload) => {
    const { nom, prenom, login, password, role, classe, annee, email } = payload
    const useAPI = useApi()
    const response = await useAPI.signUp({
      nom: nom,
      prenom: prenom,
      login: login,
      password: password,
      role: role,
      classe: classe,
      annee: annee,
      email: email,
    })
    set('token', response.token)
    set('user', response.user)
    token.value = response.token
    user.value = response.user
  }

  const logout = () => {
    set('token', null)
    set('user', null)
    token.value = null
    user.value = null
  }

  return { token, user, isAuth, signIn, signUp, logout }
})
