<template>
  <div class="gestion-layout">
    <Sidebar />

    <div class="main-wrapper">
      <header class="gestion-header">
        <div class="header-title">
          <h1>Gestion des élèves</h1>
          <p>Triés par classe</p>
        </div>
        <div class="header-actions">
          <input
            ref="importFileInput"
            type="file"
            accept=".xlsx,.xls"
            class="hidden-file-input"
            @change="handleImportFileChange"
          />
          <n-button secondary @click="triggerImportFilePicker(false)" :loading="isImporting">
            Importer un fichier
          </n-button>
          <n-button type="warning" @click="testPromotion" :loading="isTesting">
            Promotion manuelle
          </n-button>
        </div>
      </header>

      <main class="gestion-content">
        <n-spin v-if="isLoading">
          <template #description>Chargement...</template>
        </n-spin>

        <n-alert v-else-if="error" type="error">
          {{ error }}
        </n-alert>

        <div v-else class="gestion-container">
          <n-card class="classe-selector-card">
            <div class="classe-selector-header">
              <label>Sélectionnez une classe :</label>
              <n-button type="primary" @click="createNewEleve" size="small"> + Ajouter </n-button>
            </div>
            <div class="classe-selector">
              <n-select
                v-model:value="selectedClasseId"
                :options="
                  classesWithEleves.map((c) => ({
                    label: `${c.nom_classe} (${c.eleves.length} élèves)`,
                    value: String(c.id_classe),
                  }))
                "
                clearable
                placeholder="Sélectionnez une classe"
                @update:value="selectClasse"
              />
            </div>
          </n-card>

          <div
            v-if="selectedClasseEleves.length > 0 || isCreatingNew"
            class="eleves-section"
            :class="{ 'full-width': selectedClasseEleves.length === 0 }"
          >
            <n-card v-if="selectedClasseEleves.length > 0" class="eleves-list-card">
              <div class="eleves-list-header">
                <h3>Élèves ({{ selectedClasseEleves.length }})</h3>
              </div>

              <div class="eleves-grid">
                <div
                  v-for="(eleve, index) in selectedClasseEleves"
                  :key="eleve.id_user"
                  class="eleve-item"
                  :class="{ active: currentEleveIndex === index }"
                  @click="selectEleve(index)"
                >
                  <div class="eleve-name">{{ eleve.prenom }} {{ eleve.nom }}</div>
                  <div class="eleve-email">{{ eleve.email }}</div>
                </div>
              </div>
            </n-card>

            <n-card v-if="currentEleve || isCreatingNew" class="eleve-form-card">
              <div class="form-header">
                <div>
                  <h3 v-if="isCreatingNew">Nouvel élève</h3>
                  <h3 v-else>{{ currentEleve?.prenom }} {{ currentEleve?.nom }}</h3>
                  <p v-if="!isCreatingNew">
                    {{ currentEleveIndex + 1 }} / {{ selectedClasseEleves.length }}
                  </p>
                </div>

                <div v-if="!isCreatingNew" class="nav-buttons">
                  <n-button
                    v-if="currentEleveIndex > 0"
                    @click="selectEleve(currentEleveIndex - 1)"
                    type="primary"
                    quaternary
                  >
                    ← Précédent
                  </n-button>
                  <n-button
                    v-if="currentEleveIndex < selectedClasseEleves.length - 1"
                    @click="selectEleve(currentEleveIndex + 1)"
                    type="primary"
                    quaternary
                  >
                    Suivant →
                  </n-button>
                </div>
              </div>

              <n-divider />

              <n-form :model="currentEleveForm">
                <n-form-item label="Nom">
                  <n-input v-model:value="currentEleveForm.nom" />
                </n-form-item>

                <n-form-item label="Prénom">
                  <n-input v-model:value="currentEleveForm.prenom" />
                </n-form-item>

                <n-form-item label="Mot de passe">
                  <div class="password-container">
                    <div class="password-input-wrapper">
                      <n-input
                        v-model:value="currentEleveForm.password"
                        :type="showPassword ? 'text' : 'password'"
                        :placeholder="isCreatingNew ? '' : 'Laisser vide pour ne pas changer'"
                      />

                      <button
                        type="button"
                        class="password-toggle"
                        @click="showPassword = !showPassword"
                        :aria-label="
                          showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                        "
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

                    <n-button @click="onGeneratePassword" secondary> Générer </n-button>
                  </div>
                </n-form-item>

                <n-form-item label="Classe">
                  <n-select
                    v-model:value="currentEleveForm.id_classe"
                    :options="
                      classes.map((c) => ({
                        label: c.nom_classe,
                        value: String(c.id_classe),
                      }))
                    "
                    clearable
                  />
                </n-form-item>

                <n-form-item label="Année scolaire">
                  <n-input v-model:value="currentEleveForm.annee" placeholder="ex: 2025-2026" />
                </n-form-item>

                <div v-if="shouldShowSpecialites()">
                  <n-form-item label="Spécialités">
                    <div class="specialites-container">
                      <n-select
                        v-model:value="currentEleveForm.specialites"
                        multiple
                        :options="specialitesOptions"
                      />
                      <p class="specialites-info">
                        {{
                          getSchoolLevel() === 'premiere'
                            ? 'Sélectionnez 3 spécialités'
                            : 'Sélectionnez 2 spécialités'
                        }}
                      </p>
                      <n-alert v-if="specialitesError" type="error" class="specialites-error">
                        {{ specialitesError }}
                      </n-alert>
                    </div>
                  </n-form-item>
                </div>

                <n-form-item label="Options">
                  <n-select
                    v-model:value="currentEleveForm.options"
                    multiple
                    :options="
                      options.map((o) => ({
                        label: o.nom_option,
                        value: String(o.id_option),
                      }))
                    "
                  />
                </n-form-item>
              </n-form>

              <n-divider />

              <div class="form-actions">
                <n-button type="primary" @click="saveEleve" :loading="isSaving">
                  {{ isCreatingNew ? "Créer l'élève" : 'Enregistrer' }}
                </n-button>
                <n-button quaternary @click="cancelEdit">Annuler</n-button>
                <n-button
                  v-if="!isCreatingNew"
                  type="error"
                  @click="deleteEleve"
                  :loading="isSaving"
                >
                  Supprimer
                </n-button>
              </div>
            </n-card>
          </div>

          <n-empty
            v-else
            description="Sélectionnez une classe pour voir les élèves"
            class="empty-state"
          />
        </div>
      </main>

      <n-modal v-model:show="showImportResultModal" preset="card" title="Résultat de l'import">
        <div class="import-result">
          <n-alert v-if="importErrors.length > 0" type="warning" class="import-warning">
            {{ importErrors.length }} erreur(s) pendant l'import.
          </n-alert>

          <div v-if="importResults.length > 0" class="import-table">
            <div class="import-table-header">
              <span>Élève</span>
              <span>Login</span>
              <span>Mot de passe</span>
            </div>
            <div
              v-for="item in importResults"
              :key="`${item.login}-${item.email}`"
              class="import-table-row"
            >
              <span>{{ item.prenom }} {{ item.nom }}</span>
              <span>{{ item.login }}</span>
              <span class="import-password">{{ item.password }}</span>
            </div>
          </div>

          <n-empty v-else description="Aucun élève créé" />
        </div>

        <n-button @click="exportCSV" secondary> Export CSV </n-button>

        <n-button @click="exportXLSX" type="primary" secondary> Export XLSX </n-button>
      </n-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'
// Ajout de "watch" dans les imports de vue
import { ref, onMounted, computed, watch } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NCard,
  NSpin,
  NAlert,
  NDivider,
  NEmpty,
  NModal,
  useMessage,
} from 'naive-ui'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth.store'
import Sidebar from '@/components/home/Sidebar.vue'

interface Classe {
  id_classe: string | number
  nom_classe: string
}

interface ClasseWithEleves {
  id_classe: string | number
  nom_classe: string
  eleves: any[]
}

interface Eleve {
  id_user: string | number
  nom: string
  prenom: string
  email: string
  password: string
  id_classe: string | number | null
  annee?: string
  specialites: Specialite[]
  options: Option[]
}

interface Specialite {
  id_specialite: string | number
  nom_specialite: string
}

interface Option {
  id_option: string | number
  nom_option: string
}

const api = useApi()
const authStore = useAuthStore()
const message = useMessage()

const isLoading = ref(true)
const isSaving = ref(false)
const isImporting = ref(false)
const error = ref<string | null>(null)
const specialitesError = ref<string | null>(null)
const showImportResultModal = ref(false)
const importResults = ref<any[]>([])
const importErrors = ref<any[]>([])
const showPassword = ref(false)

const classes = ref<Classe[]>([])
const specialites = ref<Specialite[]>([])
const options = ref<Option[]>([])
const eleves = ref<Eleve[]>([])
const isTesting = ref(false)

const selectedClasseId = ref<string | null>(null)
const currentEleveIndex = ref(0)
const isCreatingNew = ref(false)
const importFileInput = ref<HTMLInputElement | null>(null)
const importDownloadMode = ref(false)
const currentEleveForm = ref({
  nom: '',
  prenom: '',
  email: '',
  password: '',
  id_classe: null as string | null,
  annee: '',
  specialites: [] as string[],
  options: [] as string[],
})

// Computed properties
const classesWithEleves = computed(() => {
  return classes.value
    .map((classe) => ({
      ...classe,
      eleves: eleves.value.filter((e) => String(e.id_classe) === String(classe.id_classe)),
    }))
    .filter((c) => c.eleves.length > 0)
})

const selectedClasseEleves = computed(() => {
  if (!selectedClasseId.value) return []
  return eleves.value.filter((e) => String(e.id_classe) === String(selectedClasseId.value))
})

const currentEleve = computed(() => {
  return selectedClasseEleves.value[currentEleveIndex.value] || null
})

const maxSpecialites = computed(() => {
  const level = getSchoolLevel()
  if (level === 'premiere') return 3
  if (level === 'terminale') return 2
  return 0
})

const selectedSpecialitesCount = computed(() => {
  return currentEleveForm.value.specialites.length
})

const specialitesOptions = computed(() => {
  const max = maxSpecialites.value
  const selected = currentEleveForm.value.specialites

  const limitReached = selected.length >= max

  return specialites.value.map((s) => {
    const id = String(s.id_specialite)
    const isSelected = selected.includes(id)

    return {
      label: s.nom_specialite,
      value: id,
      disabled: limitReached && !isSelected,
    }
  })
})

// Sécurité : Si la classe actuellement sélectionnée devient vide (suite à la promotion),
// elle sort de "classesWithEleves". On remet alors selectedClasseId à null.
watch(classesWithEleves, (newClasses) => {
  if (selectedClasseId.value) {
    const stillExists = newClasses.some(
      (c) => String(c.id_classe) === String(selectedClasseId.value),
    )
    if (!stillExists) {
      selectedClasseId.value = null
    }
  }
})

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null

    // Load data
    classes.value = (await api.getClasses()) as any
    specialites.value = (await api.getSpecialites()) as any
    options.value = (await api.getOptions()) as any

    // Load eleves
    eleves.value = (await api.getAllEleves()) as any
  } catch (err) {
    error.value = 'Erreur lors du chargement'
    console.error('Erreur:', err)
  } finally {
    isLoading.value = false
  }
})

function selectClasse(classeId: string | null) {
  selectedClasseId.value = classeId
  currentEleveIndex.value = 0
  if (currentEleve.value) {
    loadEleveForm(currentEleve.value)
  }
}

function onGeneratePassword() {
  const pwd = generateSecurePassword()
  currentEleveForm.value.password = pwd
}

function exportXLSX() {
  const data = importResults.value.map((e) => ({
    Nom: e.nom,
    Prenom: e.prenom,
    Email: e.email,
    Login: e.login,
    'Mot de passe': e.password,
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Eleves Importes')
  XLSX.writeFile(workbook, 'eleves_importes.xlsx')
}

function exportCSV() {
  const data = importResults.value.map((e) => ({
    Nom: e.nom,
    Prenom: e.prenom,
    Email: e.email,
    Login: e.login,
    'Mot de passe': e.password,
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = '\uFEFF' + XLSX.utils.sheet_to_csv(worksheet)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'eleves_importes.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function selectEleve(index: number) {
  currentEleveIndex.value = index
  const eleve = selectedClasseEleves.value[index]
  if (eleve) {
    loadEleveForm(eleve)
  }
}

async function testPromotion() {
  const confirm = window.confirm('Test promotion : les terminales seront supprimées. Continuer ?')

  if (!confirm) return

  try {
    isTesting.value = true

    const res = await api.post('/api/profile/test-promotion')

    console.log(res)
    message.success('Test promotion terminé')

    // reload élèves
    eleves.value = (await api.getAllEleves()) as any

    if (selectedClasseId.value) selectClasse(selectedClasseId.value)
  } catch (err) {
    message.error('Erreur test promotion')
  } finally {
    isTesting.value = false
  }
}

function triggerImportFilePicker(download: boolean) {
  importDownloadMode.value = download
  importFileInput.value?.click()
}

async function handleImportFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
    message.error('Veuillez sélectionner un fichier .xlsx ou .xls')
    input.value = ''
    return
  }

  try {
    isImporting.value = true
    const formData = new FormData()
    formData.append('fichier', file)

    if (importDownloadMode.value) {
      await api.importElevesAndDownload(formData)
      message.success('Import terminé et fichier téléchargé')
      eleves.value = (await api.getAllEleves()) as any
      if (selectedClasseId.value) selectClasse(selectedClasseId.value)
    } else {
      const result = (await api.importEleves(formData)) as any
      message.success(`Import terminé: ${result.crees ?? 0} élève(s) créé(s)`)
      importResults.value = result.details ?? []
      importErrors.value = result.erreurs_details ?? []
      showImportResultModal.value = true
      eleves.value = (await api.getAllEleves()) as any
      if (selectedClasseId.value) selectClasse(selectedClasseId.value)
    }
  } catch (err: any) {
    message.error(err.message || "Erreur lors de l'import")
  } finally {
    isImporting.value = false
    input.value = ''
    importDownloadMode.value = false
  }
}

function loadEleveForm(eleve: Eleve) {
  currentEleveForm.value = {
    nom: eleve.nom,
    prenom: eleve.prenom,
    email: eleve.email,
    password: '',
    id_classe: eleve.id_classe ? String(eleve.id_classe) : null,
    annee: eleve.annee || '',
    specialites: (eleve.specialites || []).map((s: any) => String(s.id_specialite || s)),
    options: (eleve.options || []).map((o: any) => String(o.id_option || o)),
  }
  specialitesError.value = null
}

async function createNewEleve() {
  isCreatingNew.value = true
  await generateSecurePassword()
  const now = new Date()
  const year = now.getFullYear()
  const nextYear = year + 1
  const anneeDefault = `${year}-${nextYear}`

  currentEleveForm.value = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    id_classe: selectedClasseId.value,
    annee: anneeDefault,
    specialites: [],
    options: [],
  }
  specialitesError.value = null
}

function getSchoolLevel(): 'college' | 'seconde' | 'premiere' | 'terminale' | null {
  if (!currentEleveForm.value.id_classe) return null

  const selectedClass = classes.value.find(
    (c) => String(c.id_classe) === String(currentEleveForm.value.id_classe),
  )
  if (!selectedClass) return null

  const levelName = selectedClass.nom_classe.toLowerCase()

  if (
    levelName.includes('6ème') ||
    levelName.includes('5ème') ||
    levelName.includes('4ème') ||
    levelName.includes('3ème')
  ) {
    return 'college'
  }

  if (levelName.includes('seconde')) {
    return 'seconde'
  }

  if (levelName.includes('première') || levelName.includes('1ère')) {
    return 'premiere'
  }

  if (levelName.includes('terminale') || levelName.includes('tale')) {
    return 'terminale'
  }

  return null
}

function shouldShowSpecialites(): boolean {
  const level = getSchoolLevel()
  return level === 'premiere' || level === 'terminale'
}

async function saveEleve() {
  try {
    isSaving.value = true
    error.value = null
    specialitesError.value = null

    if (shouldShowSpecialites()) {
      const level = getSchoolLevel()
      const requiredCount = level === 'premiere' ? 3 : 2
      const currentCount = currentEleveForm.value.specialites.length

      if (currentCount !== requiredCount) {
        specialitesError.value = `Vous devez sélectionner exactement ${requiredCount} spécialité(s). Actuellement: ${currentCount}.`
        isSaving.value = false
        return
      }
    }

    const generateEmail = (nom: string, prenom: string) => {
      return (
        `${nom}.${prenom}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z.]/g, '') + '@cs-saintpierrecalais.fr'
      )
    }
    if (isCreatingNew.value) {
      await api.createUser({
        nom: currentEleveForm.value.nom,
        prenom: currentEleveForm.value.prenom,
        email: generateEmail(currentEleveForm.value.nom, currentEleveForm.value.prenom),
        password: currentEleveForm.value.password,
        id_classe: currentEleveForm.value.id_classe,
        annee: currentEleveForm.value.annee,
        specialites: currentEleveForm.value.specialites,
        options: currentEleveForm.value.options,
        ...(currentEleveForm.value.password ? { password: currentEleveForm.value.password } : {}),
        role: 'eleve',
      })

      eleves.value = (await api.getAllEleves()) as any
      isCreatingNew.value = false

      if (selectedClasseId.value) {
        selectClasse(selectedClasseId.value)
      }
    } else {
      await api.updateUser(currentEleve.value!.id_user, {
        nom: currentEleveForm.value.nom,
        prenom: currentEleveForm.value.prenom,
        email: generateEmail(currentEleveForm.value.nom, currentEleveForm.value.prenom),
        password: currentEleveForm.value.password,
        id_classe: currentEleveForm.value.id_classe,
        annee: currentEleveForm.value.annee,
        specialites: currentEleveForm.value.specialites,
        options: currentEleveForm.value.options,
      })

      const savedEleveId = currentEleve.value!.id_user
      eleves.value = (await api.getAllEleves()) as any

      const newIndex = selectedClasseEleves.value.findIndex(
        (e) => String(e.id_user) === String(savedEleveId),
      )

      if (newIndex !== -1) {
        currentEleveIndex.value = newIndex
        const eleve = selectedClasseEleves.value[newIndex]
        if (eleve) {
          loadEleveForm(eleve)
        }
      } else {
        if (selectedClasseEleves.value.length > 0) {
          currentEleveIndex.value = Math.min(
            currentEleveIndex.value,
            selectedClasseEleves.value.length - 1,
          )

          const eleve = selectedClasseEleves.value[currentEleveIndex.value]
          if (eleve) {
            loadEleveForm(eleve)
          }
        }
      }
    }
  } catch (err) {
    error.value = 'Erreur lors de la sauvegarde'
    console.error('Erreur:', err)
  } finally {
    isSaving.value = false
  }
}

function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const specialChars = '!@#$%^&*()-_=+[]{}?:;'
  const allChars = lowercase + uppercase + digits + specialChars

  const cryptoObj: Crypto | undefined =
    typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto

  const getRandomChar = (pool: string): string => {
    // Changement ici : on teste directement l'objet, TS comprend qu'il n'est plus undefined
    if (cryptoObj) {
      const randomBuffer = new Uint32Array(1)
      cryptoObj.getRandomValues(randomBuffer)
      return pool[randomBuffer[0]! % pool.length]!
    }
    return pool[Math.floor(Math.random() * pool.length)]!
  }

  const passwordArr: string[] = []
  passwordArr.push(getRandomChar(lowercase))
  passwordArr.push(getRandomChar(uppercase))
  passwordArr.push(getRandomChar(digits))
  passwordArr.push(getRandomChar(digits))
  passwordArr.push(getRandomChar(specialChars))
  passwordArr.push(getRandomChar(specialChars))

  while (passwordArr.length < 12) {
    passwordArr.push(getRandomChar(allChars))
  }

  // Mélange de Fisher-Yates
  for (let i = passwordArr.length - 1; i > 0; i--) {
    let j = 0
    // Changement ici aussi
    if (cryptoObj) {
      const randomBuffer = new Uint32Array(1)
      cryptoObj.getRandomValues(randomBuffer)
      j = randomBuffer[0]! % (i + 1)
    } else {
      j = Math.floor(Math.random() * (i + 1))
    }

    const temp = passwordArr[i]!
    passwordArr[i] = passwordArr[j]!
    passwordArr[j] = temp
  }

  return passwordArr.join('')
}

function cancelEdit() {
  if (isCreatingNew.value) {
    isCreatingNew.value = false
  } else if (currentEleve.value) {
    loadEleveForm(currentEleve.value)
  }
}

async function deleteEleve() {
  if (!currentEleve.value) return

  const confirmed = window.confirm(
    `Êtes-vous sûr de vouloir supprimer ${currentEleve.value.prenom} ${currentEleve.value.nom}? Cette action est irréversible.`,
  )

  if (!confirmed) return

  try {
    isSaving.value = true
    error.value = null

    await api.deleteUser(currentEleve.value.id_user)
    eleves.value = (await api.getAllEleves()) as any

    selectedClasseId.value = null
    isCreatingNew.value = false

    message.success('Élève supprimé avec succès', {
      duration: 3000,
    })
  } catch (err) {
    error.value = 'Erreur lors du suppression'
    console.error('Erreur:', err)

    message.error("Erreur lors de la suppression de l'élève", {
      duration: 3000,
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* Conserver tes styles d'origine intacts */
.gestion-layout {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hidden-file-input {
  display: none;
}

.import-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-warning {
  margin-bottom: 0;
}

.import-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.import-table-header,
.import-table-row {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: 12px;
  align-items: center;
}

.import-table-header {
  font-weight: 700;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.import-table-row {
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.import-password {
  font-family: monospace;
  font-weight: 700;
  color: #205781;
}

.password-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.password-input-wrapper {
  position: relative;
  flex: 1;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.password-icon {
  width: 20px;
  height: 20px;
}

:deep(.n-input input) {
  padding-right: 70px;
}

.gestion-header {
  background: transparent;
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  box-shadow: none;
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

.gestion-content {
  padding: 0 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.gestion-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.classe-selector-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.classe-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.classe-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.classe-selector label {
  font-weight: 600;
  color: #205781;
}

.eleves-section {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: start;
}

.eleves-section.full-width {
  grid-template-columns: 1fr;
}

.eleves-list-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.eleves-list-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.eleves-list-header h3 {
  margin: 0;
  color: #205781;
  font-size: 16px;
}

.eleves-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 600px;
  overflow-y: auto;
}

.eleve-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  background: #f9f9f9;
}

.eleve-item:hover {
  background: #f0f5fa;
}

.eleve-item.active {
  background: #e8f1f8;
  border-color: #205781;
}

.eleve-name {
  font-weight: 600;
  color: #205781;
  font-size: 14px;
}

.eleve-email {
  font-size: 12px;
  color: #817f7f;
  margin-top: 4px;
}

.eleve-form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-header h3 {
  margin: 0;
  color: #205781;
  font-size: 20px;
}

.form-header p {
  margin: 4px 0 0 0;
  color: #817f7f;
  font-size: 13px;
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
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

.empty-state {
  margin-top: 40px;
}

.gestion-link {
  text-decoration: none;
}
</style>
