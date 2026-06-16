<template>
  <div class="matiere-layout">
    <Sidebar />

    <div class="main-wrapper">
      <header class="matiere-header">
        <div class="header-left">
          <button class="back-btn" @click="router.back()">← Retour</button>
          <div class="header-title">
            <div class="matiere-icon-header" :style="{ backgroundColor: iconBg }">
              <img v-if="categoryIcon" :src="categoryIcon" :alt="categoryTitle" />
              <span v-else>📚</span>
            </div>
            <div>
              <h1>{{ categoryTitle }}</h1>
              <p>{{ categoryDescription }}</p>
            </div>
          </div>
        </div>

        <div v-if="isProfessor" class="header-right">
          <n-dropdown trigger="click" :options="createOptions" @select="handleCreateSelect">
            <button class="create-btn">➕ Nouveau</button>
          </n-dropdown>
        </div>
      </header>

      <main class="matiere-content">
        <n-spin v-if="isLoading">
          <template #description>Chargement...</template>
        </n-spin>

        <n-alert v-else-if="error" type="error">{{ error }}</n-alert>

        <div v-else class="content-grid">
          <!-- Cours -->
          <div class="section-card">
            <h2>Cours</h2>

            <n-empty v-if="cours.length === 0" description="Aucun cours" />

            <div v-else class="items-list">
              <div
                v-for="c in cours.slice(0, 3)"
                :key="c.id_cours"
                class="item-card cours-item"
                @click="openCours(c)"
                style="cursor: pointer"
              >
                <div class="item-actions" v-if="isProfessor">
                  <button class="edit-btn" @click.stop="openEditCoursModal(c)" title="Modifier">
                    <img src="/edit-icon.svg" alt="Modifier" class="edit-icon" />
                  </button>
                  <button class="delete-btn" @click.stop="deleteCours(c.id_cours)">
                    <img src="/red-cross-icon.svg" alt="Supprimer" class="delete-icon" />
                  </button>
                </div>
                <div class="item-icon" :style="{ backgroundColor: iconBg }">
                  <img v-if="categoryIcon" :src="categoryIcon" alt="" />
                  <span v-else>📖</span>
                </div>

                <div class="item-content">
                  <p class="item-title">{{ c.nom_cours }}</p>
                  <p class="item-sub">{{ c.description_cours ?? 'Pas de description' }}</p>
                  <p class="item-meta">
                    Professeur : {{ c.professeur?.user?.prenom }} {{ c.professeur?.user?.nom }}
                  </p>
                </div>
              </div>

              <!-- Bouton voir plus -->
              <button
                v-if="cours.length > 3"
                class="see-more-btn"
                @click="goToCours(categoryKind, categoryTitle)"
              >
                Voir plus →
              </button>
            </div>
          </div>

          <!-- Devoirs -->
          <div class="section-card">
            <h2>Devoirs</h2>
            <n-empty v-if="devoirs.length === 0" description="Aucun devoir" />
            <div v-else class="items-list">
              <div
                v-for="d in devoirs.slice(0, 3)"
                :key="d.id_devoir"
                class="item-card devoir-item"
                @click="openDevoir(d)"
              >
                <div class="item-actions" v-if="isProfessor">
                  <button class="edit-btn" @click.stop="openEditDevoirModal(d)" title="Modifier">
                    <img src="/edit-icon.svg" alt="Modifier" class="edit-icon" />
                  </button>
                  <button class="delete-btn" @click.stop="deleteDevoir(d.id_devoir)">
                    <img src="/red-cross-icon.svg" alt="Supprimer" class="delete-icon" />
                  </button>
                </div>

                <div class="item-icon" :style="{ backgroundColor: iconBg }">
                  <img v-if="matiere?.devoir_icon_url" :src="matiere.devoir_icon_url" alt="" />
                  <span v-else>📝</span>
                </div>

                <div class="item-content">
                  <p class="item-title">{{ d.nom_devoir }}</p>
                  <p class="item-sub">{{ d.description_devoir ?? 'Pas de description' }}</p>
                  <p class="item-meta" v-if="d.date_limite">
                    📅 {{ new Date(d.date_limite).toLocaleDateString('fr-FR') }}
                  </p>
                </div>

                <div class="item-badge" v-if="d.coefficient">Coef. {{ d.coefficient }}</div>
              </div>

              <button v-if="devoirs.length > 3" class="see-more-btn" @click="goToDevoirs()">
                Voir plus →
              </button>
            </div>
          </div>

          <!-- Événements -->
          <div class="section-card full-width">
            <h2>Événements à venir</h2>
            <n-empty v-if="evenements.length === 0" description="Aucun événement" />
            <div v-else class="evenements-grid">
              <div v-for="e in evenements" :key="e.id_evenement" class="evenement-card">
                <div class="item-actions" v-if="isProfessor">
                  <button class="delete-btn" @click="deleteEvenement(e.id_evenement)">
                    <img src="/red-cross-icon.svg" alt="Supprimer" class="delete-icon" />
                  </button>
                </div>
                <div class="evenement-type" :style="getBadgeStyle(e.type_evenement)">
                  {{ e.type_evenement }}
                </div>
                <p class="evenement-title">{{ e.nom_evenement }}</p>
                <p class="evenement-date">
                  📅
                  {{
                    new Date(e.date_evenement).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  }}
                </p>
                <p class="evenement-duree" v-if="e.duree_minutes">⏱ {{ e.duree_minutes }} min</p>
                <p class="evenement-desc" v-if="e.description">{{ e.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal Créer Cours -->
      <n-modal
        v-model:show="showCreateCoursModal"
        title="Créer un cours"
        preset="dialog"
        size="medium"
      >
        <n-form ref="coursFormRef" :model="coursForm" :rules="coursRules">
          <n-form-item label="Nom du cours" path="nom_cours">
            <n-input v-model:value="coursForm.nom_cours" placeholder="Entrez le nom du cours" />
          </n-form-item>
          <n-form-item label="Description" path="description_cours">
            <n-input
              v-model:value="coursForm.description_cours"
              placeholder="Entrez la description"
              type="textarea"
              :rows="3"
            />
          </n-form-item>
          <n-form-item label="Fichiers" path="files">
            <n-upload
              v-model:file-list="fileList"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.py,.c,.sql,.html,.css,.js,.java"
              :max="10"
              @change="handleFileChange"
            >
              <n-button>Sélectionner fichiers</n-button>
            </n-upload>
          </n-form-item>
        </n-form>

        <template #action>
          <n-button @click="showCreateCoursModal = false">Annuler</n-button>
          <n-button type="primary" @click="createCourseHandler">Créer</n-button>
        </template>
      </n-modal>

      <!-- Modal Créer Devoir -->
      <n-modal
        v-model:show="showCreateDevoirModal"
        title="Créer un devoir"
        preset="dialog"
        size="medium"
      >
        <n-form ref="devoirFormRef" :model="devoirForm" :rules="devoirRules">
          <n-form-item label="Nom du devoir" path="nom_devoir">
            <n-input v-model:value="devoirForm.nom_devoir" placeholder="Entrez le nom du devoir" />
          </n-form-item>
          <n-form-item label="Description" path="description_devoir">
            <n-input
              v-model:value="devoirForm.description_devoir"
              placeholder="Entrez la description"
              type="textarea"
              :rows="3"
            />
          </n-form-item>
          <n-form-item label="Date limite" path="date_limite">
            <n-date-picker v-model:value="devoirForm.date_limite" type="datetime" />
          </n-form-item>
          <n-form-item label="Coefficient" path="coefficient">
            <n-input-number v-model:value="devoirForm.coefficient" :min="0" :max="20" />
          </n-form-item>
          <n-form-item label="Cours associé" path="id_cours">
            <n-select
              v-model:value="devoirForm.id_cours"
              :options="cours.map(c => ({ label: c.nom_cours, value: c.id_cours }))"
              placeholder="Sélectionner un cours (optionnel)"
              clearable
            />
          </n-form-item>
          <n-form-item label="Fichiers">
            <n-upload
              v-model:file-list="devoirFileList"
              :max="10"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.py,.c,.sql,.html,.css,.js,.java"
            >
              <n-button>Ajouter fichiers</n-button>
            </n-upload>
          </n-form-item>
        </n-form>

        <template #action>
          <n-button @click="showCreateDevoirModal = false">Annuler</n-button>
          <n-button type="primary" @click="createDevoirHandler">Créer</n-button>
        </template>
      </n-modal>

      <!-- Modal Créer Événement -->
      <n-modal
        v-model:show="showCreateEvenementModal"
        title="Créer un événement"
        preset="dialog"
        size="medium"
      >
        <n-form ref="evenementFormRef" :model="evenementForm" :rules="evenementRules">
          <n-form-item label="Nom de l'événement" path="nom_evenement">
            <n-input v-model:value="evenementForm.nom_evenement" placeholder="Entrez le nom" />
          </n-form-item>
          <n-form-item label="Type" path="type_evenement">
            <n-select
              v-model:value="evenementForm.type_evenement"
              :options="[
                { label: 'Interrogation', value: 'Interrogation' },
                { label: 'DS', value: 'DS' },
                { label: 'EXAMUN', value: 'EXAMUN' },
              ]"
            />
          </n-form-item>
          <n-form-item label="Date et heure" path="date_evenement">
            <n-date-picker v-model:value="evenementForm.date_evenement" type="datetime" />
          </n-form-item>
        </n-form>

        <template #action>
          <n-button @click="showCreateEvenementModal = false">Annuler</n-button>
          <n-button type="primary" @click="createEvenementHandler">Créer</n-button>
        </template>
      </n-modal>

      <!-- Modal Modifier Cours -->
      <n-modal
        v-model:show="showEditCoursModal"
        title="Modifier le cours"
        preset="dialog"
        size="medium"
      >
        <n-form
          ref="editCoursFormRef"
          :model="editingCours"
          :rules="coursRules"
          v-if="editingCours"
        >
          <n-form-item label="Nom du cours" path="nom_cours">
            <n-input v-model:value="editingCours.nom_cours" placeholder="Entrez le nom du cours" />
          </n-form-item>
          <n-form-item label="Description" path="description_cours">
            <n-input
              v-model:value="editingCours.description_cours"
              placeholder="Entrez la description"
              type="textarea"
              :rows="3"
            />
          </n-form-item>
          <n-form-item label="Fichiers">
            <n-upload
              v-model:file-list="editCoursFileList"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.py,.c,.sql,.html,.css,.js,.java"
              :max="10"
            >
              <n-button>Ajouter/Modifier fichiers</n-button>
            </n-upload>
          </n-form-item>
        </n-form>

        <template #action>
          <n-button @click="showEditCoursModal = false">Annuler</n-button>
          <n-button type="primary" @click="updateCourseHandler">Mettre à jour</n-button>
        </template>
      </n-modal>

      <!-- Modal Modifier Devoir -->
      <n-modal
        v-model:show="showEditDevoirModal"
        title="Modifier le devoir"
        preset="dialog"
        size="medium"
      >
        <n-form
          ref="editDevoirFormRef"
          :model="editingDevoir"
          :rules="devoirRules"
          v-if="editingDevoir"
        >
          <n-form-item label="Nom du devoir" path="nom_devoir">
            <n-input
              v-model:value="editingDevoir.nom_devoir"
              placeholder="Entrez le nom du devoir"
            />
          </n-form-item>
          <n-form-item label="Description" path="description_devoir">
            <n-input
              v-model:value="editingDevoir.description_devoir"
              placeholder="Entrez la description"
              type="textarea"
              :rows="3"
            />
          </n-form-item>
          <n-form-item label="Date limite" path="date_limite">
            <n-date-picker v-model:value="editingDevoir.date_limite" type="datetime" />
          </n-form-item>
          <n-form-item label="Coefficient" path="coefficient">
            <n-input-number v-model:value="editingDevoir.coefficient" :min="0" :max="20" />
          </n-form-item>
          <n-form-item label="Fichiers">
            <n-upload
              v-model:file-list="devoirFileList"
              :max="10"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.py,.c,.sql,.html,.css,.js,.java"
            >
              <n-button>Ajouter/Modifier fichiers</n-button>
            </n-upload>
          </n-form-item>
        </n-form>

        <template #action>
          <n-button @click="showEditDevoirModal = false">Annuler</n-button>
          <n-button type="primary" @click="updateDevoirHandler">Mettre à jour</n-button>
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
            <span class="meta-badge" v-if="selectedCours.matiere">{{
              selectedCours.matiere.nom_matiere
            }}</span>
            <span class="meta-badge" v-if="selectedCours.classe">{{
              selectedCours.classe.nom_classe
            }}</span>
            <span class="meta-badge">
              👤 {{ selectedCours.professeur?.user?.prenom }}
              {{ selectedCours.professeur?.user?.nom }}
            </span>
          </div>

          <!-- Onglets -->
          <n-tabs v-model:value="coursDetailTab" type="line" style="margin-top: 16px">
            <!-- Onglet Fichiers -->
            <n-tab-pane name="fichiers" tab="📁 Fichiers">
              <p class="detail-desc">{{ selectedCours.description_cours ?? 'Pas de description' }}</p>
              <div v-if="selectedCours.ressources?.length > 0" class="detail-ressources">
                <h4>Fichiers du cours</h4>
                <div class="ressources-list">
                  <a
                    v-for="ressource in selectedCours.ressources"
                    :key="ressource.id_ressource"
                    :href="`${apiBase}/public${ressource.chemin_fichier}`"
                    target="_blank"
                    class="ressource-item"
                  >
                    <span>{{ getFileIcon(ressource.type_fichier) }}</span>
                    <div class="ressource-info">
                      <span class="ressource-nom">{{ ressource.nom_fichier }}</span>
                      <span class="ressource-size">{{
                        formatSize(Number(ressource.taille_octets))
                      }}</span>
                    </div>
                    <span class="ressource-dl">⬇</span>
                  </a>
                </div>
              </div>
              <n-empty v-else description="Aucun fichier joint" />
            </n-tab-pane>

            <!-- Onglet Devoirs -->
            <n-tab-pane name="devoirs" tab="📝 Devoirs">
              <div class="cours-devoirs-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span>Devoirs liés à ce cours</span>
                <n-button v-if="isProfessor" size="small" type="primary" @click="openCreateDevoirFromCours(selectedCours)">
                  ➕ Nouveau devoir
                </n-button>
              </div>

              <n-empty
                v-if="!devoirsForSelectedCours.length"
                description="Aucun devoir pour ce cours"
              />

              <div v-else class="items-list">
                <div
                  v-for="d in devoirsForSelectedCours"
                  :key="d.id_devoir"
                  class="item-card devoir-item"
                  @click="openDevoir(d)"
                  style="cursor: pointer"
                >
                  <div class="item-icon" :style="{ backgroundColor: iconBg }">
                    <span>📝</span>
                  </div>
                  <div class="item-content">
                    <p class="item-title">{{ d.nom_devoir }}</p>
                    <p class="item-sub">{{ d.description_devoir ?? 'Pas de description' }}</p>
                    <p class="item-meta" v-if="d.date_limite">
                      📅 {{ new Date(d.date_limite).toLocaleDateString('fr-FR') }}
                    </p>
                  </div>
                  <div class="item-badge" v-if="d.coefficient">Coef. {{ d.coefficient }}</div>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-modal>
      <!-- Modal détail devoir -->
      <n-modal
        v-model:show="showDevoirDetailModal"
        preset="card"
        :title="selectedDevoir?.nom_devoir"
        style="max-width: 600px"
      >
        <div v-if="selectedDevoir" class="devoir-detail">
          <p class="detail-desc">
            {{ selectedDevoir.description_devoir ?? 'Pas de description' }}
          </p>

          <div class="detail-meta">
            <span class="meta-badge" v-if="selectedDevoir.coefficient">
              Coefficient : {{ selectedDevoir.coefficient }}
            </span>

            <span class="meta-badge" v-if="selectedDevoir.date_limite">
              📅 {{ new Date(selectedDevoir.date_limite).toLocaleString('fr-FR') }}
            </span>
          </div>

          <div v-if="selectedDevoir?.pieceJointeDevoirs?.length" class="detail-ressources">
            <h4>Fichiers du devoir</h4>

            <div class="ressources-list">
              <a
                v-for="file in selectedDevoir.pieceJointeDevoirs"
                :key="file.id_piece_jointe_devoir"
                :href="`${apiBase}/public${file.chemin_fichier}`"
                target="_blank"
                class="ressource-item"
              >
                <span>📎</span>

                <div class="ressource-info">
                  <span class="ressource-nom">{{ file.nom_fichier }}</span>
                </div>

                <span class="ressource-dl">⬇</span>
              </a>
            </div>
          </div>

          <n-empty v-else description="Aucun fichier joint" />

          <!-- Bouton Rendre / Rendus -->
          <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <n-button
              v-if="isEleve"
              type="primary"
              @click="handleRendreDevoir(selectedDevoir)"
            >
              📤 Rendre
            </n-button>
            <n-button
              v-else-if="isProfessor"
              type="default"
              @click="handleVoirRendus(selectedDevoir)"
            >
              <img src="/eye-password-show-svgrepo-com.svg" alt="Rendus" style="width: 16px; height: 16px; margin-right: 6px;" />
              Rendus
            </n-button>
          </div>
        </div>
      </n-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NSpin,
  NAlert,
  NEmpty,
  NDropdown,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NUpload,
  NDatePicker,
  NSelect,
  NInputNumber,
} from 'naive-ui'
import type { FormInst, UploadFileInfo } from 'naive-ui'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth.store'
import { useMessage } from 'naive-ui'
import Sidebar from '@/components/home/Sidebar.vue'
import { getMatiereByName } from '@/utils/matieres.ts'

const route = useRoute()
const router = useRouter()
const api = useApi()
const authStore = useAuthStore()
const message = useMessage()

const matiereId = route.params.id as string
const categoryKind = computed(() => String(route.query.kind ?? 'matiere'))
const categoryLabel = computed(() => String(route.query.name ?? ''))

const isLoading = ref(true)
const error = ref<string | null>(null)
const isEleve = computed(() => authStore.user?.role === 'eleve')

const matiere = ref<any>(null)
const cours = ref<any[]>([])
const devoirs = ref<any[]>([])
const evenements = ref<any[]>([])
const devoirFileList = ref<UploadFileInfo[]>([])
const showDevoirDetailModal = ref(false)
const selectedDevoir = ref<any>(null)
const coursDetailTab = ref('fichiers')

// Modal states
const showCreateCoursModal = ref(false)
const showCreateDevoirModal = ref(false)
const showCreateEvenementModal = ref(false)
const showEditCoursModal = ref(false)
const showEditDevoirModal = ref(false)

// Form refs
const coursFormRef = ref<FormInst | null>(null)
const devoirFormRef = ref<FormInst | null>(null)
const evenementFormRef = ref<FormInst | null>(null)
const editCoursFormRef = ref<FormInst | null>(null)
const editDevoirFormRef = ref<FormInst | null>(null)

// Edit states
const editingCours = ref<any>(null)
const editingDevoir = ref<any>(null)
const editCoursFileList = ref<UploadFileInfo[]>([])

const matieres = ref<any[]>([])

const showDetailModal = ref(false)
const selectedCours = ref<any>(null)
const apiBase = import.meta.env.VITE_API_URL

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

const matieresOptions = computed(() =>
  matieres.value.map((m) => ({ label: m.nom_matiere, value: String(m.id_matiere) })),
)

// Extract unique matières from cours
const coursMatieres = computed(() => {
  const unique = new Map<string, any>()
  cours.value.forEach((c) => {
    if (c.matiere?.id_matiere) {
      const key = String(c.matiere.id_matiere)
      if (!unique.has(key)) {
        unique.set(key, c.matiere)
      }
    }
  })
  return Array.from(unique.values())
})

const coursMatieresOptions = computed(() =>
  coursMatieres.value.map((m) => ({ label: m.nom_matiere, value: String(m.id_matiere) })),
)

// Form states
const coursForm = ref({
  nom_cours: '',
  description_cours: '',
  id_matiere_override: null as string | null,
})

const devoirForm = ref({
  nom_devoir: '',
  description_devoir: '',
  date_limite: null as number | null,
  coefficient: 1 as number,
  id_cours: null,
})

// Devoirs filtrés pour le cours sélectionné
const devoirsForSelectedCours = computed(() =>
  devoirs.value.filter(d => d.id_cours === selectedCours.value?.id_cours)
)

// Ouvrir la modal cours en forçant l'onglet devoirs + pré-remplir id_cours
function openCreateDevoirFromCours(cours) {
  showDetailModal.value = false
  devoirForm.value = {
    nom_devoir: '',
    description_devoir: '',
    date_limite: null,
    coefficient: null,
    id_cours: cours.id_cours,
  }
  showCreateDevoirModal.value = true
}

// Réinitialiser l'onglet à l'ouverture d'un cours
function openCours(c) {
  selectedCours.value = c
  coursDetailTab.value = 'fichiers'
  showDetailModal.value = true
}

const evenementForm = ref({
  nom_evenement: '',
  type_evenement: 'Interrogation',
  date_evenement: null as number | null,
  id_matiere: null as string | null,
})

// File upload
const fileList = ref<UploadFileInfo[]>([])

// Validation rules
const coursRules = {
  nom_cours: [
    { required: true, message: 'Le nom est requis', trigger: 'blur' },
    { min: 3, max: 255, message: 'Entre 3 et 255 caractères', trigger: 'blur' },
  ],
}

const devoirRules = {
  nom_devoir: [
    { required: true, message: 'Le nom est requis', trigger: 'blur' },
    { min: 3, max: 255, message: 'Entre 3 et 255 caractères', trigger: 'blur' },
  ],
}

const evenementRules = {
  nom_evenement: [
    { required: true, message: 'Le nom est requis', trigger: 'blur' },
    { min: 3, max: 255, message: 'Entre 3 et 255 caractères', trigger: 'blur' },
  ],
  type_evenement: [{ required: true, message: 'Le type est requis', trigger: 'blur' }],
}

const iconBg = computed(() => {
  const hex = (matiere.value?.couleur ?? '#70BEFA').replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.2)`
})

// Return badge style for an event type (fixed colors). Fallback uses matiere color.
function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return { r, g, b }
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const typeColorMap: Record<string, { bg: string; text: string }> = {
  Interrogation: { bg: '#1E88E5', text: '#FFFFFF' },
  DS: { bg: '#F97316', text: '#FFFFFF' },
  EXAMUN: { bg: '#EF4444', text: '#FFFFFF' },
}

function getBadgeStyle(type: string) {
  const key = String(type ?? '').trim()
  if (typeColorMap[key]) {
    return { backgroundColor: typeColorMap[key].bg, color: typeColorMap[key].text }
  }

  // fallback to matiere color (darker)
  const hex = (matiere.value?.couleur ?? '#70BEFA').replace('#', '')
  try {
    const { r, g, b } = hexToRgb(hex)
    // slightly darker, solid
    const bg = `rgba(${r}, ${g}, ${b}, 0.85)`
    const text = luminance(r, g, b) > 180 ? '#0f172a' : '#ffffff'
    return { backgroundColor: bg, color: text }
  } catch (e) {
    return { backgroundColor: '#70BEFA', color: '#0f172a' }
  }
}

const categoryTitle = computed(() => {
  if (categoryLabel.value) return categoryLabel.value
  return matiere.value?.nom_matiere ?? 'Catégorie'
})

const categoryDescription = computed(() => {
  if (categoryKind.value === 'matiere') return matiere.value?.description ?? ''
  if (categoryKind.value === 'specialite') return 'Catégorie de spécialité'
  if (categoryKind.value === 'option') return "Catégorie d'option"
  return matiere.value?.description ?? ''
})

const categoryIcon = computed(() => {
  if (categoryLabel.value) {
    return getMatiereByName(categoryLabel.value)?.icon ?? '/others-icon.svg'
  }
  return matiere.value?.icon_url ?? '/others-icon.svg'
})

const isProfessor = computed(() => authStore.user?.role === 'professeur')

const createOptions = [
  { label: 'Créer un cours', key: 'cours' },
  { label: 'Créer un devoir', key: 'devoir' },
  { label: 'Créer un événement', key: 'evenement' },
]

async function deleteCours(id: string) {
  try {
    await api.deleteCours(id)
    message.success('Cours supprimé')
    await loadData()
  } catch (err: any) {
    message.error(err.message || 'Erreur suppression cours')
  }
}

async function deleteDevoir(id: string) {
  try {
    await api.deleteDevoir(id)
    message.success('Devoir supprimé')
    await loadData()
  } catch (err: any) {
    message.error(err.message || 'Erreur suppression devoir')
  }
}

async function deleteEvenement(id: string) {
  try {
    await api.deleteEvenement(id)
    message.success('Événement supprimé')
    await loadData()
  } catch (err: any) {
    message.error(err.message || 'Erreur suppression événement')
  }
}

function openEditCoursModal(c: any) {
  editingCours.value = {
    id_cours: c.id_cours,
    nom_cours: c.nom_cours,
    description_cours: c.description_cours,
  }
  editCoursFileList.value = []
  showEditCoursModal.value = true
}

function openEditDevoirModal(d: any) {
  editingDevoir.value = {
    id_devoir: d.id_devoir,
    nom_devoir: d.nom_devoir,
    description_devoir: d.description_devoir,
    date_limite: d.date_limite ? new Date(d.date_limite).getTime() : null,
    coefficient: d.coefficient || 1,
  }
  devoirFileList.value = []
  showEditDevoirModal.value = true
}

async function updateCourseHandler() {
  await editCoursFormRef.value?.validate()

  try {
    const formData = new FormData()
    formData.append('nom_cours', editingCours.value.nom_cours)
    formData.append('description_cours', editingCours.value.description_cours || '')

    editCoursFileList.value.forEach((file) => {
      if (file.file) formData.append('fichiers', file.file)
    })

    await api.updateCours(editingCours.value.id_cours, formData)
    message.success('Cours mis à jour avec succès')
    showEditCoursModal.value = false
    editingCours.value = null
    editCoursFileList.value = []
    await loadData()
  } catch (err: any) {
    message.error(err.message || 'Erreur lors de la mise à jour du cours')
  }
}

async function updateDevoirHandler() {
  await editDevoirFormRef.value?.validate()

  try {
    const formData = new FormData()

    formData.append('nom_devoir', editingDevoir.value.nom_devoir)
    formData.append('description_devoir', editingDevoir.value.description_devoir || '')

    if (editingDevoir.value.date_limite) {
      formData.append('date_limite', new Date(editingDevoir.value.date_limite).toISOString())
    }

    formData.append('coefficient', String(editingDevoir.value.coefficient || 1))

    devoirFileList.value.forEach((f) => {
      if (f.file) formData.append('fichiers', f.file)
    })

    await api.updateDevoir(editingDevoir.value.id_devoir, formData)
    message.success('Devoir mis à jour avec succès')
    showEditDevoirModal.value = false
    editingDevoir.value = null
    devoirFileList.value = []
    await loadData()
  } catch (err: any) {
    message.error(err.message || 'Erreur lors de la mise à jour du devoir')
  }
}

async function loadData() {
  try {
    isLoading.value = true

    if (categoryKind.value === 'matiere') {
      const [coursData, devoirsData, evenementsData] = await Promise.all([
        api.getCoursByMatiere(matiereId) as any,
        api.getDevoirsByMatiere(matiereId) as any,
        api.getEvenementsByMatiere(matiereId) as any,
      ]).catch(() => [[], [], []])

      cours.value = coursData || []
      devoirs.value = devoirsData || []
      evenements.value = evenementsData || []

      if (coursData?.length > 0) {
        matiere.value = coursData[0].matiere
      } else if (devoirsData?.length > 0) {
        matiere.value = devoirsData[0].matiere
      } else if (evenementsData?.length > 0) {
        matiere.value = evenementsData[0].matiere
      }
    } else if (categoryKind.value === 'specialite') {
      const [coursData, devoirsData, evenementsData] = await Promise.all([
        api.getCoursBySpecialite(matiereId) as any,
        api.getDevoirsByCategory('specialite', matiereId) as any,
        api.getEvenementsByCategory('specialite', matiereId) as any,
      ]).catch(() => [[], [], []])

      cours.value = coursData || []
      devoirs.value = devoirsData || []
      evenements.value = evenementsData || []

      const label = categoryLabel.value || String(matiereId)
      const foundIcon = getMatiereByName(label)
      matiere.value = {
        nom_matiere: label,
        description: 'Catégorie de spécialité',
        couleur: foundIcon?.color ?? '#70BEFA',
        icon_url: foundIcon?.icon ?? '/others-icon.svg',
        devoir_icon_url: foundIcon?.devoirIcon ?? '/other-devoir-icon.svg',
      }
    } else if (categoryKind.value === 'option') {
      const [coursData, devoirsData, evenementsData] = await Promise.all([
        api.getCoursByOption(matiereId) as any,
        api.getDevoirsByCategory('option', matiereId) as any,
        api.getEvenementsByCategory('option', matiereId) as any,
      ]).catch(() => [[], [], []])

      cours.value = coursData || []
      devoirs.value = devoirsData || []
      evenements.value = evenementsData || []

      const label = categoryLabel.value || String(matiereId)
      const foundIcon = getMatiereByName(label)
      matiere.value = {
        nom_matiere: label,
        description: "Catégorie d'option",
        couleur: foundIcon?.color ?? '#70BEFA',
        icon_url: foundIcon?.icon ?? '/others-icon.svg',
        devoir_icon_url: foundIcon?.devoirIcon ?? '/other-devoir-icon.svg',
      }
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!matiereId || matiereId === 'null') {
    error.value = 'Catégorie introuvable'
    isLoading.value = false
    return
  }

  matieres.value = (await api.getAllMatieres()) as any

  await loadData()
})

function handleCreateSelect(key: string) {
  if (key === 'cours') showCreateCoursModal.value = true
  else if (key === 'devoir') showCreateDevoirModal.value = true
  else if (key === 'evenement') openCreateEvenementModal()
}

function handleRendreDevoir(devoir: any) {
  showDevoirDetailModal.value = false
  router.push({ path: '/devoirs', query: { focus: String(devoir.id_devoir) } })
}

function handleVoirRendus(devoir: any) {
  showDevoirDetailModal.value = false
  router.push({ path: '/devoirs', query: { focus: String(devoir.id_devoir) } })
}

function openCreateEvenementModal() {
  // Pour matière : pré-remplir avec la matière
  // Pour spécialité/option : id_matiere est juste un placeholder (pas utilisé)
  let defaultMatierId: string | null = null

  if (categoryKind.value === 'matiere') {
    defaultMatierId = matiereId
  }

  // Pré-remplir le formulaire
  evenementForm.value = {
    nom_evenement: '',
    type_evenement: 'Interrogation',
    date_evenement: null,
    id_matiere: defaultMatierId,
  }

  showCreateEvenementModal.value = true
}

function handleFileChange() {
  // Fichiers ajoutés automatiquement via v-model:file-list
}

function openDevoir(d: any) {
  selectedDevoir.value = d
  showDevoirDetailModal.value = true
}

async function createCourseHandler() {
  await coursFormRef.value?.validate()

  try {
    const formData = new FormData()
    formData.append('nom_cours', coursForm.value.nom_cours)
    formData.append('description_cours', coursForm.value.description_cours || '')

    if (categoryKind.value === 'matiere') {
      formData.append('id_matiere', matiereId)
    } else if (categoryKind.value === 'specialite') {
      formData.append('id_specialite', matiereId)
    } else if (categoryKind.value === 'option') {
      formData.append('id_option', matiereId)
    }

    fileList.value.forEach((file) => {
      if (file.file) formData.append('fichiers', file.file)
    })

    await api.createCours(formData)
    message.success('Cours créé avec succès')
    showCreateCoursModal.value = false
    coursForm.value = { nom_cours: '', description_cours: '', id_matiere_override: null }
    fileList.value = []
    await loadData()
  } catch (err: any) {
    message.error(err.message || 'Erreur lors de la création du cours')
  }
}

async function createDevoirHandler() {
  await devoirFormRef.value?.validate()

  try {
    const formData = new FormData()

    formData.append('nom_devoir', devoirForm.value.nom_devoir)
    formData.append('description_devoir', devoirForm.value.description_devoir || '')

    if (devoirForm.value.date_limite) {
      formData.append('date_limite', new Date(devoirForm.value.date_limite).toISOString())
    }

    formData.append('coefficient', String(devoirForm.value.coefficient || 1))

    const id_cours = devoirForm.value.id_cours ?? cours.value[0]?.id_cours
    if (!id_cours) {
      message.error("Créez d'abord un cours")
      return
    }
    formData.append('id_cours', String(id_cours))

    // fichiers devoir
    devoirFileList.value.forEach((f) => {
      if (f.file) formData.append('fichiers', f.file)
    })

    await api.createDevoir(formData)

    message.success('Devoir créé avec fichiers')
    showCreateDevoirModal.value = false
    devoirFileList.value = []
    await loadData()
  } catch (err: any) {
    message.error(err.message || 'Erreur création devoir')
  }
}

async function createEvenementHandler() {
  await evenementFormRef.value?.validate()

  try {
    // Déterminer quel endpoint utiliser selon la catégorie
    if (categoryKind.value === 'matiere') {
      if (!evenementForm.value.id_matiere) {
        message.error('Veuillez sélectionner une matière')
        return
      }
      await api.createEvenementFromMatiere({
        nom_evenement: evenementForm.value.nom_evenement,
        type_evenement: evenementForm.value.type_evenement,
        date_evenement: evenementForm.value.date_evenement
          ? new Date(evenementForm.value.date_evenement).toISOString()
          : new Date().toISOString(),
        id_matiere: evenementForm.value.id_matiere,
      })
    } else if (categoryKind.value === 'specialite') {
      await api.createEvenementFromSpecialite({
        nom_evenement: evenementForm.value.nom_evenement,
        type_evenement: evenementForm.value.type_evenement,
        date_evenement: evenementForm.value.date_evenement
          ? new Date(evenementForm.value.date_evenement).toISOString()
          : new Date().toISOString(),
        id_specialite: matiereId,
      })
    } else if (categoryKind.value === 'option') {
      await api.createEvenementFromOption({
        nom_evenement: evenementForm.value.nom_evenement,
        type_evenement: evenementForm.value.type_evenement,
        date_evenement: evenementForm.value.date_evenement
          ? new Date(evenementForm.value.date_evenement).toISOString()
          : new Date().toISOString(),
        id_option: matiereId,
      })
    }

    message.success('Événement créé avec succès')
    showCreateEvenementModal.value = false
    evenementForm.value = {
      nom_evenement: '',
      type_evenement: 'Interrogation',
      date_evenement: null,
      id_matiere: null,
    }
    await loadData()
  } catch (err: any) {
    message.error(err.message || "Erreur lors de la création de l'événement")
  }
}

function goToCours(type: string, value: string) {
  router.push({
    path: '/cours',
    query: { type, value },
  })
}

function goToDevoirs() {
  router.push('/devoirs')
}
</script>

<style scoped>
.matiere-layout {
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

.matiere-header {
  background: white;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.header-right {
  display: flex;
  gap: 12px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #1f2937;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f3f4f6;
}

.delete-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  transition: transform 0.15s ease;
}

.delete-btn:hover .delete-icon {
  transform: scale(1.15);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.header-title p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

.item-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #ef4444;
  font-size: 16px;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.edit-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #3b82f6;
  font-size: 16px;
  margin-right: 8px;
}

.edit-btn:hover {
  transform: scale(1.1);
}

.edit-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  transition: transform 0.15s ease;
}

.edit-btn:hover .edit-icon {
  transform: scale(1.15);
}

.matiere-icon-header {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.matiere-icon-header img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.create-btn {
  background: #3b82f6;
  color: #0f172a;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: #2563eb;
}

.matiere-content {
  flex: 1;
  padding: 32px 24px;
  overflow-y: auto;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.section-card.full-width {
  grid-column: 1 / -1;
}

.section-card h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s;
}

.item-card:hover {
  border-color: #3b82f6;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.item-title {
  margin: 0;
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.item-sub {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 13px;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  margin: 4px 0 0 0;
  color: #9ca3af;
  font-size: 12px;
}

.item-badge {
  background: #f0f4ff;
  color: #3b82f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
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
  color: #6b7280;
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

.see-more-btn {
  background: none;
  border: 1px solid #d1d5db;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: #3b82f6;
  font-weight: 600;
  transition: all 0.2s;
}

.see-more-btn:hover {
  background-color: #f3f4f6;
  border-color: #3b82f6;
}

.evenements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.evenement-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.evenement-type {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.evenement-title {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.evenement-date,
.evenement-duree,
.evenement-desc {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 768px) {
  .matiere-layout {
    flex-direction: column;
  }

  .main-wrapper {
    margin-left: 0;
  }

  .matiere-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
