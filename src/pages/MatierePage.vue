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
              <div v-for="c in cours.slice(0, 3)" :key="c.id_cours" class="item-card cours-item">
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
              <div v-for="d in devoirs" :key="d.id_devoir" class="item-card devoir-item">
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
            </div>
          </div>

          <!-- Événements -->
          <div class="section-card full-width">
            <h2>Événements à venir</h2>
            <n-empty v-if="evenements.length === 0" description="Aucun événement" />
            <div v-else class="evenements-grid">
              <div v-for="e in evenements" :key="e.id_evenement" class="evenement-card">
                <div class="evenement-type" :style="{ backgroundColor: iconBg }">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NSpin, NAlert, NEmpty } from 'naive-ui'
import { useApi } from '@/composables/useApi'
import Sidebar from '@/components/home/Sidebar.vue'
import { getMatiereByName } from '@/utils/matieres.ts'

const route = useRoute()
const router = useRouter()
const api = useApi()

const matiereId = route.params.id as string
const categoryKind = computed(() => String(route.query.kind ?? 'matiere'))
const categoryLabel = computed(() => String(route.query.name ?? ''))

const isLoading = ref(true)
const error = ref<string | null>(null)

const matiere = ref<any>(null)
const cours = ref<any[]>([])
const devoirs = ref<any[]>([])
const evenements = ref<any[]>([])

const iconBg = computed(() => {
  const hex = (matiere.value?.couleur ?? '#70BEFA').replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.2)`
})

const categoryTitle = computed(() => {
  if (categoryLabel.value) return categoryLabel.value
  return matiere.value?.nom_matiere ?? 'Catégorie'
})

const categoryDescription = computed(() => {
  if (categoryKind.value === 'matiere') return matiere.value?.description ?? ''
  if (categoryKind.value === 'specialite') return 'Catégorie de spécialité'
  if (categoryKind.value === 'option') return 'Catégorie d’option'
  return matiere.value?.description ?? ''
})

const categoryIcon = computed(() => {
  if (categoryLabel.value) {
    return getMatiereByName(categoryLabel.value)?.icon ?? '/others-icon.svg'
  }
  return matiere.value?.icon_url ?? '/others-icon.svg'
})

onMounted(async () => {
  if (!matiereId || matiereId === 'null') {
    error.value = 'Catégorie introuvable'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true

    if (categoryKind.value === 'matiere') {
      const [coursData, devoirsData, evenementsData] = await Promise.all([
        api.getCoursByMatiere(matiereId) as any,
        api.getDevoirsByMatiere(matiereId) as any,
        api.getEvenementsByMatiere(matiereId) as any,
      ])

      cours.value = coursData
      devoirs.value = devoirsData
      evenements.value = evenementsData

      if (coursData.length > 0) {
        matiere.value = coursData[0].matiere
      } else if (devoirsData.length > 0) {
        matiere.value = devoirsData[0].matiere
      } else if (evenementsData.length > 0) {
        matiere.value = evenementsData[0].matiere
      }
    } else {
      const coursData = (await api.getCoursByCategory(categoryKind.value as any, matiereId)) as any
      cours.value = coursData

      const matiereIds = Array.from(
        new Set(
          coursData
            .map((c: any) => String(c.id_matiere ?? c.matiere?.id_matiere ?? ''))
            .filter((value: string) => value && value !== 'null'),
        ),
      ) as string[]

      const [devoirsArrays, evenementsArrays] = await Promise.all([
        Promise.all(matiereIds.map((id: string) => api.getDevoirsByMatiere(id) as any)),
        Promise.all(matiereIds.map((id: string) => api.getEvenementsByMatiere(id) as any)),
      ])

      devoirs.value = Array.from(
        new Map(devoirsArrays.flat().map((d: any) => [String(d.id_devoir), d])).values(),
      )
      evenements.value = Array.from(
        new Map(evenementsArrays.flat().map((e: any) => [String(e.id_evenement), e])).values(),
      )

      const label = categoryLabel.value || String(matiereId)
      const foundIcon = getMatiereByName(label)
      matiere.value = {
        nom_matiere: label,
        description:
          categoryKind.value === 'specialite' ? 'Catégorie de spécialité' : 'Catégorie d’option',
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
})

function goToCours(type: string, value: string) {
  router.push({
    path: '/cours',
    query: { type, value },
  })
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
  background: transparent;
  padding: 32px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: none;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: #205781;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  width: fit-content;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.7;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.matiere-icon-header {
  width: 56px;
  height: 56px;
  border-radius: 50%;
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

.matiere-icon-header span {
  font-size: 28px;
}

.header-title h1 {
  font-size: 40px;
  font-weight: 700;
  color: #205781;
  margin: 0;
}

.header-title p {
  font-size: 16px;
  color: #817f7f;
  margin: 4px 0 0 0;
}

.matiere-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 32px;
  flex: 1;
  width: 100%;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.section-card h2 {
  font-size: 18px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 20px 0;
}

.full-width {
  grid-column: 1 / -1;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.2s;
}

.item-card:hover {
  background: #eef3f8;
}

.item-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.item-icon span {
  font-size: 20px;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.item-sub {
  font-size: 12px;
  color: #817f7f;
  margin: 0 0 4px 0;
}

.item-meta {
  font-size: 12px;
  color: #205781;
  margin: 0;
}

.item-badge {
  font-size: 11px;
  font-weight: 600;
  color: #205781;
  background: rgba(32, 87, 129, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  align-self: center;
}

.see-more-btn {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(32, 87, 129, 0.1);
  color: #205781;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.see-more-btn:hover {
  background: rgba(32, 87, 129, 0.2);
}

.evenements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.evenement-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: background 0.2s;
}

.evenement-card:hover {
  background: #eef3f8;
}

.evenement-type {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 20px;
  width: fit-content;
  color: #205781;
}

.evenement-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.evenement-date {
  font-size: 12px;
  color: #205781;
  margin: 0;
}

.evenement-duree {
  font-size: 12px;
  color: #817f7f;
  margin: 0;
}

.evenement-desc {
  font-size: 12px;
  color: #817f7f;
  margin: 0;
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
  .matiere-header {
    padding: 16px 12px;
    padding-left: 60px;
  }
  .header-title h1 {
    font-size: 24px;
  }
  .matiere-content {
    padding: 0 12px 24px;
  }
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
