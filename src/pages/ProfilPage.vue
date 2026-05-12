<template>
  <div class="profil-layout">
    <Sidebar />

    <div class="main-wrapper">
      <header class="profil-header">
        <div class="header-title">
          <h1>Mon Profil</h1>
          <p>
            {{
              userRole === 'eleve'
                ? 'Vos informations personnelles'
                : 'Gérez vos informations personnelles'
            }}
          </p>
        </div>

        <div class="header-actions">
          <n-button
            v-if="userRole === 'professeur' && !isEditing"
            @click="isEditing = true"
            type="primary"
            quaternary
            :style="{ color: '#205781' }"
          >
            ✏️ Modifier
          </n-button>

          <div v-if="userRole === 'professeur' && isEditing" class="action-buttons">
            <n-button type="primary" @click="saveProfil" :loading="isSaving">
              Enregistrer
            </n-button>
            <n-button quaternary @click="cancelEdit">Annuler</n-button>
          </div>
        </div>
      </header>

      <main class="profil-content">
        <n-spin v-if="isLoading">
          <template #description>Chargement...</template>
        </n-spin>

        <n-alert v-else-if="error" type="error">
          {{ error }}
        </n-alert>

        <div v-else>
          <!-- INFOS -->
          <n-card class="profil-card">
            <n-form :model="form" :disabled="true">
              <n-form-item label="Nom">
                <n-input v-model:value="form.nom" readonly />
              </n-form-item>

              <n-form-item label="Prénom">
                <n-input v-model:value="form.prenom" readonly />
              </n-form-item>

              <n-form-item label="Email">
                <n-input v-model:value="form.email" readonly />
              </n-form-item>
            </n-form>
          </n-card>

          <!-- ELEVE (Lecture seule) -->
          <n-card v-if="userRole === 'eleve'" class="profil-card">
            <n-form :disabled="true">
              <n-form-item label="Classe">
                <n-input
                  :value="
                    classes.find((c) => String(c.id_classe) === String(form.id_classe))
                      ?.nom_classe || 'Non assignée'
                  "
                  readonly
                />
              </n-form-item>

              <div v-if="shouldShowSpecialites()">
                <n-form-item label="Spécialités">
                  <n-input :value="getSpecialitesDisplay()" readonly />
                </n-form-item>
              </div>

              <n-form-item label="Options">
                <n-input :value="getOptionsDisplay()" readonly />
              </n-form-item>
            </n-form>
          </n-card>

          <!-- PROF (Éditable) -->
          <n-card v-if="userRole === 'professeur'" class="profil-card">
            <n-form :disabled="!isEditing">
              <n-form-item label="Matière">
                <n-select
                  v-model:value="form.matiere"
                  :options="
                    matieres.map((m) => ({
                      label: m.nom_matiere,
                      value: m.nom_matiere,
                    }))
                  "
                  clearable
                />
              </n-form-item>

              <n-form-item label="Spécialités enseignées">
                <n-select
                  v-model:value="form.specialites_enseignees"
                  multiple
                  :options="
                    specialites.map((s) => ({
                      label: s.nom_specialite,
                      value: String(s.id_specialite),
                    }))
                  "
                  :disabled="!isEditing"
                />
              </n-form-item>

              <n-form-item label="Options enseignées">
                <n-select
                  v-model:value="form.options_enseignees"
                  multiple
                  :options="
                    options.map((o) => ({
                      label: o.nom_option,
                      value: String(o.id_option),
                    }))
                  "
                  :disabled="!isEditing"
                />
              </n-form-item>

              <n-form-item label="Classes enseignées">
                <n-select
                  v-model:value="form.classes_enseignees"
                  multiple
                  :options="
                    classes.map((c) => ({
                      label: c.nom_classe,
                      value: String(c.id_classe),
                    }))
                  "
                  :disabled="!isEditing"
                />
              </n-form-item>
            </n-form>
          </n-card>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NCard,
  NCheckbox,
  NSpin,
  NAlert,
} from 'naive-ui'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth.store'
import Sidebar from '@/components/home/Sidebar.vue'

interface profilForm {
  nom: string
  prenom: string
  email: string
  // Eleve fields
  id_classe?: string | number
  specialites: (string | number)[]
  options: (string | number)[]
  // Professeur fields
  matiere?: string
  classes_enseignees: (string | number)[]
  specialites_enseignees: (string | number)[]
  options_enseignees: (string | number)[]
}

interface Classe {
  id_classe: string | number
  nom_classe: string
}

interface Specialite {
  id_specialite: string | number
  nom_specialite: string
}

interface Option {
  id_option: string | number
  nom_option: string
}

interface Matiere {
  id_matiere: string | number
  nom_matiere: string
}

const api = useApi()
const authStore = useAuthStore()
const userRole = ref<'eleve' | 'professeur' | null>(null)

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)

const classes = ref<Classe[]>([])
const specialites = ref<Specialite[]>([])
const options = ref<Option[]>([])
const matieres = ref<Matiere[]>([])

const form = ref({
  nom: '',
  prenom: '',
  email: '',
  id_classe: null as string | number | null,
  specialites: [] as string[],
  options: [] as string[],
  matiere: null as string | null,
  classes_enseignees: [] as string[],
  specialites_enseignees: [] as string[],
  options_enseignees: [] as string[],
})

const specialitesError = ref<string | null>(null)

function getSchoolLevel(): 'college' | 'seconde' | 'premiere' | 'terminale' | null {
  if (!form.value.id_classe) return null

  const selectedClass = classes.value.find(
    (c) => String(c.id_classe) === String(form.value.id_classe),
  )
  if (!selectedClass) return null

  const levelName = selectedClass.nom_classe.toLowerCase()

  // Collège levels
  if (
    levelName.includes('6ème') ||
    levelName.includes('5ème') ||
    levelName.includes('4ème') ||
    levelName.includes('3ème')
  ) {
    return 'college'
  }

  // Seconde
  if (levelName.includes('seconde')) {
    return 'seconde'
  }

  // Première
  if (levelName.includes('première') || levelName.includes('1ère')) {
    return 'premiere'
  }

  // Terminale
  if (levelName.includes('terminale') || levelName.includes('tale')) {
    return 'terminale'
  }

  return null
}

function getSpecialitesRequiredCount(): number | null {
  const level = getSchoolLevel()
  if (level === 'premiere') return 3
  if (level === 'terminale') return 2
  return null
}

function shouldShowSpecialites(): boolean {
  const level = getSchoolLevel()
  return level === 'premiere' || level === 'terminale'
}

function getSpecialitesDisplay(): string {
  if (!form.value.specialites || form.value.specialites.length === 0) {
    return 'Aucune'
  }
  return form.value.specialites
    .map(
      (id) => specialites.value.find((s) => String(s.id_specialite) === String(id))?.nom_specialite,
    )
    .filter(Boolean)
    .join(', ')
}

function getOptionsDisplay(): string {
  if (!form.value.options || form.value.options.length === 0) {
    return 'Aucune'
  }
  return form.value.options
    .map((id) => options.value.find((o) => String(o.id_option) === String(id))?.nom_option)
    .filter(Boolean)
    .join(', ')
}

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null

    // Get user info
    const userData = authStore.user
    if (!userData) {
      error.value = 'Utilisateur non authentifié'
      return
    }

    userRole.value = userData.role as 'eleve' | 'professeur'

    // Load profil data
    await loadProfil()
  } catch (err) {
    error.value = 'Erreur lors du chargement du profil'
    console.error('Erreur:', err)
  } finally {
    isLoading.value = false
  }
})

async function loadProfil() {
  try {
    // Get classes
    classes.value = (await api.getClasses()) as any

    // Get specialites and options
    specialites.value = (await api.getSpecialites()) as any
    options.value = (await api.getOptions()) as any

    // Get matieres
    matieres.value = (await api.getMatieres()) as any

    // Get user profil
    const profil = (await api.getProfil()) as any

    form.value = {
      nom: profil.nom || '',
      prenom: profil.prenom || '',
      email: profil.email || '',
      id_classe: profil.id_classe ? String(profil.id_classe) : null,

      specialites: (profil.specialites || []).map((s: any) =>
        String(typeof s === 'object' ? s.id_specialite : s),
      ),

      options: (profil.options || []).map((o: any) =>
        String(typeof o === 'object' ? o.id_option : o),
      ),

      matiere: profil.matiere || null,

      classes_enseignees: (profil.classes_enseignees || []).map((c: any) =>
        String(typeof c === 'object' ? c.id_classe : c),
      ),

      specialites_enseignees: (profil.specialites_enseignees || []).map((s: any) =>
        String(typeof s === 'object' ? s.id_specialite : s),
      ),

      options_enseignees: (profil.options_enseignees || []).map((o: any) =>
        String(typeof o === 'object' ? o.id_option : o),
      ),
    }
  } catch (err) {
    console.error('Erreur lors du chargement du profil:', err)
    throw err
  }
}

async function saveProfil() {
  try {
    isSaving.value = true
    error.value = null
    specialitesError.value = null

    // Valider les spécialités pour les élèves
    if (userRole.value === 'eleve' && shouldShowSpecialites()) {
      const requiredCount = getSpecialitesRequiredCount()
      const currentCount = form.value.specialites.length

      if (requiredCount && currentCount !== requiredCount) {
        specialitesError.value = `Vous devez sélectionner exactement ${requiredCount} spécialité(s). Actuellement: ${currentCount}.`
        isSaving.value = false
        return
      }
    }

    await api.updateProfil({
      nom: form.value.nom,
      prenom: form.value.prenom,
      email: form.value.email,
      id_classe: form.value.id_classe,
      specialites: form.value.specialites,
      options: form.value.options,
      matiere: form.value.matiere,
      classes_enseignees: form.value.classes_enseignees,
      specialites_enseignees: form.value.specialites_enseignees,
      options_enseignees: form.value.options_enseignees,
    })

    isEditing.value = false
    // Reload profil to confirm changes
    await loadProfil()
  } catch (err) {
    error.value = 'Erreur lors de la sauvegarde du profil'
    console.error('Erreur:', err)
  } finally {
    isSaving.value = false
  }
}

function cancelEdit() {
  isEditing.value = false
  loadProfil()
}
</script>

<style scoped>
.profil-layout {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
}

.main-wrapper {
  flex: 1;
  margin-left: 180px;
  display: flex;
  flex-direction: column;
}

.profil-header {
  background: transparent;
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  box-shadow: none;
  flex-wrap: wrap;
}

.header-title h1 {
  font-size: 40px;
  font-weight: 700;
  color: #205781;
  margin: 0;
}

.header-title p {
  color: #817f7f;
  margin: 8px 0 0 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.gestion-link {
  text-decoration: none;
  display: inline-block;
}

.profil-content {
  padding: 0 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.profil-card {
  background: white;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
}

.specialites-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.specialites-info {
  font-size: 13px;
  color: #817f7f;
  margin: 0;
  font-style: italic;
}

.specialites-error {
  margin-top: 12px;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #205781;
  margin: 0;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

.checkbox-label input[type='checkbox'] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.checkbox-label input[type='checkbox']:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
  }

  .profil-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .profil-content {
    padding: 0 16px 24px;
  }

  .checkbox-group {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
