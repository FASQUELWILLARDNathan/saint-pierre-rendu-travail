import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOnboardingStore = defineStore('onboarding', () => {
  const showModal = ref(false)

  const setShowModal = (value: boolean) => {
    showModal.value = value
  }

  return { showModal, setShowModal }
})
