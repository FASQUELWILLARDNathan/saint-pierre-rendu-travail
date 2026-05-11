<template>
  <div class="travaux-a-venir-section">
    <div class="section-header">
      <h2>À venir</h2>
      <router-link to="/calendrier" class="voir-tout">Voir Tout</router-link>
    </div>

    <div class="travaux-coming">
      <div v-for="event in events" :key="event.id" class="event-card">
        <div class="event-icon" :class="`icon-${event.couleur}`">
          <img :src="event.icon" :alt="event.titre" class="icon-img" />
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
const events = [
  {
    id: 1,
    titre: 'Interrogation conjugaison',
    date: '19/05/2026 11h00',
    icon: '/francais-devoir-icon.svg',
    couleur: 'blue',
  },
  {
    id: 2,
    titre: 'Interrogation fonctions',
    date: '19/05/2026 13h00',
    icon: '/maths-devoir-icon.svg',
    couleur: 'green',
  },
  {
    id: 3,
    titre: 'Interrogation irregular verbs',
    date: '19/05/2026 13h00',
    icon: '/anglais-devoir-icon.svg',
    couleur: 'red',
  },
]
</script>

<style scoped>
.travaux-a-venir-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

.icon-blue {
  background: #cfe2ff;
}

.icon-green {
  background: #d4edda;
}

.icon-red {
  background: #f8d7da;
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
