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
import { MATIERES } from '@/utils/matieres'
import MatiereCard from './MatiereCard.vue'

const matieres = MATIERES
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
