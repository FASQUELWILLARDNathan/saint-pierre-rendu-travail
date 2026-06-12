<template>
  <div class="matiere-card" :class="{ 'dark-mode': isDarkMode }" @click="goToMatiere">
    <div class="matiere-icon" :style="{ backgroundColor: iconBackgroundColor }">
      <img v-if="icon" :src="icon" :alt="nom" />
      <div v-else class="icon-placeholder">📚</div>
    </div>
    <div class="matiere-nom">{{ nom }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

type CardType = 'matiere' | 'specialite' | 'option'

const props = defineProps({
  nom: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
  color: {
    type: String,
    default: '#70BEFA',
  },
  cardType: {
    type: String,
    default: 'matiere',
  },
  categoryId: {
    type: [String, Number],
    default: null,
  },
  categoryType: {
    type: String,
    default: 'matiere',
  },
  categoryName: {
    type: String,
    default: null,
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()

const goToMatiere = () => {
  if (props.categoryId !== null && props.categoryId !== undefined) {
    router.push({
      path: `/categorie/${props.categoryId}`,
      query: {
        kind: props.categoryType,
        name: props.categoryName ?? props.nom,
      },
    })
    return
  }
}

const iconBackgroundColor = computed(() => {
  // Convertir hex en rgb avec opacité 50%
  const hex = props.color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.5)`
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

.matiere-card.dark-mode {
  background: #3a3a3a;
  border: 1px solid rgba(100, 181, 246, 0.15);
}

.matiere-card.dark-mode:hover {
  background: #454545;
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.15);
  transform: translateY(-4px);
}

.matiere-card.dark-mode .matiere-icon {
  background: rgba(100, 181, 246, 0.1);
  border: 1px solid rgba(100, 181, 246, 0.2);
}

.matiere-card.dark-mode .matiere-nom {
  color: #e0e0e0;
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
  word-break: break-word;
}

/* Tablette 768px-1024px */
@media (max-width: 1024px) {
  .matiere-card {
    padding: 16px 12px;
    gap: 10px;
  }

  .matiere-icon {
    width: 52px;
    height: 52px;
  }

  .matiere-icon img {
    width: 32px;
    height: 32px;
  }

  .icon-placeholder {
    font-size: 28px;
  }

  .matiere-nom {
    font-size: 12px;
  }
}

/* Téléphone < 768px */
@media (max-width: 767px) {
  .matiere-card {
    padding: 16px 12px;
    gap: 10px;
  }

  .matiere-icon {
    width: 48px;
    height: 48px;
  }

  .matiere-icon img {
    width: 28px;
    height: 28px;
  }

  .icon-placeholder {
    font-size: 24px;
  }

  .matiere-nom {
    font-size: 12px;
  }
}

/* Petit téléphone < 480px */
@media (max-width: 479px) {
  .matiere-card {
    padding: 12px 8px;
    gap: 8px;
  }

  .matiere-icon {
    width: 44px;
    height: 44px;
  }

  .matiere-icon img {
    width: 24px;
    height: 24px;
  }

  .icon-placeholder {
    font-size: 20px;
  }

  .matiere-nom {
    font-size: 11px;
  }
}
</style>
