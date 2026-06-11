<template>
  <div class="onboarding-layout">
    <div class="onboarding-card">
      <h1>Bienvenue 👋</h1>
      <p>Avant de commencer, complétez votre profil.</p>

      <n-form :model="form">
        <n-form-item label="Matière">
          <n-select
            v-model:value="form.matiere"
            :options="matieres.map((m) => ({ label: m.nom_matiere, value: m.nom_matiere }))"
            clearable
          />
        </n-form-item>

        <n-form-item label="Spécialités enseignées">
          <n-select
            v-model:value="form.specialites_enseignees"
            multiple
            :options="
              specialites.map((s) => ({ label: s.nom_specialite, value: String(s.id_specialite) }))
            "
          />
        </n-form-item>

        <n-form-item label="Options enseignées">
          <n-select
            v-model:value="form.options_enseignees"
            multiple
            :options="options.map((o) => ({ label: o.nom_option, value: String(o.id_option) }))"
          />
        </n-form-item>

        <n-form-item label="Classes enseignées">
          <n-select
            v-model:value="form.classes_enseignees"
            multiple
            :options="classes.map((c) => ({ label: c.nom_classe, value: String(c.id_classe) }))"
          />
        </n-form-item>
      </n-form>

      <n-button type="primary" @click="saveOnboarding" :loading="isSaving" block>
        Commencer
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NSelect, NButton } from 'naive-ui'
import { useApi } from '@/composables/useApi'

interface Matiere {
  nom_matiere: string
}

interface Specialite {
  id_specialite: number
  nom_specialite: string
}

interface Option {
  id_option: number
  nom_option: string
}

interface Classe {
  id_classe: number
  nom_classe: string
}

const api = useApi()
const router = useRouter()
const isSaving = ref(false)

const matieres = ref<Matiere[]>([])
const specialites = ref<Specialite[]>([])
const options = ref<Option[]>([])
const classes = ref<Classe[]>([])

const form = ref({
  matiere: null as string | null,
  specialites_enseignees: [] as string[],
  options_enseignees: [] as string[],
  classes_enseignees: [] as string[],
})

onMounted(async () => {
  ;[matieres.value, specialites.value, options.value, classes.value] = await Promise.all([
    api.getMatieres() as any,
    api.getSpecialites() as any,
    api.getOptions() as any,
    api.getClasses() as any,
  ])
})

async function saveOnboarding() {
  isSaving.value = true
  try {
    await api.updateProfil({
      matiere: form.value.matiere,
      specialites_enseignees: form.value.specialites_enseignees,
      options_enseignees: form.value.options_enseignees,
      classes_enseignees: form.value.classes_enseignees,
    })
    router.push('/')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.onboarding-layout {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  color: #205781;
  margin: 0;
}

p {
  color: #817f7f;
  margin: 0;
  font-size: 15px;
}
</style>
