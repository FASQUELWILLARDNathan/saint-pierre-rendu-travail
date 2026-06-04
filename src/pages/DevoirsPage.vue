<template>
  <div class="devoirs-layout">
    <Sidebar />
    <div class="main-wrapper">
      <header class="devoirs-header">
        <div class="header-title">
          <h1>Mes devoirs</h1>
          <p v-if="isProfessor">Devoirs de vos catégories et rendus des élèves</p>
          <p v-else>Travaux à rendre et rendus</p>
        </div>
      </header>

      <main class="devoirs-content">
        <n-spin v-if="isLoading">
          <template #description>Chargement...</template>
        </n-spin>

        <n-alert v-else-if="error" type="error">{{ error }}</n-alert>

        <div v-else class="devoirs-container">
          <!-- Filtres par statut -->
          <div class="filtres-section">
            <div class="filtres-label">Filtrer par statut:</div>
            <div class="filtres">
              <button
                v-for="f in filtres"
                :key="f.key"
                class="filtre-btn"
                :class="{ active: filtreActif === f.key }"
                @click="filtreActif = f.key"
              >
                {{ f.label }}
                <span class="filtre-count">{{ f.count }}</span>
              </button>
            </div>
          </div>

          <!-- Filtres par catégorie -->
          <div class="filtres-section">
            <div class="filtres-label">Filtrer par catégorie:</div>
            <div class="filtres">
              <button
                class="filtre-btn"
                :class="{ active: filtreCategorie === null }"
                @click="filtreCategorie = null"
              >
                Tous
              </button>
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="filtre-btn"
                :class="{
                  active: filtreCategorie?.id === cat.id && filtreCategorie?.type === cat.type,
                }"
                @click="filtreCategorie = cat"
              >
                {{ cat.nom }}
                <span class="filtre-count">{{ getCategoryCount(cat) }}</span>
              </button>
            </div>
          </div>

          <n-empty v-if="devoirsFiltres.length === 0" description="Aucun devoir" />

          <div v-else class="devoirs-list">
            <div
              v-for="devoir in devoirsFiltres"
              :key="devoir.id_devoir"
              class="devoir-card"
              :class="{ rendu: isRendu(devoir), 'en-retard': isEnRetard(devoir) }"
              @click="openDevoir(devoir)"
            >
              <div
                class="devoir-icon"
                :style="{ backgroundColor: getColor(devoir.matiere?.couleur) }"
              >
                <img
                  v-if="devoir.matiere?.devoir_icon_url"
                  :src="devoir.matiere.devoir_icon_url"
                  alt=""
                />
                <span v-else>📝</span>
              </div>

              <div class="devoir-info">
                <div class="devoir-top">
                  <span class="devoir-matiere">{{ devoir.matiere?.nom_matiere }}</span>
                  <span class="devoir-cours">{{ devoir.cours?.nom_cours }}</span>
                </div>
                <h3 class="devoir-titre">{{ devoir.nom_devoir }}</h3>
                <p class="devoir-desc">{{ devoir.description_devoir ?? 'Pas de description' }}</p>
                <div class="devoir-footer">
                  <span class="devoir-date" v-if="devoir.date_limite">
                    📅 {{ formatDate(devoir.date_limite) }}
                  </span>
                  <span class="devoir-coef" v-if="devoir.coefficient">
                    Coef. {{ devoir.coefficient }}
                  </span>
                </div>
              </div>

              <div class="devoir-status">
                <span v-if="isRendu(devoir)" class="status-badge rendu">✓ Rendu</span>
                <span v-else-if="isEnRetard(devoir)" class="status-badge retard">⚠ En retard</span>
                <span v-else class="status-badge a-rendre">À rendre</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal détail devoir -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="selectedDevoir?.nom_devoir"
      :class="isProfessor ? 'devoir-modal-prof' : ''"
      :scrollable="true"
    >
      <div v-if="selectedDevoir" class="devoir-detail">
        <div class="detail-meta">
          <span class="meta-badge">{{ selectedDevoir.matiere?.nom_matiere }}</span>
          <span class="meta-badge" v-if="selectedDevoir.cours">{{
            selectedDevoir.cours.nom_cours
          }}</span>
          <span class="meta-badge" v-if="selectedDevoir.coefficient"
            >Coef. {{ selectedDevoir.coefficient }}</span
          >
        </div>

        <p class="detail-desc">{{ selectedDevoir.description_devoir ?? 'Pas de description' }}</p>

        <p class="detail-date" v-if="selectedDevoir.date_limite">
          📅 Date limite : {{ formatDate(selectedDevoir.date_limite) }}
        </p>

        <!-- Vue professeur : tous les rendus -->
        <div v-if="isProfessor" class="rendu-info">
          <div class="rendu-header">
            <span class="rendu-label">Rendus des élèves</span>
            <span class="rendu-date">{{ selectedDevoir.rendus?.length ?? 0 }} rendu(s)</span>
          </div>
          <n-button type="primary" @click="downloadAllRendus">
            📦 Télécharger tous les rendus
          </n-button>

          <div v-if="selectedDevoir.eleves_non_rendus?.length > 0" class="non-rendus-block">
            <h4>Élèves non rendus</h4>
            <div class="non-rendus-list">
              <span
                v-for="eleve in selectedDevoir.eleves_non_rendus"
                :key="eleve.id_user"
                class="non-rendu-chip"
              >
                {{ eleve.prenom }} {{ eleve.nom }}
              </span>
            </div>
          </div>

          <n-empty
            v-if="!selectedDevoir.rendus || selectedDevoir.rendus.length === 0"
            description="Aucun rendu pour ce devoir"
          />

          <div v-else class="rendus-eleves-list">
            <div
              v-for="rendu in getSortedRendus(selectedDevoir.rendus)"
              :key="rendu.id_rendu"
              class="rendu-eleve-card"
            >
              <div class="rendu-eleve-header">
                <strong> {{ rendu.eleve?.user?.prenom }} {{ rendu.eleve?.user?.nom }} </strong>
                <span class="rendu-date">{{ formatDate(rendu.date_rendu) }}</span>
              </div>

              <div v-if="rendu.note" class="note-display">
                <span class="note-value">{{ rendu.note }}</span>
                <span class="note-label">/ 20</span>
              </div>

              <p v-if="rendu.retour" class="retour-prof">💬 {{ rendu.retour }}</p>

              <div v-if="rendu.pieces_jointes?.length > 0" class="fichiers-rendus">
                <h4>Fichiers rendus</h4>
                <a
                  v-for="pj in rendu.pieces_jointes"
                  :key="pj.id_piece_jointe"
                  :href="`${apiBase}/public${pj.chemin_fichier}`"
                  target="_blank"
                  class="fichier-item-link"
                >
                  <span>{{ getFileIcon(pj.type_fichier) }}</span>
                  <span>{{ pj.nom_fichier }}</span>
                  <span class="fichier-size">{{ formatSize(Number(pj.taille_octets)) }}</span>
                </a>
              </div>

              <div class="review-form">
                <div class="review-field">
                  <label>Note / 20</label>
                  <n-input-number
                    :value="getReviewDraft(rendu).note"
                    @update:value="(value) => updateReviewDraft(rendu, 'note', value)"
                    :min="0"
                    :max="20"
                    :precision="2"
                    placeholder="Note"
                  />
                </div>

                <div class="review-field">
                  <label>Retour</label>
                  <n-input
                    :value="getReviewDraft(rendu).retour"
                    @update:value="(value) => updateReviewDraft(rendu, 'retour', value)"
                    type="textarea"
                    :rows="3"
                    placeholder="Avis sur le travail"
                  />
                </div>

                <n-button
                  type="primary"
                  :loading="reviewSavingId === String(rendu.id_rendu)"
                  @click="saveReview(rendu)"
                >
                  Enregistrer
                </n-button>

                <n-button
                  type="default"
                  :loading="archivingRenduId === String(rendu.id_rendu)"
                  @click="archiveRendu(rendu)"
                  style="margin-left: 8px"
                >
                  📦 Archiver
                </n-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vue élève : rendu personnel -->
        <div v-else-if="isRendu(selectedDevoir)" class="rendu-info">
          <div class="rendu-header">
            <span class="rendu-label">✓ Devoir rendu</span>
            <span class="rendu-date"
              >le {{ formatDate(getRendu(selectedDevoir)?.date_rendu) }}</span
            >
          </div>

          <div v-if="getRendu(selectedDevoir)?.note" class="note-display">
            <span class="note-value">{{ getRendu(selectedDevoir)?.note }}</span>
            <span class="note-label">/ 20</span>
          </div>

          <p v-if="getRendu(selectedDevoir)?.retour" class="retour-prof">
            💬 {{ getRendu(selectedDevoir)?.retour }}
          </p>

          <div v-if="getRendu(selectedDevoir)?.pieces_jointes?.length > 0" class="fichiers-rendus">
            <h4>Fichiers rendus</h4>
            <a
              v-for="pj in getRendu(selectedDevoir)?.pieces_jointes"
              :key="pj.id_piece_jointe"
              :href="`${apiBase}/public${pj.chemin_fichier}`"
              target="_blank"
              class="fichier-item-link"
            >
              <span>{{ getFileIcon(pj.type_fichier) }}</span>
              <span>{{ pj.nom_fichier }}</span>
              <span class="fichier-size">{{ formatSize(Number(pj.taille_octets)) }}</span>
            </a>
          </div>
        </div>

        <!-- Formulaire de rendu (élève) -->
        <div v-if="!isProfessor" class="rendu-form" data-section="rendre">
          <h4>{{ isRendu(selectedDevoir) ? 'Modifier le rendu' : 'Rendre le devoir' }}</h4>
          <div class="upload-zone" @dragover.prevent @drop.prevent="handleDrop">
            <input
              ref="fileInput"
              type="file"
              multiple
              @change="handleFileChange"
              style="display: none"
            />
            <div class="upload-placeholder" @click="fileInput?.click()">
              <span>📎 Cliquez ou glissez vos fichiers ici</span>
              <span class="upload-hint">PDF, images, documents, archives...</span>
            </div>
            <div v-if="fichiers.length > 0" class="fichiers-list">
              <div v-for="(f, i) in fichiers" :key="i" class="fichier-item">
                <span>{{ getFileIcon(f.type) }} {{ f.name }}</span>
                <span class="fichier-size">{{ formatSize(f.size) }}</span>
                <button class="fichier-remove" @click="removeFichier(i)">✕</button>
              </div>
            </div>
          </div>

          <n-button
            type="primary"
            :loading="isSubmitting"
            @click="rendreDevoir"
            style="margin-top: 16px; width: 100%"
          >
            {{ isRendu(selectedDevoir) ? 'Mettre à jour' : 'Rendre le devoir' }}
          </n-button>

          <n-button
            v-if="isRendu(selectedDevoir)"
            type="error"
            tertiary
            :loading="isDeleting"
            @click="supprimerRendu"
            style="margin-top: 12px; width: 100%"
          >
            Supprimer le rendu
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NSpin, NAlert, NEmpty, NModal, NButton, NInput, NInputNumber } from 'naive-ui'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth.store'
import { useMessage } from 'naive-ui'
import Sidebar from '@/components/home/Sidebar.vue'

const api = useApi()
const authStore = useAuthStore()
const message = useMessage()
const route = useRoute()
const apiBase = import.meta.env.VITE_API_URL

const isLoading = ref(true)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const error = ref<string | null>(null)
const showDetailModal = ref(false)
const selectedDevoir = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const fichiers = ref<File[]>([])
const devoirs = ref<any[]>([])
const filtreActif = ref('tous')
const archivingRenduId = ref<string | null>(null)
const filtreCategorie = ref<{ id: string | number; type: string; nom: string } | null>(null)
const isProfessor = computed(() => authStore.user?.role === 'professeur')
const reviewDrafts = ref<Record<string, { note: number | null; retour: string }>>({})
const reviewSavingId = ref<string | null>(null)

const filtres = computed(() => [
  { key: 'tous', label: 'Tous', count: devoirs.value.length },
  {
    key: 'a-rendre',
    label: 'À rendre',
    count: devoirs.value.filter((d) => !isRendu(d) && !isEnRetard(d)).length,
  },
  { key: 'rendus', label: 'Rendus', count: devoirs.value.filter((d) => isRendu(d)).length },
  {
    key: 'en-retard',
    label: 'En retard',
    count: devoirs.value.filter((d) => isEnRetard(d)).length,
  },
])

const devoirsFiltres = computed(() => {
  let result = devoirs.value

  // Filtre par statut
  if (filtreActif.value === 'tous') {
    // Tous les devoirs
  } else if (filtreActif.value === 'a-rendre') {
    result = result.filter((d) => !isRendu(d) && !isEnRetard(d))
  } else if (filtreActif.value === 'rendus') {
    result = result.filter((d) => isRendu(d))
  } else if (filtreActif.value === 'en-retard') {
    result = result.filter((d) => isEnRetard(d))
  }

  // Filtre par catégorie
  if (filtreCategorie.value) {
    const cat = filtreCategorie.value
    if (cat.type === 'matiere') {
      result = result.filter((d) => d.matiere?.id_matiere === cat.id)
    } else if (cat.type === 'specialite') {
      result = result.filter((d) => d.cours?.specialite?.id_specialite === cat.id)
    } else if (cat.type === 'option') {
      result = result.filter((d) => d.cours?.option?.id_option === cat.id)
    }
  }

  // Tri: en retard en priorité, puis par date la plus proche
  result.sort((a, b) => {
    const aEnRetard = isEnRetard(a)
    const bEnRetard = isEnRetard(b)

    // En retard en priorité
    if (aEnRetard && !bEnRetard) return -1
    if (!aEnRetard && bEnRetard) return 1

    // Puis tri par date la plus proche
    const aDate = new Date(a.date_limite).getTime()
    const bDate = new Date(b.date_limite).getTime()
    return aDate - bDate
  })

  return result
})

const categories = computed(() => {
  const cats: Set<string> = new Set()
  const uniqueCats: { id: string | number; type: string; nom: string }[] = []

  devoirs.value.forEach((devoir) => {
    if (devoir.matiere?.id_matiere) {
      const key = `matiere-${devoir.matiere.id_matiere}`
      if (!cats.has(key)) {
        cats.add(key)
        uniqueCats.push({
          id: devoir.matiere.id_matiere,
          type: 'matiere',
          nom: devoir.matiere.nom_matiere,
        })
      }
    }
    if (devoir.cours?.specialite?.id_specialite) {
      const key = `specialite-${devoir.cours.specialite.id_specialite}`
      if (!cats.has(key)) {
        cats.add(key)
        uniqueCats.push({
          id: devoir.cours.specialite.id_specialite,
          type: 'specialite',
          nom: devoir.cours.specialite.nom_specialite,
        })
      }
    }
    if (devoir.cours?.option?.id_option) {
      const key = `option-${devoir.cours.option.id_option}`
      if (!cats.has(key)) {
        cats.add(key)
        uniqueCats.push({
          id: devoir.cours.option.id_option,
          type: 'option',
          nom: devoir.cours.option.nom_option,
        })
      }
    }
  })

  return uniqueCats
})

function getCategoryCount(cat: { id: string | number; type: string; nom: string }) {
  return devoirs.value.filter((d) => {
    if (cat.type === 'matiere') {
      return d.matiere?.id_matiere === cat.id
    } else if (cat.type === 'specialite') {
      return d.cours?.specialite?.id_specialite === cat.id
    } else if (cat.type === 'option') {
      return d.cours?.option?.id_option === cat.id
    }
    return false
  }).length
}

function isRendu(devoir: any) {
  return devoir.rendus && devoir.rendus.length > 0
}

function isEnRetard(devoir: any) {
  if (isRendu(devoir)) return false
  if (!devoir.date_limite) return false
  return new Date(devoir.date_limite) < new Date()
}

function getRendu(devoir: any) {
  return devoir.rendus?.[0] ?? null
}

function getSortedRendus(rendus: any[] | undefined) {
  if (!rendus) return []
  return [...rendus].sort((a, b) => {
    const aDate = new Date(a.date_rendu).getTime()
    const bDate = new Date(b.date_rendu).getTime()
    return bDate - aDate // Plus récent d'abord
  })
}

onMounted(async () => {
  try {
    isLoading.value = true
    devoirs.value = (await api.getMesDevoirs()) as any
    openFocusedDevoirFromQuery()
  } catch (err) {
    error.value = 'Erreur lors du chargement'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

watch(
  () => route.query.focus,
  () => {
    if (!isLoading.value) {
      openFocusedDevoirFromQuery()
    }
  },
)

function openFocusedDevoirFromQuery() {
  const focusId = String(route.query.focus ?? '')
  if (!focusId) return

  const target = devoirs.value.find((devoir) => String(devoir.id_devoir) === focusId)
  if (target) {
    openDevoir(target)
  }
}

function openDevoir(devoir: any) {
  selectedDevoir.value = devoir
  fichiers.value = []
  if (isProfessor.value) {
    reviewDrafts.value = Object.fromEntries(
      (devoir.rendus ?? []).map((rendu: any) => [
        String(rendu.id_rendu),
        {
          note: rendu.note ?? null,
          retour: rendu.retour ?? '',
        },
      ]),
    )
  }
  showDetailModal.value = true
}

function getReviewDraft(rendu: any) {
  const key = String(rendu.id_rendu)
  if (!reviewDrafts.value[key]) {
    reviewDrafts.value[key] = {
      note: rendu.note ?? null,
      retour: rendu.retour ?? '',
    }
  }

  return reviewDrafts.value[key]
}

function updateReviewDraft(rendu: any, field: 'note' | 'retour', value: string | number | null) {
  const draft = getReviewDraft(rendu)

  if (field === 'note') {
    draft.note = value === null || value === undefined || value === '' ? null : Number(value)
    return
  }

  draft.retour = value === null || value === undefined ? '' : String(value)
}

function getColor(hex: string | null) {
  if (!hex) return 'rgba(112, 190, 250, 0.2)'
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.2)`
}

function formatDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  if (input.files) fichiers.value.push(...Array.from(input.files))
}

function handleDrop(e: DragEvent) {
  if (e.dataTransfer?.files) fichiers.value.push(...Array.from(e.dataTransfer.files))
}

function removeFichier(i: number) {
  fichiers.value.splice(i, 1)
}

async function rendreDevoir() {
  if (!selectedDevoir.value) return
  try {
    isSubmitting.value = true
    const formData = new FormData()
    formData.append('id_devoir', String(selectedDevoir.value.id_devoir))
    fichiers.value.forEach((f) => formData.append('fichiers', f))

    await api.rendreDevoir(formData)
    message.success('Devoir rendu avec succès')
    showDetailModal.value = false
    devoirs.value = (await api.getMesDevoirs()) as any
  } catch (err: any) {
    message.error(err.message || 'Erreur lors du rendu')
  } finally {
    isSubmitting.value = false
  }
}

async function supprimerRendu() {
  if (!selectedDevoir.value) return

  try {
    isDeleting.value = true
    await api.deleteRendu(selectedDevoir.value.id_devoir)
    message.success('Rendu supprimé avec succès')
    showDetailModal.value = false
    devoirs.value = (await api.getMesDevoirs()) as any
  } catch (err: any) {
    message.error(err.message || 'Erreur lors de la suppression du rendu')
  } finally {
    isDeleting.value = false
  }
}

async function downloadAllRendus() {
  if (!selectedDevoir.value) return

  window.open(
    `${apiBase}/api/devoirs/${selectedDevoir.value.id_devoir}/download-all-rendus`,
    '_blank'
  )
}

async function saveReview(rendu: any) {
  const draft = reviewDrafts.value[String(rendu.id_rendu)]
  if (!draft) return

  try {
    reviewSavingId.value = String(rendu.id_rendu)
    await api.updateRendu(rendu.id_rendu, {
      note: draft.note,
      retour: draft.retour,
    })
    message.success('Note et retour enregistrés')
    devoirs.value = (await api.getMesDevoirs()) as any
    if (selectedDevoir.value) {
      selectedDevoir.value = devoirs.value.find(
        (devoir) => String(devoir.id_devoir) === String(selectedDevoir.value.id_devoir),
      )
    }
  } catch (err: any) {
    message.error(err.message || 'Erreur lors de l’enregistrement')
  } finally {
    reviewSavingId.value = null
  }
}

async function archiveRendu(rendu: any) {
  if (!selectedDevoir.value) return

  try {
    archivingRenduId.value = String(rendu.id_rendu)
    await api.archiveRendu(rendu.id_rendu)
    message.success('Rendu archivé avec succès')
    devoirs.value = (await api.getMesDevoirs()) as any
    if (selectedDevoir.value) {
      selectedDevoir.value = devoirs.value.find(
        (devoir) => String(devoir.id_devoir) === String(selectedDevoir.value.id_devoir),
      )
    }
  } catch (err: any) {
    message.error(err.message || "Erreur lors de l'archivage")
  } finally {
    archivingRenduId.value = null
  }
}
</script>

<style scoped>
.devoirs-layout {
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

.devoirs-header {
  background: transparent;
  padding: 32px 24px;
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

.devoirs-content {
  padding: 0 24px 32px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.devoirs-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filtres-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filtres-label {
  font-size: 14px;
  font-weight: 600;
  color: #205781;
}

.filtres {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filtre-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #817f7f;
  transition: all 0.2s;
}

.filtre-btn.active {
  border-color: #205781;
  color: #205781;
  background: rgba(32, 87, 129, 0.05);
}

.filtre-count {
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
}

.filtre-btn.active .filtre-count {
  background: rgba(32, 87, 129, 0.15);
}

.devoirs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.devoir-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-left: 4px solid transparent;
}

.devoir-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateX(4px);
}

.devoir-card.rendu {
  border-left-color: #10b981;
}

.devoir-card.en-retard {
  border-left-color: #ef4444;
}

.devoir-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.devoir-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.devoir-info {
  flex: 1;
  min-width: 0;
}

.devoir-top {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.devoir-matiere {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #205781;
}

.devoir-cours {
  font-size: 11px;
  color: #817f7f;
}

.devoir-titre {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.devoir-desc {
  font-size: 13px;
  color: #817f7f;
  margin: 0 0 8px 0;
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.devoir-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}

.devoir-date {
  font-size: 12px;
  color: #205781;
}

.devoir-coef {
  font-size: 12px;
  color: #817f7f;
  background: rgba(32, 87, 129, 0.1);
  padding: 2px 8px;
  border-radius: 20px;
}

.devoir-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.rendu {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.retard {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.a-rendre {
  background: rgba(32, 87, 129, 0.1);
  color: #205781;
}

.devoir-detail {
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.detail-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.meta-badge {
  background: rgba(32, 87, 129, 0.1);
  color: #205781;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-desc {
  color: #817f7f;
  font-size: 15px;
  margin-bottom: 8px;
  line-height: 1.6;
}

.detail-date {
  font-size: 14px;
  color: #205781;
  margin-bottom: 0;
  font-weight: 500;
}

.rendu-info {
  background: rgba(16, 185, 129, 0.05);
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 0;
}

.rendu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(16, 185, 129, 0.2);
}

.rendu-label {
  font-weight: 700;
  color: #10b981;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rendu-date {
  font-size: 13px;
  color: #817f7f;
}

.note-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;
}

.note-value {
  font-size: 36px;
  font-weight: 700;
  color: #205781;
}

.note-label {
  font-size: 18px;
  color: #817f7f;
}

.retour-prof {
  font-size: 13px;
  color: #1a1a1a;
  background: rgba(32, 87, 129, 0.08);
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid #205781;
  line-height: 1.5;
}

.fichiers-rendus {
  margin-top: 16px;
  padding: 16px;
  background: rgba(32, 87, 129, 0.05);
  border-radius: 8px;
}

.fichiers-rendus h4 {
  font-size: 13px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fichier-item-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #205781;
  font-size: 13px;
  background: white;
  transition: all 0.2s;
  margin-bottom: 8px;
  border: 1px solid rgba(32, 87, 129, 0.1);
}

.fichier-item-link:last-child {
  margin-bottom: 0;
}

.fichier-item-link:hover {
  background: rgba(32, 87, 129, 0.08);
  border-color: rgba(32, 87, 129, 0.3);
  transform: translateX(4px);
}

.fichier-size {
  margin-left: auto;
  font-size: 12px;
  color: #817f7f;
  font-weight: 500;
}

.rendu-form h4 {
  font-size: 16px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 12px 0;
}

.upload-zone {
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

.rendus-eleves-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 20px;
  width: 100%;
}

.rendu-eleve-card {
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 24px;
  border: 2px solid rgba(32, 87, 129, 0.15);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  width: 100%;
}

.rendu-eleve-card:hover {
  border-color: rgba(32, 87, 129, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.rendu-eleve-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(32, 87, 129, 0.1);
}

.rendu-eleve-header strong {
  font-size: 16px;
  color: #1a1a1a;
}

.rendu-date {
  font-size: 13px;
  color: #817f7f;
  font-style: italic;
}

.review-form {
  display: grid;
  gap: 18px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(32, 87, 129, 0.1);
}

.review-field {
  display: grid;
  gap: 10px;
}

.review-field label {
  font-size: 14px;
  font-weight: 700;
  color: #205781;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.note-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
}

.note-value {
  font-size: 28px;
  font-weight: 700;
  color: #10b981;
}

.note-label {
  font-size: 16px;
  color: #817f7f;
}

.non-rendus-block {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 12px;
  border-left: 4px solid #ef4444;
}

.non-rendus-block h4 {
  font-size: 16px;
  font-weight: 700;
  color: #ef4444;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.non-rendus-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.non-rendu-chip {
  background: white;
  color: #ef4444;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid #ef4444;
  transition: all 0.2s ease;
}

.non-rendu-chip:hover {
  background: rgba(239, 68, 68, 0.1);
}

:deep(.devoir-modal-prof) {
  --n-width: 1200px;
  --n-dialog-padding: 20px;
}

:deep(.devoir-modal-prof .n-dialog) {
  max-height: 90vh;
}

:deep(.devoir-modal-prof .n-dialog__content) {
  height: auto;
  overflow-y: auto;
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
  .devoirs-header {
    padding: 16px 12px;
    padding-left: 60px;
  }
  .devoirs-content {
    padding: 0 12px 24px;
  }
  .devoir-card {
    flex-wrap: wrap;
  }
}
</style>
