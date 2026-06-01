<template>
  <div class="matieres-section">
    <h2>Mes catégories</h2>
    <div class="matieres-grid">
      <MatiereCard
        v-for="categorie in categories"
        :key="categorie.id"
        :nom="categorie.nom"
        :icon="categorie.icon"
        :color="categorie.color"
        :card-type="categorie.cardType"
        :category-id="categorie.id"
        :category-type="categorie.categoryType"
        :category-name="categorie.categoryName"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MatiereCard from './MatiereCard.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useApi } from '@/composables/useApi'

const authStore = useAuthStore()
const api = useApi()
const allMatieresBDD = ref<any[]>([])

onMounted(async () => {
  allMatieresBDD.value = (await api.getAllMatieres()) as any
})

const categories = computed(() => {
  const user = authStore.user
  if (!user) return []
  if (allMatieresBDD.value.length === 0) return []

  if (user.role === 'professeur') {
    const result: any[] = []

    // Matière principale
    if (user.professeur?.matiere) {
      const nom = user.professeur.matiere
      const found = allMatieresBDD.value.find(
        (m: any) => m.nom_matiere.toLowerCase() === nom.toLowerCase(),
      )
      if (found) {
        result.push({
          id: found.id_matiere,
          nom,
          icon: found.icon_url ?? '/others-icon.svg',
          color: found.couleur ?? '#888',
          devoirIcon: found.devoir_icon_url ?? '/other-devoir-icon.svg',
          cardType: 'matiere',
          categoryType: 'matiere',
          categoryName: nom,
        })
      }
    }

    // Spécialités — on utilise l'id_specialite du prof
    user.professeur?.specialites_enseignees?.forEach((s) => {
      const nom = s.specialite.nom_specialite
      const found = allMatieresBDD.value.find(
        (m: any) => m.nom_matiere.toLowerCase() === nom.toLowerCase(),
      )
      result.push({
        id: s.specialite.id_specialite,
        nom,
        icon: found?.icon_url ?? '/others-icon.svg',
        color: found?.couleur ?? '#888',
        devoirIcon: found?.devoir_icon_url ?? '/other-devoir-icon.svg',
        cardType: 'specialite',
        categoryType: 'specialite',
        categoryName: nom,
      })
    })

    // Options
    user.professeur?.options_enseignees?.forEach((o) => {
      const nom = o.option.nom_option
      const found = allMatieresBDD.value.find(
        (m: any) => m.nom_matiere.toLowerCase() === nom.toLowerCase(),
      )
      result.push({
        id: o.option.id_option,
        nom,
        icon: found?.icon_url ?? '/others-icon.svg',
        color: found?.couleur ?? '#888',
        devoirIcon: found?.devoir_icon_url ?? '/other-devoir-icon.svg',
        cardType: 'option',
        categoryType: 'option',
        categoryName: nom,
      })
    })

    return result
  }

  if (user.role === 'eleve') {
    const classe = user.eleve?.classe as any
    const baseMatieres =
      classe?.matieres?.map((m: any) => ({
        id: m.matiere.id_matiere,
        nom: m.matiere.nom_matiere,
        icon: m.matiere.icon_url ?? '/others-icon.svg',
        color: m.matiere.couleur ?? '#888',
        devoirIcon: m.matiere.devoir_icon_url ?? '/other-devoir-icon.svg',
        cardType: 'matiere',
        categoryType: 'matiere',
        categoryName: m.matiere.nom_matiere,
      })) ?? []

    const spes = (user.eleve?.specialites ?? []).map((s: any) => {
      const nom = s.specialite.nom_specialite
      const found = allMatieresBDD.value.find(
        (m: any) => m.nom_matiere.toLowerCase() === nom.toLowerCase(),
      )
      return {
        id: s.specialite.id_specialite ?? nom,
        nom,
        icon: found?.icon_url ?? '/others-icon.svg',
        color: found?.couleur ?? '#888',
        devoirIcon: found?.devoir_icon_url ?? '/other-devoir-icon.svg',
        cardType: 'specialite',
        categoryType: 'specialite',
        categoryName: nom,
      }
    })

    const opts = (user.eleve?.options ?? []).map((o: any) => {
      const nom = o.option.nom_option
      const found = allMatieresBDD.value.find(
        (m: any) => m.nom_matiere.toLowerCase() === nom.toLowerCase(),
      )
      return {
        id: o.option.id_option ?? nom,
        nom,
        icon: found?.icon_url ?? '/others-icon.svg',
        color: found?.couleur ?? '#888',
        devoirIcon: found?.devoir_icon_url ?? '/other-devoir-icon.svg',
        cardType: 'option',
        categoryType: 'option',
        categoryName: nom,
      }
    })

    return [...baseMatieres, ...spes, ...opts]
  }

  return []
})
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

/* Tablette 768px-1024px */
@media (max-width: 1024px) {
  .matieres-section {
    padding: 16px;
  }

  .matieres-section h2 {
    font-size: 16px;
    margin: 0 0 16px 0;
  }

  .matieres-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

/* Téléphone < 768px */
@media (max-width: 767px) {
  .matieres-section {
    padding: 16px;
  }

  .matieres-section h2 {
    font-size: 16px;
    margin: 0 0 16px 0;
  }

  .matieres-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

/* Petit téléphone < 480px */
@media (max-width: 479px) {
  .matieres-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style>
