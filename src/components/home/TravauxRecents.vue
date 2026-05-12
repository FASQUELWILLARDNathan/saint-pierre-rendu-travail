<template>
  <div class="travaux-recents-section">
    <div class="section-header">
      <h2>Travaux récents à rendre</h2>
      <router-link to="/travaux" class="voir-tout">Voir Tout</router-link>
    </div>

    <div class="travaux-list">
      <div v-for="travail in travaux" :key="travail.id" class="travail-item">
        <div
          class="travail-icon"
          :style="{
            backgroundColor: `rgba(${hexToRgb(getTravailStyles(travail.matiere).backgroundColor)}, 0.2)`,
          }"
        >
          <img
            :src="getTravailStyles(travail.matiere).icon"
            :alt="travail.matiere"
            class="icon-img"
          />
        </div>

        <div class="travail-info">
          <h3 class="travail-titre">{{ travail.titre }}</h3>
          <p class="travail-matiere">{{ travail.matiere }}</p>
          <p class="travail-date">Date limite: {{ travail.dateLimit }}</p>
        </div>

        <button class="btn-rendre">Rendre</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getMatiereByName } from '@/utils/matieres'

const travaux = [
  {
    id: 1,
    titre: 'Exercices sur les équations',
    matiere: 'Mathématiques',
    dateLimit: '11/05/2026 23:00:00',
  },
  {
    id: 2,
    titre: 'Analyse de texte: Victor Hugo',
    matiere: 'Français',
    dateLimit: '11/05/2026 23:55:00',
  },
  {
    id: 3,
    titre: 'Vocabulary: Unit 5',
    matiere: 'Langues',
    dateLimit: '12/05/2026 16:00:00',
  },
  {
    id: 4,
    titre: 'Etude de document: La révolution',
    matiere: 'Histoire-Géo',
    dateLimit: '11/05/2026 23:55:00',
  },
  {
    id: 5,
    titre: 'Le vivant et son évolution',
    matiere: 'Sciences',
    dateLimit: '12/05/2026 09:00:00',
  },
  {
    id: 6,
    titre: 'Temps course',
    matiere: 'Autres',
    dateLimit: '11/05/2026 14:55:00',
  },
]

const getTravailStyles = (matiere: string) => {
  const matiereInfo = getMatiereByName(matiere)
  return {
    icon: matiereInfo?.devoirIcon || '/other-devoir-icon.svg',
    backgroundColor: matiereInfo?.color || '#CCCCCC',
  }
}

const hexToRgb = (hex?: string): string => {
  if (!hex) return '0, 0, 0'

  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)

  if (!match) return '0, 0, 0'

  const [, r, g, b] = match

  return `${parseInt(r!, 16)}, ${parseInt(g!, 16)}, ${parseInt(b!, 16)}`
}
</script>

<style scoped>
.travaux-recents-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
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
}

.travail-item:hover {
  background: #e8eef5;
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
}

.travail-matiere {
  font-size: 12px;
  color: #666;
  margin: 0 0 4px 0;
}

.travail-date {
  font-size: 12px;
  color: #d9534f;
  margin: 0;
  font-weight: 500;
}

.btn-rendre {
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

.btn-rendre:hover {
  background: #3d7a84;
  transform: translateY(-2px);
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
