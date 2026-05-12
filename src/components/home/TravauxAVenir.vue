<template>
  <div class="travaux-a-venir-section">
    <div class="section-header">
      <h2>À venir</h2>
      <router-link to="/calendrier" class="voir-tout">Voir Tout</router-link>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading">
      <p>Chargement des événements...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>⚠️ {{ error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="events.length === 0" class="empty">
      <p>✓ Aucun événement prévu!</p>
    </div>

    <!-- Events list -->
    <div v-else class="travaux-coming">
      <div v-for="event in events" :key="String(event.id)" class="event-card">
        <div
          class="event-icon"
          :style="{
            backgroundColor: hexToRgba(event.matiereColor, 0.5),
          }"
        >
          <img :src="event.matiereIcon" :alt="event.matiere" class="icon-img" />
        </div>
        <div class="event-info">
          <h4 class="event-titre">{{ event.titre }}</h4>
          <p class="event-date">{{ event.date }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { hexToRgba } from '@/utils/colors'

interface Evenement {
  id: string
  titre: string
  matiere: string
  date: string
  description?: string
  type: string
  duree?: number
  matiereColor: string
  matiereIcon?: string
}

const api = useApi()
const events = ref<Evenement[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    events.value = (await api.getEvenementsAVenir()) as Evenement[]
  } catch (err) {
    error.value = 'Impossible de charger les événements. Veuillez réessayer.'
    console.error('Erreur lors du chargement des événements:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.travaux-a-venir-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 0;
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
}

.voir-tout {
  color: #4f959d;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
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

.empty {
  color: #27ae60;
  background: #d5f4e6;
  border-radius: 8px;
  border: 1px solid #abebc6;
}

.travaux-coming {
  display: grid;
  gap: 12px;
}

.event-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.event-card:hover {
  background: #e8eef5;
  transform: translateX(4px);
}

.event-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.event-info {
  flex: 1;
  min-width: 0;
}

.event-titre {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  word-break: break-word;
}

.event-date {
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* Tablette 768px-1024px */
@media (max-width: 1024px) {
  .travaux-a-venir-section {
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

  .event-card {
    gap: 12px;
    padding: 10px 12px;
  }

  .event-icon {
    width: 40px;
    height: 40px;
  }

  .icon-img {
    width: 24px;
    height: 24px;
  }

  .event-titre {
    font-size: 13px;
  }
}

/* Téléphone < 768px */
@media (max-width: 767px) {
  .travaux-a-venir-section {
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

  .event-card {
    gap: 12px;
    padding: 10px 12px;
  }

  .event-icon {
    width: 36px;
    height: 36px;
  }

  .icon-img {
    width: 20px;
    height: 20px;
  }

  .event-titre {
    font-size: 13px;
  }
}

/* Petit téléphone < 480px */
@media (max-width: 479px) {
  .travaux-a-venir-section {
    padding: 12px;
  }

  .event-card {
    gap: 8px;
    padding: 8px;
  }

  .event-icon {
    width: 32px;
    height: 32px;
  }

  .icon-img {
    width: 18px;
    height: 18px;
  }

  .event-titre {
    font-size: 12px;
  }

  .event-date {
    font-size: 11px;
  }
}

.voir-tout:hover {
  text-decoration: underline;
}

.travaux-coming {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.event-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.event-card:hover {
  background: #e8eef5;
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.event-info {
  flex: 1;
}

.event-titre {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.event-date {
  font-size: 12px;
  color: #666;
  margin: 0;
}
</style>
