<template>
  <div class="classes-page">
    <Sidebar />

    <div class="classes-content">
      <h1>Mes Classes et Élèves</h1>

      <div v-if="isLoading" class="loading">
        <p>Chargement...</p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="!isLoading && !error" class="classes-container">
        <!-- Classes by specialty -->
        <div v-if="classesBySpeciality.length > 0" class="section">
          <h2>Élèves par classe</h2>
          <div v-for="group in classesBySpeciality" :key="group.classe_name" class="group">
            <h3>{{ group.classe_name }}</h3>
            <div class="students-list">
              <div v-for="student in group.students" :key="student.id_user" class="student-card">
                <div class="student-name">{{ student.prenom }} {{ student.nom }}</div>
                <div class="student-email">{{ student.email }}</div>
                <div v-if="student.specialites?.length > 0" class="student-specialites">
                  <strong>Spécialités:</strong>
                  {{ student.specialites.map((s) => s.nom_specialite).join(', ') }}
                </div>
                <div v-if="student.options?.length > 0" class="student-options">
                  <strong>Options:</strong>
                  {{ student.options.map((o) => o.nom_option).join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Students with same specialties -->
        <div v-if="studentsBySpeciality.length > 0" class="section">
          <h2>Élèves par spécialités</h2>
          <div
            v-for="(spec, specIndex) in studentsBySpeciality.filter(
              (s, i, arr) => arr.findIndex((x) => x.specialite_name === s.specialite_name) === i,
            )"
            :key="spec.specialite_name"
            class="group"
          >
            <h3>{{ spec.specialite_name }}</h3>
            <div
              v-for="levelGroup in studentsBySpeciality.filter(
                (s) => s.specialite_name === spec.specialite_name,
              )"
              :key="`${spec.specialite_name}-${levelGroup.level}`"
              class="level-group"
            >
              <h4>{{ levelGroup.level }}</h4>
              <div class="students-list">
                <div
                  v-for="student in levelGroup.students"
                  :key="student.id_user"
                  class="student-card"
                >
                  <div class="student-name">{{ student.prenom }} {{ student.nom }}</div>
                  <div class="student-class">Classe: {{ student.classe_name || 'N/A' }}</div>
                  <div class="student-email">{{ student.email }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Students with same options -->
        <div v-if="studentsByOption.length > 0" class="section">
          <h2>Élèves par options</h2>
          <div v-for="opt in studentsByOption" :key="opt.option_name" class="group">
            <h3>{{ opt.option_name }}</h3>
            <div class="students-list">
              <div v-for="student in opt.students" :key="student.id_user" class="student-card">
                <div class="student-name">{{ student.prenom }} {{ student.nom }}</div>
                <div class="student-class">Classe: {{ student.classe_name || 'N/A' }}</div>
                <div class="student-email">{{ student.email }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useApi } from '@/composables/useApi'
import Sidebar from '@/components/home/Sidebar.vue'

interface Student {
  id_user: string | number
  nom: string
  prenom: string
  email: string
  id_classe: string | number | null
  classe_name?: string
  specialites: Array<{ id_specialite: string | number; nom_specialite: string }>
  options: Array<{ id_option: string | number; nom_option: string }>
}

interface Classe {
  id_classe: string | number
  nom_classe: string
}

interface Specialite {
  id_specialite: string | number
  nom_specialite: string
}

interface Option {
  id_option: string | number
  nom_option: string
}

interface Profil {
  classes_enseignees?: Classe[]
  specialites_enseignees?: Specialite[]
  options_enseignees?: Option[]
}

const authStore = useAuthStore()
const api = useApi()

const isLoading = ref(true)
const error = ref<string | null>(null)
const allStudents = ref<Student[]>([])
const allClasses = ref<Classe[]>([])
const professorClasses = ref<Classe[]>([])
const professorSpecialities = ref<Specialite[]>([])
const professorOptions = ref<Option[]>([])

// Computed: Students grouped by class (only professor's classes)
const classesBySpeciality = computed(() => {
  const grouped: Array<{ classe_name: string; students: Student[] }> = []

  professorClasses.value.forEach((classe) => {
    const students = allStudents.value.filter(
      (s) => String(s.id_classe) === String(classe.id_classe),
    )
    if (students.length > 0) {
      grouped.push({
        classe_name: classe.nom_classe,
        students,
      })
    }
  })

  return grouped
})

// Helper function to get school level from class name
function getSchoolLevel(className: string): string {
  const lowercaseName = className.toLowerCase()
  if (
    lowercaseName.includes('6ème') ||
    lowercaseName.includes('5ème') ||
    lowercaseName.includes('4ème') ||
    lowercaseName.includes('3ème')
  ) {
    return 'Collège'
  }
  if (lowercaseName.includes('seconde')) {
    return 'Seconde'
  }
  if (lowercaseName.includes('première') || lowercaseName.includes('1ère')) {
    return 'Première'
  }
  if (lowercaseName.includes('terminale') || lowercaseName.includes('tale')) {
    return 'Terminale'
  }
  return 'Autre'
}

// Computed: Students with same specialties as professor
const studentsBySpeciality = computed(() => {
  const grouped: Array<{ specialite_name: string; level: string; students: Student[] }> = []

  professorSpecialities.value.forEach((spec) => {
    const levelMap = new Map<string, Student[]>()

    // Get all students with this specialty
    const allSpecialtyStudents = allStudents.value.filter((s) =>
      s.specialites.some((sp) => String(sp.id_specialite) === String(spec.id_specialite)),
    )

    // Group by level
    allSpecialtyStudents.forEach((student) => {
      const classe = allClasses.value.find((c) => String(c.id_classe) === String(student.id_classe))
      if (classe) {
        const level = getSchoolLevel(classe.nom_classe)
        if (!levelMap.has(level)) {
          levelMap.set(level, [])
        }
        levelMap.get(level)!.push({ ...student, classe_name: classe.nom_classe })
      }
    })

    // Add to grouped array, ordered by level
    const levelOrder = ['Collège', 'Seconde', 'Première', 'Terminale']
    levelOrder.forEach((level) => {
      if (levelMap.has(level)) {
        grouped.push({
          specialite_name: spec.nom_specialite,
          level,
          students: levelMap.get(level)!,
        })
      }
    })
  })

  return grouped
})

// Computed: Students with same options as professor (only from professor's classes)
const studentsByOption = computed(() => {
  const grouped: Array<{ option_name: string; students: Student[] }> = []

  professorOptions.value.forEach((opt) => {
    const students = allStudents.value.filter((s) =>
      s.options.some((o) => String(o.id_option) === String(opt.id_option)),
    )

    if (students.length > 0) {
      grouped.push({
        option_name: opt.nom_option,
        students: students.map((s) => {
          const classe = allClasses.value.find((c) => String(c.id_classe) === String(s.id_classe))
          return { ...s, classe_name: classe?.nom_classe || 'N/A' }
        }),
      })
    }
  })

  return grouped
})

async function loadData() {
  try {
    isLoading.value = true
    error.value = null

    // Get professor's classes, specialties and options
    const profil = (await api.getProfil()) as Profil
    if (profil.classes_enseignees) {
      professorClasses.value = profil.classes_enseignees
    }
    if (profil.specialites_enseignees) {
      professorSpecialities.value = profil.specialites_enseignees
    }
    if (profil.options_enseignees) {
      professorOptions.value = profil.options_enseignees
    }

    // Get all classes
    const classes = (await api.getClasses()) as Classe[]
    allClasses.value = classes

    // Get all students
    const students = (await api.getAllEleves()) as Student[]
    allStudents.value = students
  } catch (err) {
    error.value = 'Erreur lors du chargement des données'
    console.error('Error loading classes data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
* {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
}

.classes-page {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.classes-content {
  flex: 1;
  margin-left: 180px;
  padding: 24px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

h1 {
  color: #205781;
  margin-bottom: 24px;
  font-size: 28px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

h2 {
  color: #205781;
  margin: 24px 0 16px 0;
  font-size: 20px;
  border-bottom: 2px solid #4f959d;
  padding-bottom: 8px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

h3 {
  color: #4f959d;
  font-size: 16px;
  margin-bottom: 12px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.loading,
.error-message {
  padding: 16px;
  text-align: center;
  border-radius: 8px;
  font-size: 14px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.error-message {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.classes-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.section {
  margin-bottom: 32px;
}

.group {
  margin-bottom: 20px;
}

.level-group {
  margin-left: 16px;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #4f959d;
}

.level-group h4 {
  color: #4f959d;
  font-size: 14px;
  margin: 8px 0 12px 0;
  font-weight: 600;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.students-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.student-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.student-card:hover {
  box-shadow: 0 2px 8px rgba(32, 87, 129, 0.15);
  border-color: #4f959d;
}

.student-name {
  font-weight: 600;
  color: #205781;
  margin-bottom: 4px;
}

.student-class,
.student-email {
  font-size: 13px;
  color: #817f7f;
  margin-bottom: 4px;
}

.student-specialites,
.student-options {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .classes-content {
    margin-left: 0;
    padding: 16px;
  }

  .students-list {
    grid-template-columns: 1fr;
  }
}
</style>
