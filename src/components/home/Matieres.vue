<template>
  <div class="matieres-section">
    <h2>Mes matières</h2>
    <div class="matieres-grid">
      <MatiereCard
        v-for="matiere in matieres"
        :key="matiere.id"
        :nom="matiere.nom"
        :icon="matiere.icon"
        :color="matiere.color"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MatiereCard from './MatiereCard.vue'

const matieres = [
  {
    id: 1,
    nom: 'Français',
    icon: '/francais-icon.svg',
    color: '#70BEFA',
  },
  {
    id: 2,
    nom: 'Mathématiques',
    icon: '/maths-icon.svg',
    color: '#0EA304',
  },
  {
    id: 3,
    nom: 'Langues',
    icon: '/langues-icon.svg',
    color: '#FF0000',
  },
  {
    id: 4,
    nom: 'Histoire-Géo',
    icon: '/histoire-geo-icon.svg',
    color: '#FF6600',
  },
  {
    id: 5,
    nom: 'Sciences',
    icon: '/sciences-icon.svg',
    color: '#FF5CF4',
  },
  {
    id: 6,
    nom: 'Technologie',
    icon: '/technologie-icon.svg',
    color: '#95A092',
  },
  {
    id: 7,
    nom: 'Arts Plastiques',
    icon: '/arts-plastiques-icon.svg',
    color: '#00FF73',
  },
  {
    id: 8,
    nom: 'Musique',
    icon: '/musique-icon.svg',
    color: '#5900FF',
  },
  {
    id: 9,
    nom: 'Autres',
    icon: '/others-icon.svg',
    color: '#703603',
  },
]
</script>

<style scoped>
.matieres-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.matieres-section h2 {
  font-size: 18px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 24px 0;
}

.matieres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

@media (min-width: 768px) {
  .matieres-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
