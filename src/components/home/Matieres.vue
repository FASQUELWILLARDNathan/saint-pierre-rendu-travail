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
        :matiere-id="matiere.id"
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

const matieres = computed(() => {
  const user = authStore.user
  if (!user) return []
  if (allMatieresBDD.value.length === 0) return []

  if (user.role === 'professeur') {
    const noms = new Set<string>()
    if (user.professeur?.matiere) noms.add(user.professeur.matiere)
    user.professeur?.specialites_enseignees?.forEach(s => noms.add(s.specialite.nom_specialite))
    user.professeur?.options_enseignees?.forEach(o => noms.add(o.option.nom_option))

    return [...noms].map((nom) => {
      const found = allMatieresBDD.value.find(
        (m: any) => m.nom_matiere.toLowerCase() === nom.toLowerCase()
      )
      return {
        id: found?.id_matiere ?? null,
        nom,
        icon: found?.icon_url ?? '/others-icon.svg',
        color: found?.couleur ?? '#888',
        devoirIcon: found?.devoir_icon_url ?? '/other-devoir-icon.svg',
      }
    })
  }

  if (user.role === 'eleve') {
    const classe = (user.eleve?.classe as any)
    const baseMatieres = classe?.matieres?.map((m: any) => ({
      id: m.matiere.id_matiere,
      nom: m.matiere.nom_matiere,
      icon: m.matiere.icon_url ?? '/others-icon.svg',
      color: m.matiere.couleur ?? '#888',
      devoirIcon: m.matiere.devoir_icon_url ?? '/other-devoir-icon.svg',
    })) ?? []

    const spes = (user.eleve?.specialites ?? []).map((s: any) => {
      const nom = s.specialite.nom_specialite
      const found = allMatieresBDD.value.find(
        (m: any) => m.nom_matiere.toLowerCase() === nom.toLowerCase()
      )
      return {
        id: found?.id_matiere ?? null,
        nom,
        icon: found?.icon_url ?? '/others-icon.svg',
        color: found?.couleur ?? '#888',
        devoirIcon: found?.devoir_icon_url ?? '/other-devoir-icon.svg',
      }
    })

    return [...baseMatieres, ...spes]
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
