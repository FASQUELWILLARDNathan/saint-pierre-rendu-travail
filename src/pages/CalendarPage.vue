<template>
  <div class="calendar-layout">
    <!-- Sidebar Navigation -->
    <Sidebar />

    <!-- Main Wrapper -->
    <div class="main-wrapper">
      <!-- Header -->
      <header class="calendar-header">
        <div class="header-content">
          <div class="header-title">
            <h1>Calendrier</h1>
            <p>Visualisez tous vos événements à venir</p>
          </div>
        </div>

        <div class="user-info">
          <n-dropdown trigger="click" :options="userMenuOptions" @select="handleUserMenuSelect">
            <div class="user-dropdown">
              <div class="user-avatar">{{ userInitials }}</div>
              <div class="user-details">
                <p class="user-name">{{ userName }}</p>
                <p class="user-class">{{ userClass }}</p>
              </div>
              <span class="dropdown-arrow">▼</span>
            </div>
          </n-dropdown>
        </div>
      </header>

      <!-- Main Content -->
      <main class="calendar-content">
        <!-- Calendar Section -->
        <div class="calendar-section">
          <VCalendar
            v-model="selectedDate"
            is-expanded
            :attributes="calendarAttributes"
            locale="fr"
            color="blue"
            class="calendar"
          />

          <!-- Events for selected date -->
          <div v-if="upcomingEvents.length > 0" class="events-panel">
            <div class="events-list">
              <div
                v-for="event in upcomingEvents"
                :key="String(event.id)"
                class="event-item"
              >
                <div
                  class="event-icon"
                  :style="{
                    backgroundColor: hexToRgba(getMatiereColorAndIcon(event.matiere).color, 0.5),
                  }"
                >
                  <img
                    :src="getMatiereColorAndIcon(event.matiere).icon"
                    :alt="event.matiere"
                    class="icon-img"
                  />
                </div>
                <div class="event-detail">
                  <div class="event-header">
                    <h4>{{ event.titre }}</h4>
                    <span
                      class="event-type-badge"
                      :style="{
                        backgroundColor: getTypeColor(event.type),
                      }"
                    >
                      {{ event.type }}
                    </span>
                  </div>
                  <p class="event-meta">{{ event.matiere }}</p>
                  <p class="event-date">{{ event.date }}</p>
                  <p v-if="event.description" class="event-description">{{ event.description }}</p>
                </div>
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
import { useRouter } from 'vue-router'
import { NDropdown } from 'naive-ui'
import { useAuthStore } from '@/stores/auth.store'
import { useApi } from '@/composables/useApi'
import { hexToRgba } from '@/utils/colors'
import Sidebar from '../components/home/Sidebar.vue'

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

const authStore = useAuthStore()
const router = useRouter()
const api = useApi()

const events = ref<Evenement[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const selectedDate = ref(new Date())
const allMatieres = ref<any[]>([])

// Type color map
const typeColorMap: Record<string, string> = {
  Interrogation: '#1E88E5',
  DS: '#F97316',
  EXAMUN: '#EF4444',
}

// Get color for event type
const getTypeColor = (type: string): string => {
  return typeColorMap[type] || '#70BEFA'
}

// Find matiere color and icon by name (with category mapping)
const getMatiereColorAndIcon = (matiereNom: string): { color: string; icon: string } => {
  if (!allMatieres.value || allMatieres.value.length === 0) {
    return { color: '#888', icon: '/others-icon.svg' }
  }

  const found = allMatieres.value.find(
    (m: any) => m.nom_matiere.toLowerCase() === matiereNom.toLowerCase(),
  )

  if (found) {
    return {
      color: found.couleur ?? '#888',
      icon: found.icon_url ?? '/others-icon.svg',
    }
  }

  return { color: '#888', icon: '/others-icon.svg' }
}

onMounted(async () => {
  try {
    const [eventsData, matieresData] = await Promise.all([
      api.getEvenementsAVenir(),
      api.getAllMatieres(),
    ])

    events.value = Array.isArray(eventsData) ? eventsData : []
    allMatieres.value = Array.isArray(matieresData) ? matieresData : []

    // 🔥 Supprimer les événements passés
    const now = new Date()

    for (const event of events.value) {
      const eventDate = parseEventDate(event.date)

      if (eventDate < now) {
        await api.deleteEvenement(event.id)
      }
    }

    // Recharger les events après suppression
    events.value = events.value.filter((event) => {
      const eventDate = parseEventDate(event.date)
      return eventDate >= now
    })

  } catch (error) {
    console.error('Error loading calendar data:', error)
  }
})


const userMenuOptions = computed(() => {
  const options: any[] = [
    {
      label: 'Profil',
      key: 'profil',
    },
  ]

  if (authStore.user?.role === 'administrateur') {
    options.push({
      label: 'Gestion des élèves',
      key: 'gestion-eleves',
    })
  }

  options.push({
    label: 'Déconnexion',
    key: 'logout',
  })

  return options
})

const userName = computed(() => {
  if (authStore.user?.prenom && authStore.user?.nom) {
    return `${authStore.user.prenom} ${authStore.user.nom}`
  }
  return authStore.user?.username || 'Utilisateur'
})

const userClass = computed(() => {
  const user = authStore.user

  if (!user) return 'Classe non définie'

  if (user.role === 'eleve') {
    return user.eleve?.classe?.nom_classe ?? 'Classe non définie'
  }

  if (user.role === 'professeur') {
    const classes = user.professeur?.classes_enseignees
    if (classes && classes.length > 0) {
      return classes.map((c) => c.classe.nom_classe).join(', ')
    }

    const specialites = user.professeur?.specialites_enseignees
    if (specialites && specialites.length > 0) {
      return specialites.map((s) => s.specialite.nom_specialite).join(', ')
    }

    return user.professeur?.matiere ?? 'Aucune matière'
  }

  return 'Classe non définie'
})

const userInitials = computed(() => {
  const parts = userName.value.split(' ')
  return parts
    .map((p) => p[0])
    .join('')
    .toUpperCase()
})

const handleUserMenuSelect = (key: string) => {
  if (key === 'logout') {
    handleLogout()
  } else if (key === 'profil') {
    router.push('/profil')
  } else if (key === 'gestion-eleves') {
    router.push('/gestion-eleves')
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Parse date from French format string
const parseEventDate = (dateStr: string): Date => {
  // Format: "dd/mm/yyyy, hh:mm"
  const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}),\s(\d{2}):(\d{2})/)
  if (parts && parts.length >= 4) {
    return new Date(parseInt(parts[3]!), parseInt(parts[2]!) - 1, parseInt(parts[1]!))
  }
  return new Date()
}

// Calendar attributes with events and type indicators
const calendarAttributes = computed(() => {
  const attrs: any[] = []
  const eventsByDate: Record<string, Evenement[]> = {}

  // Group events by date using ISO format (YYYY-MM-DD)
  events.value.forEach((event) => {
    const eventDate = parseEventDate(event.date)
    const isoKey = eventDate.toISOString().split('T')[0]

    if (!isoKey) return

    if (!eventsByDate[isoKey]) {
      eventsByDate[isoKey] = []
    }

    eventsByDate[isoKey].push(event)
  })

  // Create attributes with dot indicators
  Object.entries(eventsByDate).forEach(([dateStr, dateEvents]) => {
    if (!dateEvents || dateEvents.length === 0) return

    const [year, month, day] = dateStr.split('-')

    if (!year || !month || !day) return

    const date = new Date(Number(year), Number(month) - 1, Number(day))

    const dots = dateEvents.map((event) => ({
      key: String(event.id),
      color: getTypeColor(event.type).replace('#', ''),
      class: 'event-dot',
    }))

   const firstEventTypeColor = getTypeColor(dateEvents[0]?.type ?? '')

    attrs.push({
      key: dateStr,
      dates: date,
      dots,
      highlight: {
        color: firstEventTypeColor.replace('#', ''),
        fillMode: 'light',
      },
      popover: {
        label: `${dateEvents.length} événement(s)`,
      },
      customData: dateEvents,
    })
  })

  return attrs
})



// Events for selected date
const upcomingEvents = computed(() => {
  const now = new Date()

  return events.value.filter((event) => {
    const eventDate = parseEventDate(event.date)
    return eventDate >= now
  })
})



// Format date for display
const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('fr-FR', options)
}

// Select event date
const selectEventDate = (event: Evenement) => {
  selectedDate.value = parseEventDate(event.date)
}
</script>

<style scoped>
.calendar-layout {
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

.calendar-header {
  background: transparent;
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  box-shadow: none;
  flex-wrap: wrap;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 200px;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-dropdown:hover {
  background: rgba(32, 87, 129, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #205781;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.user-details {
  display: none;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #205781;
  margin: 0;
}

.user-class {
  font-size: 12px;
  color: #817f7f;
  margin: 0;
}

.dropdown-arrow {
  color: #205781;
  font-size: 12px;
  margin-left: 8px;
}

.calendar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.calendar-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.calendar :deep(.vc-container) {
  --accent-600: #205781;
  --accent-500: #2563eb;
}

.events-panel {
  padding: 16px;
  border-left: 1px solid #e5e7eb;
  overflow-y: auto;
  max-height: 500px;
}

.events-panel h3 {
  font-size: 16px;
  font-weight: 600;
  color: #205781;
  margin: 0 0 16px 0;
  text-transform: capitalize;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #205781;
}

.event-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.event-detail {
  flex: 1;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.event-detail h4 {
  font-size: 14px;
  font-weight: 600;
  color: #205781;
  margin: 0 0 4px 0;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.event-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #205781;
  margin: 0;
}

.event-type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  flex-shrink: 0;
}

.event-meta {
  font-size: 12px;
  color: #817f7f;
  margin: 0 0 4px 0;
}

.event-date {
  font-size: 12px;
  color: #205781;
  font-weight: 500;
  margin: 0;
}

.event-description {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.all-events-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.all-events-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 24px 0;
}

.loading,
.error,
.empty {
  padding: 32px;
  text-align: center;
  color: #817f7f;
}

.error {
  color: #dc2626;
  background: #fee2e2;
  border-radius: 8px;
}

.empty {
  color: #059669;
  background: #f0fdf4;
  border-radius: 8px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.event-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.event-card:hover {
  border-color: #205781;
  box-shadow: 0 4px 12px rgba(32, 87, 129, 0.1);
  transform: translateY(-2px);
}

.event-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.event-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.event-titre {
  font-size: 14px;
  font-weight: 600;
  color: #205781;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.event-type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-matiere {
  font-size: 12px;
  color: #817f7f;
  margin: 0;
}

.event-card .event-date {
  font-size: 12px;
  color: #205781;
  font-weight: 500;
  margin: 0;
}

/* Tablette (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .main-wrapper {
    margin-left: 80px;
  }

  .calendar-header {
    padding: 24px 16px;
    gap: 16px;
  }

  .header-title h1 {
    font-size: 32px;
  }

  .header-title p {
    font-size: 14px;
  }

  .user-details {
    display: none;
  }

  .calendar-content {
    padding: 24px 16px;
  }

  .calendar-section {
    grid-template-columns: 1fr;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}

/* Téléphone (< 768px) */
@media (max-width: 767px) {
  .main-wrapper {
    margin-left: 0;
  }

  .calendar-header {
    padding: 16px 12px;
    padding-left: 60px;
    gap: 12px;
    justify-content: flex-end;
  }

  .header-content {
    display: none;
  }

  .header-title h1 {
    font-size: 20px;
  }

  .header-title p {
    font-size: 12px;
  }

  .user-details {
    display: none;
  }

  .user-dropdown {
    padding: 6px 8px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .dropdown-arrow {
    font-size: 10px;
    margin-left: 4px;
  }

  .calendar-content {
    padding: 16px 12px;
    gap: 16px;
  }

  .calendar-section {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .events-panel {
    border-left: none;
    border-top: 1px solid #e5e7eb;
    padding-top: 16px;
    max-height: 300px;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .all-events-section {
    padding: 16px;
  }

  .all-events-section h2 {
    font-size: 16px;
  }
}

/* Petit téléphone (< 480px) */
@media (max-width: 479px) {
  .calendar-header {
    padding: 12px 8px;
  }

  .calendar-content {
    padding: 12px 8px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }

  .calendar-section {
    padding: 12px;
  }

  .all-events-section {
    padding: 12px;
  }

  .event-card-icon {
    width: 48px;
    height: 48px;
  }
}

/* V-Calendar styles */
:deep(.vc-container) {
  border: none;
  background: transparent;
}

:deep(.vc-header) {
  padding: 0 0 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.vc-title) {
  color: #205781;
  font-weight: 700;
}

:deep(.vc-nav) {
  gap: 8px;
}

:deep(.vc-nav-button) {
  color: #205781;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.vc-nav-button:hover) {
  background: #205781;
  color: white;
}

:deep(.vc-weekdays) {
  padding: 12px 0;
}

:deep(.vc-weekday) {
  color: #817f7f;
  font-weight: 600;
  font-size: 12px;
}

:deep(.vc-day) {
  padding: 8px;
}

:deep(.vc-day-content) {
  color: #205781;
  font-weight: 500;
  border-radius: 6px;
}

:deep(.vc-highlight) {
  background: rgba(32, 87, 129, 0.1);
  border-radius: 6px;
}

:deep(.vc-day.vc-highlight .vc-day-content) {
  color: #205781;
  background: rgba(32, 87, 129, 0.2);
}

:deep(.vc-day.selected .vc-day-content) {
  background: #205781;
  color: white;
}

:deep(.vc-dots) {
  display: flex;
  justify-content: center;
  gap: 2px;
  padding: 2px 0;
}

:deep(.vc-dot) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 0 1px;
}

:deep(.vc-popover-content) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: #205781;
  font-weight: 600;
}
</style>
