<template>
  <div class="travaux-recents-section" :class="{ 'dark-mode': isDarkMode }">
    <div class="section-header">
      <h2>Travaux à rendre</h2>
      <router-link v-if="travaux.length > 3" to="/devoirs" class="voir-tout">
        Voir Tous
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading">
      <p>Chargement des travaux...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>⚠️ {{ error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="travaux.length === 0" class="empty">
      <p>✓ Aucun travail à rendre!</p>
    </div>

    <!-- Travaux list -->
    <div v-else class="travaux-list">
      <div
        v-for="travail in travaux.slice(0, 3)"
        :key="String(travail.id)"
        class="travail-item"
        @click="handleTravailClick(travail)"
      >
        <div
          class="travail-icon"
          :style="{
            backgroundColor: hexToRgba(travail.matiereColor, 0.5),
          }"
        >
          <img :src="travail.matiereIcon" :alt="travail.matiere" class="icon-img" />
        </div>

        <div class="travail-info">
          <h3 class="travail-titre">{{ travail.titre }}</h3>
          <p class="travail-matiere">{{ travail.matiere }}</p>
          <p class="travail-date">Date limite: {{ travail.dateLimit }}</p>
        </div>

        <button class="btn-action" :class="{ 'btn-prof': !isEleve }">
          {{ isEleve ? 'Rendre' : 'Rendus' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth.store'
import { hexToRgba } from '@/utils/colors'

interface Props {
  isDarkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDarkMode: false,
})

interface Travail {
  id: string
  titre: string
  matiere: string
  dateLimit: string
  description?: string
  matiereColor: string
  matiereIcon?: string
}

const api = useApi()
const router = useRouter()
const authStore = useAuthStore()
const travaux = ref<Travail[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const isEleve = computed(() => authStore.user?.role === 'eleve')

const handleTravailClick = async (travail: Travail) => {
  // Navigate to devoirs page with focus on this specific devoir
  await router.push({
    path: '/devoirs',
    query: { focus: String(travail.id) },
  })
}

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    travaux.value = (await api.getTravauxARendreRecents()) as Travail[]
  } catch (err) {
    error.value = 'Impossible de charger les travaux. Veuillez réessayer.'
    console.error('Erreur lors du chargement des travaux:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.travaux-recents-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.travaux-recents-section.dark-mode {
  background: #2d2d2d;
  border: 1px solid rgba(100, 181, 246, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #205781;
  margin: 0;
  transition: all 0.3s ease;
}

.travaux-recents-section.dark-mode .section-header h2 {
  color: #64b5f6;
}

.voir-tout {
  color: #4f959d;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.travaux-recents-section.dark-mode .voir-tout {
  color: #64b5f6;
}

.voir-tout:hover {
  text-decoration: underline;
}

.loading,
.error,
.empty {
  padding: 20px;
  text-align: center;
  color: #666;
  transition: all 0.3s ease;
}

.travaux-recents-section.dark-mode .loading,
.travaux-recents-section.dark-mode .error,
.travaux-recents-section.dark-mode .empty {
  color: #b0b0b0;
}

.loading {
  font-style: italic;
}

.error {
  color: #d9534f;
  background: #fadbd8;
  border-radius: 8px;
  border: 1px solid #f5b7b1;
}

.travaux-recents-section.dark-mode .error {
  color: #ff7f5c;
  background: rgba(255, 127, 92, 0.1);
  border: 1px solid rgba(255, 127, 92, 0.3);
}

.empty {
  color: #27ae60;
  background: #d5f4e6;
  border-radius: 8px;
  border: 1px solid #abebc6;
}

.travaux-recents-section.dark-mode .empty {
  color: #5fd99a;
  background: rgba(95, 217, 154, 0.1);
  border: 1px solid rgba(95, 217, 154, 0.3);
}

.travaux-list {
  display: grid;
  gap: 16px;
}

.travail-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.travail-item:hover {
  background: #e8eef5;
}

.travaux-recents-section.dark-mode .travail-item {
  background: #3a3a3a;
  border: 1px solid rgba(100, 181, 246, 0.1);
}

.travaux-recents-section.dark-mode .travail-item:hover {
  background: #454545;
  border: 1px solid rgba(100, 181, 246, 0.2);
}

.travail-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.travail-info {
  flex: 1;
  min-width: 0;
}

.travail-titre {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  word-break: break-word;
  transition: all 0.3s ease;
}

.travaux-recents-section.dark-mode .travail-titre {
  color: #e0e0e0;
}

.travail-matiere {
  font-size: 12px;
  color: #666;
  margin: 0 0 4px 0;
  transition: all 0.3s ease;
}

.travaux-recents-section.dark-mode .travail-matiere {
  color: #b0b0b0;
}

.travail-date {
  font-size: 12px;
  color: #d9534f;
  margin: 0;
  font-weight: 500;
  transition: all 0.3s ease;
}

.travaux-recents-section.dark-mode .travail-date {
  color: #ff7f5c;
}

.btn-action {
  padding: 8px 24px;
  background: #4f959d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background: #3d7a84;
  transform: translateY(-2px);
}

.btn-action.btn-prof {
  background: #10b981;
}

.btn-action.btn-prof:hover {
  background: #059669;
}

/* Tablette 768px-1024px */
@media (max-width: 1024px) {
  .travaux-recents-section {
    padding: 16px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-header h2 {
    font-size: 16px;
  }

  .voir-tout {
    font-size: 14px;
  }

  .travail-item {
    gap: 12px;
    padding: 12px;
  }

  .travail-icon {
    width: 44px;
    height: 44px;
  }

  .icon-img {
    width: 28px;
    height: 28px;
  }

  .btn-rendre {
    padding: 6px 16px;
    font-size: 12px;
  }
}

/* Téléphone < 768px */
@media (max-width: 767px) {
  .travaux-recents-section {
    padding: 16px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-header h2 {
    font-size: 16px;
    flex: 1;
  }

  .voir-tout {
    font-size: 12px;
  }

  .travail-item {
    gap: 12px;
    padding: 12px;
    flex-wrap: wrap;
  }

  .travail-icon {
    width: 40px;
    height: 40px;
  }

  .icon-img {
    width: 24px;
    height: 24px;
  }

  .travail-info {
    flex: 1 1 100%;
    min-width: 200px;
  }

  .btn-rendre {
    padding: 6px 16px;
    font-size: 12px;
    flex: 1 1 auto;
  }
}

/* Petit téléphone < 480px */
@media (max-width: 479px) {
  .travaux-recents-section {
    padding: 12px;
  }

  .travail-item {
    gap: 8px;
    padding: 8px;
  }

  .travail-titre {
    font-size: 13px;
  }

  .travail-icon {
    width: 36px;
    height: 36px;
  }

  .icon-img {
    width: 20px;
    height: 20px;
  }

  .btn-rendre {
    padding: 4px 12px;
    font-size: 11px;
  }
}
</style>
