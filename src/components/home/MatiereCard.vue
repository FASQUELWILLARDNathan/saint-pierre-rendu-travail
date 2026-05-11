<template>
  <div class="matiere-card">
    <div class="matiere-icon">
      <img v-if="icon" :src="icon" :alt="nom" />
      <div v-else class="icon-placeholder">📚</div>
    </div>
    <div class="matiere-nom">{{ nom }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  nom: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
})
</script>

<style scoped>
.matiere-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.matiere-card:hover {
  background: #e8eef5;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.matiere-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  flex-shrink: 0;
}

.matiere-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.icon-placeholder {
  font-size: 32px;
}

.matiere-nom {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
}
</style>
