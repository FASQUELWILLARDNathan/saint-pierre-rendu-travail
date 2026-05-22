<template>
  <div class="cours-layout">
    <Sidebar />

    <div class="main-wrapper">
      <header class="cours-header">
        <div class="header-title">
          <h1>Mes cours</h1>
          <p>Retrouvez tous vos cours par matière</p>
        </div>
        <n-button v-if="authStore.user?.role === 'professeur'" type="primary" @click="showCreateModal = true">
          + Créer un cours
        </n-button>
      </header>

      <main class="cours-content">
        <n-spin v-if="isLoading">
          <template #description>Chargement...</template>
        </n-spin>

        <n-alert v-else-if="error" type="error">{{ error }}</n-alert>

        <div v-else>
            <n-empty v-if="cours.length === 0" description="Aucun cours disponible" />

            <div v-else class="cours-sections">
                <div
                    v-for="group in coursParCategorie"
                    :key="group.categorie "
                    class="matiere-section"
                >
                    <div class="matiere-header">
                    <h2>{{ group.categorie }}</h2>
                    <span class="matiere-count">
                        {{ group.cours.length }} cours
                    </span>
                    </div>

                    <div class="cours-grid">
                    <div
                        v-for="c in group.cours"
                        :key="c.id_cours"
                        class="cours-card"
                        @click="openCours(c)"
                    >
                        <div
                        class="cours-card-header"
                        :style="{ backgroundColor: getColor(c.matiere?.couleur) }"
                        >
                        <img
                            v-if="c.matiere?.icon_url"
                            :src="c.matiere.icon_url"
                            :alt="c.matiere.nom_matiere"
                            class="cours-icon"
                        />
                        <span v-else>📖</span>
                        </div>

                        <div class="cours-card-body">
                        <p class="cours-matiere">
                            {{ c.matiere?.nom_matiere }}
                        </p>

                        <h3 class="cours-titre">
                            {{ c.nom_cours }}
                        </h3>

                        <p class="cours-desc">
                            {{ c.description_cours ?? 'Pas de description' }}
                        </p>

                        <p class="cours-classe" v-if="c.classe">
                            📚 {{ c.classe.nom_classe }}
                        </p>

                        <p class="cours-prof">
                            👤 {{ c.professeur?.user?.prenom }}
                            {{ c.professeur?.user?.nom }}
                        </p>

                        <div
                            class="cours-ressources"
                            v-if="c.ressources?.length > 0"
                        >
                            <span class="ressource-badge">
                            📎 {{ c.ressources.length }} fichier(s)
                            </span>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
        </div>
      </main>
    </div>

    <!-- Modal création cours -->
    <n-modal v-model:show="showCreateModal" preset="card" title="Créer un cours" style="max-width: 600px">
      <n-form :model="form">
        <n-form-item label="Nom du cours">
          <n-input v-model:value="form.nom_cours" placeholder="Ex: Chapitre 3 - Les fonctions" />
        </n-form-item>

        <n-form-item label="Description">
          <n-input
            v-model:value="form.description_cours"
            type="textarea"
            placeholder="Description du cours..."
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="Matière">
          <n-select
            v-model:value="form.id_matiere"
            :options="matieresOptions"
            placeholder="Sélectionnez une matière"
          />
        </n-form-item>

        <n-form-item label="Spécialité">
            <n-select
                v-model:value="form.id_specialite"
                :options="specialitesOptions"
                placeholder="Sélectionnez une spécialité"
                clearable
            />
            </n-form-item>

            <n-form-item label="Option">
            <n-select
                v-model:value="form.id_option"
                :options="optionsOptions"
                placeholder="Sélectionnez une option"
                clearable
            />
            </n-form-item>

        <n-form-item label="Classe">
          <n-select
            v-model:value="form.id_classe"
            :options="classesOptions"
            placeholder="Sélectionnez une classe"
            clearable
          />
        </n-form-item>

        <n-form-item label="Fichiers (PDF, images, etc.)">
          <div class="upload-zone" @dragover.prevent @drop.prevent="handleDrop">
            <input ref="fileInput" type="file" multiple @change="handleFileChange" style="display:none" />
            <div class="upload-placeholder" @click="fileInput?.click()">
              <span>📎 Cliquez ou glissez vos fichiers ici</span>
              <span class="upload-hint">PDF, images, documents...</span>
            </div>
            <div v-if="form.fichiers.length > 0" class="fichiers-list">
              <div v-for="(f, i) in form.fichiers" :key="i" class="fichier-item">
                <span>{{ getFileIcon(f.type) }} {{ f.name }}</span>
                <span class="fichier-size">{{ formatSize(f.size) }}</span>
                <button class="fichier-remove" @click="removeFile(i)">✕</button>
              </div>
            </div>
          </div>
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="modal-actions">
          <n-button type="primary" @click="createCours" :loading="isSaving">Créer</n-button>
          <n-button quaternary @click="showCreateModal = false">Annuler</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Modal détail cours -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="selectedCours?.nom_cours"
      style="max-width: 700px"
    >
      <div v-if="selectedCours" class="cours-detail">
        <div class="detail-meta">
          <span class="meta-badge">{{ selectedCours.matiere?.nom_matiere }}</span>
          <span class="meta-badge" v-if="selectedCours.classe">{{ selectedCours.classe.nom_classe }}</span>
          <span class="meta-badge">
            👤 {{ selectedCours.professeur?.user?.prenom }} {{ selectedCours.professeur?.user?.nom }}
          </span>
        </div>

        <p class="detail-desc">{{ selectedCours.description_cours ?? 'Pas de description' }}</p>

        <div v-if="selectedCours.ressources?.length > 0" class="detail-ressources">
          <h4>Fichiers du cours</h4>
          <div class="ressources-list">
            <a
              v-for="ressource in selectedCours.ressources"
              :key="ressource.id_ressource"
              :href="`${apiBase}${ressource.chemin_fichier}`"
              target="_blank"
              class="ressource-item"
            >
              <span>{{ getFileIcon(ressource.type_fichier) }}</span>
              <div class="ressource-info">
                <span class="ressource-nom">{{ ressource.nom_fichier }}</span>
                <span class="ressource-size">{{ formatSize(Number(ressource.taille_octets)) }}</span>
              </div>
              <span class="ressource-dl">⬇</span>
            </a>
          </div>
        </div>

        <n-empty v-else description="Aucun fichier joint" />
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NButton, NModal, NForm, NFormItem, NInput, NSelect, NSpin, NAlert, NEmpty } from 'naive-ui'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth.store'
import Sidebar from '@/components/home/Sidebar.vue'
import { useRoute, useRouter } from 'vue-router'

const api = useApi()
const authStore = useAuthStore()
const apiBase = import.meta.env.VITE_API_URL

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedCours = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const cours = ref<any[]>([])
const matieres = ref<any[]>([])
const specialites = ref<any[]>([])
const options = ref<any[]>([])
const classes = ref<any[]>([])
const route = useRoute()

const form = ref({
  nom_cours: '',
  description_cours: '',
  id_matiere: null as string | null,
  id_specialite: null as string | null,
  id_option: null as string | null,
  id_classe: null as string | null,
  fichiers: [] as File[],
})

const matieresOptions = computed(() =>
  matieres.value.map((m) => ({ label: m.nom_matiere, value: String(m.id_matiere) }))
)

const filterType = computed(() => route.query.type as string | undefined)
const filterValue = computed(() => route.query.value as string | undefined)

const classesOptions = computed(() => {
  const user = authStore.user
  if (user?.role === 'professeur') {
    return (user.professeur?.classes_enseignees ?? []).map((c: any) => ({
      label: c.classe.nom_classe,
      value: String(c.classe.id_classe),
    }))
  }
  return classes.value.map((c) => ({ label: c.nom_classe, value: String(c.id_classe) }))
})

const specialitesOptions = computed(() =>
  specialites.value.map((s) => ({
    label: s.nom_specialite,
    value: String(s.id_specialite),
  }))
)

const optionsOptions = computed(() =>
  options.value.map((o) => ({
    label: o.nom_option,
    value: String(o.id_option),
  }))
)

const coursParCategorie = computed(() => {
  const grouped = new Map<string, any[]>()

  cours.value.forEach((c) => {

    if (filterType.value && filterValue.value) {
      if (filterType.value === 'matiere' && c.matiere?.nom_matiere !== filterValue.value) return
      if (filterType.value === 'specialite' && c.specialite?.nom_specialite !== filterValue.value) return
      if (filterType.value === 'option' && c.option?.nom_option !== filterValue.value) return
    }

    let key = 'Autre'

    if (c.matiere) key = `Matière - ${c.matiere.nom_matiere}`
    else if (c.specialite) key = `Spécialité - ${c.specialite.nom_specialite}`
    else if (c.option) key = `Option - ${c.option.nom_option}`

    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(c)
  })

  return Array.from(grouped.entries()).map(([categorie, cours]) => ({
    categorie,
    cours,
  }))
})

onMounted(async () => {
  try {
    isLoading.value = true
    const [coursData, matieresData, classesData, specData, optData] = await Promise.all([
      api.getCours() as any,
      api.getAllMatieres() as any,
      api.getClasses() as any,
      api.getSpecialites() as any,
    api.getOptions() as any,
    ])
    cours.value = coursData
    matieres.value = matieresData
    specialites.value = specData
    options.value = optData
    classes.value = classesData
  } catch (err) {
    error.value = 'Erreur lors du chargement'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

function openCours(c: any) {
  selectedCours.value = c
  showDetailModal.value = true
}

function getColor(hex: string | null) {
  if (!hex) return 'rgba(112, 190, 250, 0.2)'
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.2)`
}

function getFileIcon(type: string) {
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('image')) return '🖼️'
  if (type?.includes('video')) return '🎬'
  if (type?.includes('audio')) return '🎵'
  if (type?.includes('zip') || type?.includes('rar')) return '🗜️'
  return '📎'
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    form.value.fichiers.push(...Array.from(input.files))
  }
}

function handleDrop(e: DragEvent) {
  if (e.dataTransfer?.files) {
    form.value.fichiers.push(...Array.from(e.dataTransfer.files))
  }
}

function removeFile(index: number) {
  form.value.fichiers.splice(index, 1)
}

async function createCours() {
  if (!form.value.nom_cours) return

  try {
    isSaving.value = true

    const formData = new FormData()

    formData.append('nom_cours', form.value.nom_cours)
    formData.append('description_cours', form.value.description_cours || '')

    if (form.value.id_matiere)
      formData.append('id_matiere', form.value.id_matiere)

    if (form.value.id_classe)
      formData.append('id_classe', form.value.id_classe)

    if (form.value.id_specialite)
      formData.append('id_specialite', form.value.id_specialite)

    if (form.value.id_option)
      formData.append('id_option', form.value.id_option)

    form.value.fichiers.forEach((f) =>
      formData.append('fichiers', f)
    )

    const nouveau = await api.createCours(formData)

    cours.value.unshift(nouveau)

    showCreateModal.value = false

    form.value = {
      nom_cours: '',
      description_cours: '',
      id_matiere: null,
      id_classe: null,
      id_specialite: null,
      id_option: null,
      fichiers: [],
    }

  } catch (err) {
    console.error(err)
    error.value = 'Erreur lors de la création'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.cours-layout {
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

.cours-header {
  background: transparent;
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
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

.cours-content {
  padding: 0 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.cours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.cours-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.matiere-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.matiere-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
}

.matiere-header h2 {
  margin: 0;
  color: #205781;
  font-size: 22px;
  font-weight: 700;
}

.matiere-count {
  background: rgba(32, 87, 129, 0.1);
  color: #205781;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.cours-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.cours-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.cours-card-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cours-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.cours-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cours-matiere {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #205781;
  margin: 0;
}

.cours-titre {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.cours-desc {
  font-size: 13px;
  color: #817f7f;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cours-classe,
.cours-prof {
  font-size: 12px;
  color: #205781;
  margin: 0;
}

.ressource-badge {
  font-size: 11px;
  background: rgba(32, 87, 129, 0.1);
  color: #205781;
  padding: 2px 8px;
  border-radius: 20px;
}

.upload-zone {
  width: 100%;
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  padding: 16px;
  transition: border-color 0.2s;
}

.upload-zone:hover {
  border-color: #205781;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 16px;
  color: #817f7f;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px;
  color: #b0b0b0;
}

.fichiers-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fichier-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
}

.fichier-size {
  margin-left: auto;
  color: #817f7f;
  font-size: 11px;
}

.fichier-remove {
  background: none;
  border: none;
  color: #d9534f;
  cursor: pointer;
  font-size: 12px;
  padding: 0 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.cours-detail {
  padding: 8px 0;
}

.detail-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.meta-badge {
  background: rgba(32, 87, 129, 0.1);
  color: #205781;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.detail-desc {
  color: #817f7f;
  font-size: 14px;
  margin-bottom: 24px;
}

.detail-ressources h4 {
  font-size: 16px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 12px 0;
}

.ressources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ressource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;
}

.ressource-item:hover {
  background: #eef3f8;
}

.ressource-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ressource-nom {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.ressource-size {
  font-size: 11px;
  color: #817f7f;
}

.ressource-dl {
  color: #205781;
  font-size: 16px;
}

@media (max-width: 1024px) {
  .main-wrapper {
    margin-left: 80px;
  }
  .header-title h1 {
    font-size: 32px;
  }
}

@media (max-width: 767px) {
  .main-wrapper {
    margin-left: 0;
  }
  .cours-header {
    padding: 16px 12px;
    padding-left: 60px;
    flex-wrap: wrap;
  }
  .cours-content {
    padding: 0 12px 24px;
  }
  .cours-grid {
    grid-template-columns: 1fr;
  }
}
</style>