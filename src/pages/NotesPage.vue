<template>
  <div class="notes-layout">
    <Sidebar />
    <div class="main-wrapper">
      <header class="notes-header">
        <div class="header-title">
          <h1>Mes notes</h1>
          <p>Résultats et retours de vos devoirs</p>
        </div>
      </header>

      <main class="notes-content">
        <n-spin v-if="isLoading">
          <template #description>Chargement...</template>
        </n-spin>

        <n-alert v-else-if="error" type="error">{{ error }}</n-alert>

        <div v-else class="notes-container">
          <!-- Moyenne générale -->
          <div class="moyenne-card" v-if="moyenne !== null">
            <div class="moyenne-circle">
              <span class="moyenne-value">{{ moyenne.toFixed(2) }}</span>
              <span class="moyenne-label">/ 20</span>
            </div>
            <div class="moyenne-info">
              <p class="moyenne-title">Moyenne générale</p>
              <p class="moyenne-sub">{{ rendus.length }} devoir(s) noté(s)</p>
            </div>
          </div>

          <n-empty v-if="rendus.length === 0" description="Aucune note pour l'instant" />

          <!-- Notes par matière -->
          <div v-else class="notes-par-matiere">
            <div
              v-for="group in notesParMatiere"
              :key="group.matiere"
              class="matiere-group"
            >
              <div class="matiere-group-header">
                <div class="matiere-icon" :style="{ backgroundColor: getColor(group.couleur) }">
                  <img v-if="group.icon" :src="group.icon" alt="" />
                  <span v-else>📚</span>
                </div>
                <div>
                  <h3>{{ group.matiere }}</h3>
                  <p>Moyenne : {{ group.moyenne.toFixed(2) }} / 20</p>
                </div>
              </div>

              <div class="notes-list">
                <div
                  v-for="rendu in group.rendus"
                  :key="rendu.id_rendu"
                  class="note-card"
                  @click="openRendu(rendu)"
                >
                  <div class="note-info">
                    <p class="note-devoir">{{ rendu.devoir?.nom_devoir }}</p>
                    <p class="note-cours">{{ rendu.devoir?.cours?.nom_cours }}</p>
                    <p class="note-date">{{ formatDate(rendu.date_rendu) }}</p>
                  </div>
                  <div class="note-value-container">
                    <span class="note-value" :class="getNoteClass(rendu.note)">
                      {{ rendu.note }}
                    </span>
                    <span class="note-sur">/20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal détail note -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="selectedRendu?.devoir?.nom_devoir"
      style="max-width: 600px"
    >
      <div v-if="selectedRendu" class="rendu-detail">
        <div class="detail-meta">
          <span class="meta-badge">{{ selectedRendu.devoir?.matiere?.nom_matiere }}</span>
          <span class="meta-badge" v-if="selectedRendu.devoir?.cours">
            {{ selectedRendu.devoir.cours.nom_cours }}
          </span>
        </div>

        <div class="note-grande" v-if="selectedRendu.note">
          <span class="note-grande-value" :class="getNoteClass(selectedRendu.note)">
            {{ selectedRendu.note }}
          </span>
          <span class="note-grande-label">/ 20</span>
        </div>

        <div class="retour-section" v-if="selectedRendu.retour">
          <h4>Retour du professeur</h4>
          <p class="retour-texte">{{ selectedRendu.retour }}</p>
        </div>

        <div v-if="selectedRendu.pieces_jointes?.length > 0" class="fichiers-section">
          <h4>Fichiers rendus</h4>
          <a
            v-for="pj in selectedRendu.pieces_jointes"
            :key="pj.id_piece_jointe"
            :href="`${apiBase}/public${pj.chemin_fichier}`"
            target="_blank"
            class="fichier-link"
          >
            <span>{{ getFileIcon(pj.type_fichier) }}</span>
            <span>{{ pj.nom_fichier }}</span>
            <span class="fichier-size">{{ formatSize(Number(pj.taille_octets)) }}</span>
          </a>
        </div>

        <p class="rendu-date">
          Rendu le {{ formatDate(selectedRendu.date_rendu) }}
        </p>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NSpin, NAlert, NEmpty, NModal } from 'naive-ui'
import { useApi } from '@/composables/useApi'
import Sidebar from '@/components/home/Sidebar.vue'

const api = useApi()
const apiBase = import.meta.env.VITE_API_URL

const isLoading = ref(true)
const error = ref<string | null>(null)
const showDetailModal = ref(false)
const selectedRendu = ref<any>(null)
const rendus = ref<any[]>([])

const toNumber = (v: any) => {
  const n = Number(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

const moyenne = computed(() => {
  const notes = rendus.value.filter(r => r.note !== null)

  const total = notes.reduce((sum, r) => {
    return sum + toNumber(r.note) * toNumber(r.devoir?.coefficient)
  }, 0)

  const totalCoef = notes.reduce((sum, r) => {
    return sum + toNumber(r.devoir?.coefficient)
  }, 0)

  return totalCoef === 0 ? null : total / totalCoef
})

const notesParMatiere = computed(() => {
  const grouped = new Map<string, any>()

  rendus.value.forEach((r) => {
    const nom =
    r.devoir?.cours?.matiere?.nom_matiere ??
    r.devoir?.cours?.specialite?.nom_specialite ??
    r.devoir?.cours?.option?.nom_option ??
    r.devoir?.cours?.nom_cours ??
    'Autre'

    if (!grouped.has(nom)) {
      grouped.set(nom, {
        matiere: nom,
        couleur: r.devoir?.matiere?.couleur ?? null,
        icon: r.devoir?.matiere?.icon_url ?? null,
        rendus: [],
      })
    }

    grouped.get(nom).rendus.push(r)
  })

  return Array.from(grouped.values()).map((g) => {
    const notesValides = g.rendus.filter((r: any) => r.note !== null)

    const total = notesValides.reduce((sum: number, r: any) => {
      const coef = r.devoir?.coefficient ?? 1
      return sum + Number(r.note) * coef
    }, 0)

    const totalCoef = notesValides.reduce((sum: number, r: any) => {
      return sum + (r.devoir?.coefficient ?? 1)
    }, 0)

    return {
      ...g,
      moyenne: totalCoef === 0 ? 0 : total / totalCoef,
    }
  })
})

onMounted(async () => {
  try {
    isLoading.value = true
    rendus.value = (await api.getMesNotes()) as any
  } catch (err) {
    error.value = 'Erreur lors du chargement'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

function openRendu(rendu: any) {
  selectedRendu.value = rendu
  showDetailModal.value = true
}

function getNoteClass(note: number | string | null) {
  const n = Number(note)
  if (n >= 16) return 'tres-bien'
  if (n >= 14) return 'bien'
  if (n >= 10) return 'passable'
  return 'insuffisant'
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
    day: '2-digit', month: 'long', year: 'numeric'
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
</script>

<style scoped>
.notes-layout {
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

.notes-header {
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

.notes-content {
  padding: 0 24px 32px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.notes-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.moyenne-card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.moyenne-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #205781, #4a90d9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.moyenne-value {
  font-size: 22px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.moyenne-label {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
}

.moyenne-title {
  font-size: 18px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 4px 0;
}

.moyenne-sub {
  font-size: 13px;
  color: #817f7f;
  margin: 0;
}

.notes-par-matiere {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.matiere-group {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.matiere-group-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.matiere-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.matiere-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.matiere-group-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 4px 0;
}

.matiere-group-header p {
  font-size: 13px;
  color: #817f7f;
  margin: 0;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.note-card:hover { background: #eef3f8; }

.note-devoir {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 2px 0;
}

.note-cours {
  font-size: 12px;
  color: #817f7f;
  margin: 0 0 2px 0;
}

.note-date {
  font-size: 11px;
  color: #b0b0b0;
  margin: 0;
}

.note-value-container {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
}

.note-value {
  font-size: 24px;
  font-weight: 700;
}

.note-value.tres-bien { color: #10b981; }
.note-value.bien { color: #3b82f6; }
.note-value.passable { color: #f59e0b; }
.note-value.insuffisant { color: #ef4444; }

.note-sur { font-size: 14px; color: #817f7f; }

.rendu-detail { padding: 8px 0; }

.detail-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.meta-badge {
  background: rgba(32,87,129,0.1);
  color: #205781;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.note-grande {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 20px;
}

.note-grande-value {
  font-size: 56px;
  font-weight: 700;
}

.note-grande-label { font-size: 24px; color: #817f7f; }

.retour-section h4 {
  font-size: 14px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 8px 0;
}

.retour-texte {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.fichiers-section h4 {
  font-size: 14px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 8px 0;
}

.fichier-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  color: #1a1a1a;
  margin-bottom: 6px;
  transition: background 0.2s;
}

.fichier-link:hover { background: #eef3f8; }
.fichier-size { margin-left: auto; color: #817f7f; font-size: 11px; }

.rendu-date {
  font-size: 12px;
  color: #817f7f;
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .main-wrapper { margin-left: 80px; }
  .header-title h1 { font-size: 32px; }
}

@media (max-width: 767px) {
  .main-wrapper { margin-left: 0; }
  .notes-header { padding: 16px 12px; padding-left: 60px; }
  .notes-content { padding: 0 12px 24px; }
}
</style>