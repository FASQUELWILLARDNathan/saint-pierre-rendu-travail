<template>
  <div class="gestion-layout">
    <Sidebar />

    <div class="main-wrapper">
      <header class="gestion-header">
        <div class="header-title">
          <h1>Gestion des professeurs</h1>
          <p>Triés par matière</p>
        </div>
        <div class="header-actions">
          <input
            ref="importFileInput"
            type="file"
            accept=".xlsx,.xls"
            class="hidden-file-input"
            @change="handleImportFileChange"
          />
          <n-button secondary @click="triggerImportFilePicker" :loading="isImporting">
            Importer un fichier
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
          <n-card class="matiere-selector-card">
            <div class="matiere-selector-header">
              <label>Sélectionnez une matière :</label>
              <n-button type="primary" @click="createNewProf" size="small"> + Ajouter </n-button>
            </div>
            <div class="matiere-selector">
              <n-select
                v-model:value="selectedMatiereId"
                :options="
                  matieresWithProfs.map((m) => ({
                    label: `${m.nom_matiere} (${m.profs.length} prof${m.profs.length > 1 ? 's' : ''})`,
                    value: m.nom_matiere,
                  }))
                "
                clearable
                placeholder="Sélectionnez une matière"
                @update:value="selectMatiere"
              />
            </div>
          </n-card>

          <div
            v-if="selectedMatiereProfs.length > 0 || isCreatingNew"
            class="profs-section"
            :class="{ 'full-width': selectedMatiereProfs.length === 0 }"
          >
            <n-card v-if="selectedMatiereProfs.length > 0" class="profs-list-card">
              <div class="profs-list-header">
                <h3>Professeurs ({{ selectedMatiereProfs.length }})</h3>
              </div>

              <div class="profs-grid">
                <div
                  v-for="(prof, index) in selectedMatiereProfs"
                  :key="prof.id_user"
                  class="prof-item"
                  :class="{ active: currentProfIndex === index }"
                  @click="selectProf(index)"
                >
                  <div class="prof-name">{{ prof.prenom }} {{ prof.nom }}</div>
                  <div class="prof-email">{{ prof.email }}</div>
                </div>
              </div>
            </n-card>

            <n-card v-if="currentProf || isCreatingNew" class="prof-form-card">
              <div class="form-header">
                <div>
                  <h3 v-if="isCreatingNew">Nouveau professeur</h3>
                  <h3 v-else>{{ currentProf?.prenom }} {{ currentProf?.nom }}</h3>
                  <p v-if="!isCreatingNew">
                    {{ currentProfIndex + 1 }} / {{ selectedMatiereProfs.length }}
                  </p>
                </div>

                <div v-if="!isCreatingNew" class="nav-buttons">
                  <n-button
                    v-if="currentProfIndex > 0"
                    @click="selectProf(currentProfIndex - 1)"
                    type="primary"
                    quaternary
                  >
                    ← Précédent
                  </n-button>
                  <n-button
                    v-if="currentProfIndex < selectedMatiereProfs.length - 1"
                    @click="selectProf(currentProfIndex + 1)"
                    type="primary"
                    quaternary
                  >
                    Suivant →
                  </n-button>
                </div>
              </div>

              <n-divider />

              <n-form :model="currentProfForm">
                <n-form-item label="Nom">
                  <n-input v-model:value="currentProfForm.nom" />
                </n-form-item>

                <n-form-item label="Prénom">
                  <n-input v-model:value="currentProfForm.prenom" />
                </n-form-item>

                <n-form-item label="Mot de passe">
                  <div class="password-container">
                    <div class="password-input-wrapper">
                      <n-input
                        v-model:value="currentProfForm.password"
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
                    <n-button @click="onGeneratePassword" secondary>Générer</n-button>
                  </div>
                </n-form-item>
              </n-form>

              <n-divider />

              <div class="form-actions">
                <n-button type="primary" @click="saveProf" :loading="isSaving">
                  {{ isCreatingNew ? 'Créer le professeur' : 'Enregistrer' }}
                </n-button>
                <n-button quaternary @click="cancelEdit">Annuler</n-button>
                <n-button
                  v-if="!isCreatingNew"
                  type="error"
                  @click="deleteProf"
                  :loading="isSaving"
                >
                  Supprimer
                </n-button>
              </div>
            </n-card>
          </div>

          <n-empty
            v-else
            description="Sélectionnez une matière pour voir les professeurs"
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
              <span>Professeur</span>
              <span>Login</span>
              <span>Mot de passe</span>
              <span>Matière</span>
            </div>
            <div
              v-for="item in importResults"
              :key="`${item.login}-${item.email}`"
              class="import-table-row"
            >
              <span>{{ item.prenom }} {{ item.nom }}</span>
              <span>{{ item.login }}</span>
              <span class="import-password">{{ item.password }}</span>
              <span>{{ item.matiere }}</span>
            </div>
          </div>

          <n-empty v-else description="Aucun professeur créé" />
        </div>

        <div class="import-actions">
          <n-button @click="exportCSV" secondary>Export CSV</n-button>
          <n-button @click="exportXLSX" type="primary" secondary>Export XLSX</n-button>
        </div>
      </n-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'
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
import Sidebar from '@/components/home/Sidebar.vue'

interface Matiere {
  id_matiere: string | number
  nom_matiere: string
}

interface MatiereWithProfs {
  id_matiere: string | number
  nom_matiere: string
  profs: Prof[]
}

interface Prof {
  id_user: string | number
  nom: string
  prenom: string
  email: string
  login: string
  matiere: string | null
}

const api = useApi()
const message = useMessage()

const isLoading = ref(true)
const isSaving = ref(false)
const isImporting = ref(false)
const error = ref<string | null>(null)
const showImportResultModal = ref(false)
const importResults = ref<any[]>([])
const importErrors = ref<any[]>([])
const showPassword = ref(false)

const matieres = ref<Matiere[]>([])
const profs = ref<Prof[]>([])

const selectedMatiereId = ref<string | null>(null)
const currentProfIndex = ref(0)
const isCreatingNew = ref(false)
const importFileInput = ref<HTMLInputElement | null>(null)

const currentProfForm = ref({
  nom: '',
  prenom: '',
  password: '',
  id_matiere: null as string | null,
})

// Computed
const matieresWithProfs = computed(() => {
  const map = new Map<string, Prof[]>()
  for (const p of profs.value) {
    const key = p.matiere ?? 'Sans matière'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries())
    .map(([nom_matiere, profsInMatiere]) => ({ nom_matiere, profs: profsInMatiere }))
    .sort((a, b) => a.nom_matiere.localeCompare(b.nom_matiere))
})

const selectedMatiereProfs = computed(() => {
  if (!selectedMatiereId.value) return []
  return profs.value.filter((p) => (p.matiere ?? 'Sans matière') === selectedMatiereId.value)
})

const currentProf = computed(() => {
  return selectedMatiereProfs.value[currentProfIndex.value] || null
})

// Si la matière sélectionnée devient vide, on la désélectionne
watch(matieresWithProfs, (newMatieres) => {
  if (selectedMatiereId.value) {
    const stillExists = newMatieres.some(
      (m) => String(m.nom_matiere) === String(selectedMatiereId.value),
    )
    if (!stillExists) {
      selectedMatiereId.value = null
    }
  }
})

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    matieres.value = (await api.getMatieres()) as any
    profs.value = (await api.getAllProfs()) as any
  } catch (err) {
    error.value = 'Erreur lors du chargement'
    console.error('Erreur:', err)
  } finally {
    isLoading.value = false
  }
})

function selectMatiere(matiereId: string | null) {
  selectedMatiereId.value = matiereId
  currentProfIndex.value = 0
  if (currentProf.value) {
    loadProfForm(currentProf.value)
  }
}

function selectProf(index: number) {
  currentProfIndex.value = index
  const prof = selectedMatiereProfs.value[index]
  if (prof) loadProfForm(prof)
}

function loadProfForm(prof: Prof) {
  currentProfForm.value = {
    nom: prof.nom,
    prenom: prof.prenom,
    password: '',
    id_matiere: prof.matiere,
  }
}

function onGeneratePassword() {
  currentProfForm.value.password = generateSecurePassword()
}

function createNewProf() {
  isCreatingNew.value = true
  currentProfForm.value = {
    nom: '',
    prenom: '',
    password: generateSecurePassword(),
    id_matiere: selectedMatiereId.value,
  }
}

function cancelEdit() {
  if (isCreatingNew.value) {
    isCreatingNew.value = false
  } else if (currentProf.value) {
    loadProfForm(currentProf.value)
  }
}

function triggerImportFilePicker() {
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

    const result = (await api.importProfs(formData)) as any
    message.success(`Import terminé : ${result.crees ?? 0} professeur(s) créé(s)`)
    importResults.value = result.details ?? []
    importErrors.value = result.erreurs_details ?? []
    showImportResultModal.value = true
    profs.value = (await api.getAllProfs()) as any
    if (selectedMatiereId.value) selectMatiere(selectedMatiereId.value)
  } catch (err: any) {
    message.error(err.message || "Erreur lors de l'import")
  } finally {
    isImporting.value = false
    input.value = ''
  }
}

async function saveProf() {
  try {
    isSaving.value = true
    error.value = null

    const generateEmail = (nom: string, prenom: string) =>
      `${nom}.${prenom}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z.]/g, '') + '@cs-saintpierrecalais.fr'

    const generateLogin = (nom: string, prenom: string) =>
      `${nom}.${prenom}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z.]/g, '')

    if (isCreatingNew.value) {
      await api.createUser({
        nom: currentProfForm.value.nom,
        prenom: currentProfForm.value.prenom,
        email: generateEmail(currentProfForm.value.nom, currentProfForm.value.prenom),
        login: generateLogin(currentProfForm.value.nom, currentProfForm.value.prenom),
        password: currentProfForm.value.password,
        id_matiere: currentProfForm.value.id_matiere,
        role: 'professeur',
      })

      profs.value = (await api.getAllProfs()) as any
      isCreatingNew.value = false
      if (selectedMatiereId.value) selectMatiere(selectedMatiereId.value)
    } else {
      await api.updateUser(currentProf.value!.id_user, {
        nom: currentProfForm.value.nom,
        prenom: currentProfForm.value.prenom,
        email: generateEmail(currentProfForm.value.nom, currentProfForm.value.prenom),
        login: generateLogin(currentProfForm.value.nom, currentProfForm.value.prenom),
        password: currentProfForm.value.password,
        id_matiere: currentProfForm.value.id_matiere,
      })

      const savedProfId = currentProf.value!.id_user
      profs.value = (await api.getAllProfs()) as any

      const newIndex = selectedMatiereProfs.value.findIndex(
        (p) => String(p.id_user) === String(savedProfId),
      )
      if (newIndex !== -1) {
        currentProfIndex.value = newIndex
        const prof = selectedMatiereProfs.value[newIndex]
        if (prof) loadProfForm(prof)
      } else if (selectedMatiereProfs.value.length > 0) {
        currentProfIndex.value = Math.min(
          currentProfIndex.value,
          selectedMatiereProfs.value.length - 1,
        )
        const prof = selectedMatiereProfs.value[currentProfIndex.value]
        if (prof) loadProfForm(prof)
      }
    }

    message.success(isCreatingNew.value ? 'Professeur créé' : 'Modifications enregistrées')
  } catch (err) {
    error.value = 'Erreur lors de la sauvegarde'
    console.error('Erreur:', err)
  } finally {
    isSaving.value = false
  }
}

async function deleteProf() {
  if (!currentProf.value) return

  const confirmed = window.confirm(
    `Êtes-vous sûr de vouloir supprimer ${currentProf.value.prenom} ${currentProf.value.nom} ? Cette action est irréversible.`,
  )
  if (!confirmed) return

  try {
    isSaving.value = true
    error.value = null

    await api.deleteUser(currentProf.value.id_user)
    profs.value = (await api.getAllProfs()) as any

    selectedMatiereId.value = null
    isCreatingNew.value = false

    message.success('Professeur supprimé avec succès', { duration: 3000 })
  } catch (err) {
    error.value = 'Erreur lors de la suppression'
    message.error('Erreur lors de la suppression du professeur', { duration: 3000 })
  } finally {
    isSaving.value = false
  }
}

function exportXLSX() {
  const data = importResults.value.map((e) => ({
    Nom: e.nom,
    Prenom: e.prenom,
    Email: e.email,
    Login: e.login,
    'Mot de passe': e.password,
    Matière: e.matiere,
  }))
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Profs Importés')
  XLSX.writeFile(workbook, 'profs_importes.xlsx')
}

function exportCSV() {
  const data = importResults.value.map((e) => ({
    Nom: e.nom,
    Prenom: e.prenom,
    Email: e.email,
    Login: e.login,
    'Mot de passe': e.password,
    Matière: e.matiere,
  }))
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = '\uFEFF' + XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'profs_importes.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
    if (cryptoObj) {
      const buf = new Uint32Array(1)
      cryptoObj.getRandomValues(buf)
      return pool[buf[0]! % pool.length]!
    }
    return pool[Math.floor(Math.random() * pool.length)]!
  }

  const arr: string[] = []
  arr.push(getRandomChar(lowercase))
  arr.push(getRandomChar(uppercase))
  arr.push(getRandomChar(digits))
  arr.push(getRandomChar(digits))
  arr.push(getRandomChar(specialChars))
  arr.push(getRandomChar(specialChars))
  while (arr.length < 12) arr.push(getRandomChar(allChars))

  for (let i = arr.length - 1; i > 0; i--) {
    let j = 0
    if (cryptoObj) {
      const buf = new Uint32Array(1)
      cryptoObj.getRandomValues(buf)
      j = buf[0]! % (i + 1)
    } else {
      j = Math.floor(Math.random() * (i + 1))
    }
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
  }
  return arr.join('')
}
</script>

<style scoped>
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

.matiere-selector-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.matiere-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.matiere-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.matiere-selector label {
  font-weight: 600;
  color: #205781;
}

.profs-section {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: start;
}

.profs-section.full-width {
  grid-template-columns: 1fr;
}

.profs-list-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.profs-list-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profs-list-header h3 {
  margin: 0;
  color: #205781;
  font-size: 16px;
}

.profs-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 600px;
  overflow-y: auto;
}

.prof-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  background: #f9f9f9;
}

.prof-item:hover {
  background: #f0f5fa;
}

.prof-item.active {
  background: #e8f1f8;
  border-color: #205781;
}

.prof-name {
  font-weight: 600;
  color: #205781;
  font-size: 14px;
}

.prof-email {
  font-size: 12px;
  color: #817f7f;
  margin-top: 4px;
}

.prof-form-card {
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

.empty-state {
  margin-top: 40px;
}

.import-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
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
  grid-template-columns: 1.3fr 1fr 1fr 1fr;
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

.import-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

:deep(.n-modal-mask) {
  display: flex !important;
  align-items: center;
  justify-content: center;
}

:deep(.n-modal) {
  max-width: 750px !important;
  width: 90% !important;
}

:deep(.n-modal-body) {
  max-height: 500px !important;
  overflow-y: auto;
}

:deep(.n-card) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
