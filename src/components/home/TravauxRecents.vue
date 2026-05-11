<template>
  <div class="travaux-recents-section">
    <div class="section-header">
      <h2>Travaux récents à rendre</h2>
      <router-link to="/travaux" class="voir-tout">Voir Tout</router-link>
    </div>

    <div class="travaux-list">
      <div v-for="travail in travaux" :key="travail.id" class="travail-item">
        <div class="travail-icon" :class="`icon-${travail.couleur}`">
          <img :src="travail.icon" :alt="travail.matiere" class="icon-img" />
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
const travaux = [
  {
    id: 1,
    titre: 'Exercices sur les équations',
    matiere: 'Mathématiques',
    dateLimit: '11/05/2026 23:00:00',
    icon: '/maths-devoir-icon.svg',
    couleur: 'green',
  },
  {
    id: 2,
    titre: 'Analyse de texte: Victor Hugo',
    matiere: 'Français',
    dateLimit: '11/05/2026 23:55:00',
    icon: '/francais-devoir-icon.svg',
    couleur: 'blue',
  },
  {
    id: 3,
    titre: 'Vocabulary: Unit 5',
    matiere: 'Anglais',
    dateLimit: '12/05/2026 16:00:00',
    icon: '/anglais-devoir-icon.svg',
    couleur: 'red',
  },
  {
    id: 4,
    titre: 'Etude de document: La révolution',
    matiere: 'Histoire',
    dateLimit: '11/05/2026 23:55:00',
    icon: '/histoire-geo-devoir-icon.svg',
    couleur: 'orange',
  },
  {
    id: 5,
    titre: 'Le vivant et son évolution',
    matiere: 'SVT',
    dateLimit: '12/05/2026 09:00:00',
    icon: '/sciences-devoir-icon.svg',
    couleur: 'purple',
  },
  {
    id: 6,
    titre: 'Temps course',
    matiere: 'EPS',
    dateLimit: '11/05/2026 14:55:00',
    icon: '/other-devoir-icon.svg',
    couleur: 'orange-light',
  },
]
</script>

<style scoped>
.travaux-recents-section {
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

.icon-green {
  background: #d4edda;
}

.icon-blue {
  background: #cfe2ff;
}

.icon-red {
  background: #f8d7da;
}

.icon-orange {
  background: #fff3cd;
}

.icon-orange-light {
  background: #ffe5b4;
}

.icon-purple {
  background: #e2d5f3;
}

.travail-info {
  flex: 1;
}

.travail-titre {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
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
  transition: all 0.3s ease;
}

.btn-rendre:hover {
  background: #3d7a84;
  transform: translateY(-2px);
}
</style>
