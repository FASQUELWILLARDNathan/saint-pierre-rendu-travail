<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-left">
          <span class="header-icon">👥</span>
          <div>
            <h2>Sélectionner les destinataires</h2>
            <p>Filtrez par rôle, classe ou matière</p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Role filter -->
        <div class="filter-section">
          <label class="filter-label">Rôle</label>
          <div class="role-pills">
            <button
              v-for="role in roles"
              :key="role.value"
              class="role-pill"
              :class="[`pill-${role.value}`, { active: selectedRole === role.value }]"
              @click="selectRole(role.value)"
            >
              {{ role.icon }} {{ role.label }}
            </button>
          </div>
        </div>

        <!-- Sub-filters -->
        <transition name="slide-down">
          <div v-if="selectedRole !== 'all'" class="sub-filters">
            <!-- Filtre classe (élèves) -->
            <div v-if="selectedRole === 'eleve'" class="filter-group">
              <label class="filter-label">Niveau</label>
              <select v-model="selectedNiveau" class="filter-select">
                <option value="">Tous les niveaux</option>
                <option v-for="n in availableNiveaux" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
            <div v-if="selectedRole === 'eleve'" class="filter-group">
              <label class="filter-label">Classe</label>
              <select v-model="selectedClasse" class="filter-select">
                <option value="">Toutes les classes</option>
                <option v-for="c in availableClasses" :key="c.id_classe" :value="String(c.id_classe)">
                  {{ c.nom_classe }}
                </option>
              </select>
            </div>
            <!-- Filtre spécialité (élèves) -->
            <div v-if="selectedRole === 'eleve'" class="filter-group">
              <label class="filter-label">Spécialité</label>
              <select v-model="selectedSpe" class="filter-select">
                <option value="">Toutes les spécialités</option>
                <option v-for="s in availableSpecialites" :key="s.id_specialite" :value="String(s.id_specialite)">
                  {{ s.nom_specialite }}
                </option>
              </select>
            </div>
            <!-- Filtre option (élèves) -->
            <div v-if="selectedRole === 'eleve'" class="filter-group">
              <label class="filter-label">Option</label>
              <select v-model="selectedOption" class="filter-select">
                <option value="">Toutes les options</option>
                <option v-for="o in availableOptions" :key="o.id_option" :value="String(o.id_option)">
                  {{ o.nom_option }}
                </option>
              </select>
            </div>
            <!-- Filtre matière (profs) -->
            <div v-if="selectedRole === 'professeur'" class="filter-group">
              <label class="filter-label">Matière</label>
              <select v-model="selectedMatiere" class="filter-select">
                <option value="">Toutes les matières</option>
                <option v-for="m in availableMatieres" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>
        </transition>

        <!-- Search -->
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Rechercher par nom ou email..."
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
        </div>

        <!-- Results header -->
        <div class="results-header">
          <span class="results-count">
            {{ filteredUsers.length }} résultat{{ filteredUsers.length > 1 ? 's' : '' }}
          </span>
          <button class="select-all-btn" @click="toggleSelectAll">
            {{ allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner' }}
          </button>
        </div>

        <!-- Users list -->
        <div class="users-list">
          <div v-if="filteredUsers.length === 0" class="empty-state">
            Aucun utilisateur trouvé
          </div>

          <div
            v-for="user in filteredUsers"
            :key="user.id_user"
            class="user-row"
            :class="{ selected: isSelected(user) }"
            @click="toggleUser(user)"
          >
            <div class="user-checkbox" :class="{ checked: isSelected(user) }">
              <span v-if="isSelected(user)">✓</span>
            </div>
            <div class="user-avatar" :class="`avatar-${user.role}`">
              {{ getInitials(user) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ user.prenom }} {{ user.nom }}</span>
              <span class="user-meta">{{ getUserMeta(user) }}</span>
            </div>
            <span class="role-badge" :class="`badge-${user.role}`">
              {{ getRoleLabel(user.role) }}
            </span>
          </div>
        </div>

        <!-- Selected chips -->
        <div v-if="selectedUsers.length > 0" class="selected-section">
          <label class="filter-label">Destinataires sélectionnés ({{ selectedUsers.length }})</label>
          <div class="chips-container">
            <div v-for="user in selectedUsers" :key="user.id_user" class="chip">
              <span>{{ user.prenom }} {{ user.nom }}</span>
              <button class="chip-remove" @click.stop="toggleUser(user)">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <n-button quaternary @click="$emit('close')">Annuler</n-button>
        <n-button
          type="primary"
          :disabled="selectedUsers.length === 0"
          @click="confirm"
        >
          Confirmer
          <template v-if="selectedUsers.length > 0"> ({{ selectedUsers.length }})</template>
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton } from 'naive-ui'

// ─── Types calqués sur la vraie réponse API ───────────────

export interface RawUser {
  id_user: string | number
  nom: string
  prenom: string
  email: string
  role: string
  eleve: {
    id_user: string | number
    classe: {
      id_classe: string | number
      niveau: string
      lettre: string
      nom_classe: string
    }
    annee: string
  } | null
  professeur: {
    id_user: string | number
    matiere: string
  } | null
}

const props = defineProps<{
  users: RawUser[]
  eleveDetails?: Array<{
    id_user: string | number
    specialites: Array<{ id_specialite: string | number; nom_specialite: string }>
    options: Array<{ id_option: string | number; nom_option: string }>
  }>
}>()

const emit = defineEmits<{
  (e: 'confirm', users: RawUser[]): void
  (e: 'close'): void
}>()

// ─── State ────────────────────────────────────────────────

type RoleFilter = 'all' | 'eleve' | 'professeur' | 'administrateur'

const selectedRole = ref<RoleFilter>('all')
const selectedNiveau = ref('')
const selectedClasse = ref('')
const selectedMatiere = ref('')
const selectedSpe = ref('')
const selectedOption = ref('')
const searchQuery = ref('')
const selectedUsers = ref<RawUser[]>([])

const roles: Array<{ value: RoleFilter; label: string; icon: string }> = [
  { value: 'all',           label: 'Tous',           icon: '👤' },
  { value: 'administrateur',label: 'Administration',  icon: '🏫' },
  { value: 'professeur',    label: 'Professeurs',     icon: '📚' },
  { value: 'eleve',         label: 'Élèves',          icon: '🎓' },
]

// ─── Computed: options de filtres ─────────────────────────

const availableNiveaux = computed<string[]>(() => {
  const set = new Set<string>()
  props.users
    .filter((u) => u.role === 'eleve' && u.eleve?.classe?.niveau)
    .forEach((u) => set.add(u.eleve!.classe.niveau))
  return Array.from(set).sort()
})

const availableClasses = computed(() => {
  const map = new Map<string, { id_classe: string | number; nom_classe: string }>()
  props.users
    .filter((u) => {
      if (u.role !== 'eleve' || !u.eleve?.classe) return false
      if (selectedNiveau.value && u.eleve.classe.niveau !== selectedNiveau.value) return false
      return true
    })
    .forEach((u) => {
      const key = String(u.eleve!.classe.id_classe)
      if (!map.has(key)) map.set(key, u.eleve!.classe)
    })
  return Array.from(map.values()).sort((a, b) => a.nom_classe.localeCompare(b.nom_classe))
})

const availableMatieres = computed<string[]>(() => {
  const set = new Set<string>()
  props.users
    .filter((u) => u.role === 'professeur' && u.professeur?.matiere)
    .forEach((u) => set.add(u.professeur!.matiere))
  return Array.from(set).sort()
})

const availableSpecialites = computed(() => {
  const map = new Map<string, { id_specialite: string | number; nom_specialite: string }>()
  ;(props.eleveDetails ?? []).forEach((e) => {
    e.specialites.forEach((s) => {
      if (!map.has(String(s.id_specialite))) map.set(String(s.id_specialite), s)
    })
  })
  return Array.from(map.values()).sort((a, b) => a.nom_specialite.localeCompare(b.nom_specialite))
})

const availableOptions = computed(() => {
  const map = new Map<string, { id_option: string | number; nom_option: string }>()
  ;(props.eleveDetails ?? []).forEach((e) => {
    e.options.forEach((o) => {
      if (!map.has(String(o.id_option))) map.set(String(o.id_option), o)
    })
  })
  return Array.from(map.values()).sort((a, b) => a.nom_option.localeCompare(b.nom_option))
})

// ─── Computed: liste filtrée ──────────────────────────────

const filteredUsers = computed<RawUser[]>(() => {
  return props.users.filter((u) => {
    // Rôle
    if (selectedRole.value !== 'all' && u.role !== selectedRole.value) return false

    // Niveau (élèves)
    if (selectedNiveau.value) {
      if (u.eleve?.classe?.niveau !== selectedNiveau.value) return false
    }

    // Classe (élèves)
    if (selectedClasse.value) {
      if (String(u.eleve?.classe?.id_classe) !== selectedClasse.value) return false
    }

    // Spécialité (élèves)
    if (selectedSpe.value) {
      const detail = (props.eleveDetails ?? []).find((e) => String(e.id_user) === String(u.id_user))
      if (!detail?.specialites.some((s) => String(s.id_specialite) === selectedSpe.value)) return false
    }

    // Option (élèves)
    if (selectedOption.value) {
      const detail = (props.eleveDetails ?? []).find((e) => String(e.id_user) === String(u.id_user))
      if (!detail?.options.some((o) => String(o.id_option) === selectedOption.value)) return false
    }

    // Matière (profs)
    if (selectedMatiere.value) {
      if (u.professeur?.matiere !== selectedMatiere.value) return false
    }

    // Recherche texte
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const fullName = `${u.prenom} ${u.nom}`.toLowerCase()
      if (!fullName.includes(q) && !u.email.toLowerCase().includes(q)) return false
    }

    return true
  })
})

const allFilteredSelected = computed(() =>
  filteredUsers.value.length > 0 &&
  filteredUsers.value.every((u) => isSelected(u)),
)

// ─── Methods ──────────────────────────────────────────────

function selectRole(role: RoleFilter) {
  selectedRole.value = role
  selectedNiveau.value = ''
  selectedClasse.value = ''
  selectedMatiere.value = ''
  selectedSpe.value = ''
  selectedOption.value = ''
}

function isSelected(user: RawUser) {
  return selectedUsers.value.some((u) => String(u.id_user) === String(user.id_user))
}

function toggleUser(user: RawUser) {
  const idx = selectedUsers.value.findIndex(
    (u) => String(u.id_user) === String(user.id_user),
  )
  if (idx >= 0) selectedUsers.value.splice(idx, 1)
  else selectedUsers.value.push(user)
}

function toggleSelectAll() {
  if (allFilteredSelected.value) {
    const ids = new Set(filteredUsers.value.map((u) => String(u.id_user)))
    selectedUsers.value = selectedUsers.value.filter((u) => !ids.has(String(u.id_user)))
  } else {
    filteredUsers.value.forEach((u) => { if (!isSelected(u)) selectedUsers.value.push(u) })
  }
}

function confirm() {
  emit('confirm', [...selectedUsers.value])
  emit('close')
}

function getInitials(user: RawUser) {
  return `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
}

function getRoleLabel(role: string) {
  if (role === 'administrateur') return 'Admin'
  if (role === 'professeur') return 'Prof'
  return 'Élève'
}

function getUserMeta(user: RawUser): string {
  if (user.role === 'eleve' && user.eleve?.classe) {
    return user.eleve.classe.nom_classe
  }
  if (user.role === 'professeur' && user.professeur?.matiere) {
    return user.professeur.matiere
  }
  return user.email
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  height: 90vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1);
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon { font-size: 24px; }

.modal-header h2 {
  font-size: 17px;
  font-weight: 700;
  color: #205781;
  margin: 0 0 2px 0;
}

.modal-header p {
  font-size: 12px;
  color: #817f7f;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #817f7f;
  padding: 6px;
  border-radius: 6px;
  line-height: 1;
  transition: all 0.15s;
}
.close-btn:hover { background: #f5f7fa; color: #205781; }

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #817f7f;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.role-pills { display: flex; gap: 8px; flex-wrap: wrap; }

.role-pill {
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  border: 1.5px solid #e8e8e8;
  background: #fafafa;
  color: #666;
  transition: all 0.15s;
  font-weight: 500;
}
.role-pill:hover { border-color: #205781; color: #205781; }

.pill-all.active           { background: #f0f8ff; border-color: #205781; color: #205781; }
.pill-administrateur.active { background: #fff3f0; border-color: #e05c30; color: #c94a20; }
.pill-professeur.active    { background: #f0faf5; border-color: #2d9e6b; color: #1e7a50; }
.pill-eleve.active         { background: #eef5ff; border-color: #3b82c4; color: #2563a8; }

.sub-filters { display: flex; gap: 12px; flex-wrap: wrap; }

.filter-group { flex: 1; min-width: 160px; }

.filter-select {
  width: 100%;
  padding: 8px 28px 8px 10px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  background: white;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.filter-select:focus { border-color: #205781; }

.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
  max-height: 120px;
}
.slide-down-enter-from,
.slide-down-leave-to { max-height: 0; opacity: 0; }

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 8px 12px;
  background: #fafafa;
  transition: border-color 0.15s;
}
.search-wrapper:focus-within { border-color: #205781; background: white; }

.search-icon { font-size: 14px; flex-shrink: 0; }

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #333;
  width: 100%;
}
.search-input::placeholder { color: #bbb; }

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  font-size: 12px;
  padding: 2px;
  line-height: 1;
  flex-shrink: 0;
}
.search-clear:hover { color: #666; }

.results-header { display: flex; justify-content: space-between; align-items: center; }

.results-count { font-size: 12px; color: #817f7f; }

.select-all-btn {
  font-size: 12px;
  color: #205781;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;
}

.users-list {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  height: 260px;
  min-height: 260px;
  overflow-y: auto;
  flex-shrink: 0;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  font-size: 13px;
  color: #bbb;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid #f8f8f8;
}
.user-row:last-child { border-bottom: none; }
.user-row:hover { background: #f8fbff; }
.user-row.selected { background: #f0f6ff; }

.user-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.12s;
  background: white;
}
.user-checkbox.checked { background: #205781; border-color: #205781; color: white; }

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.avatar-administrateur { background: #fff3f0; color: #c94a20; }
.avatar-professeur     { background: #f0faf5; color: #1e7a50; }
.avatar-eleve          { background: #eef5ff; color: #2563a8; }

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #205781;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  flex-shrink: 0;
}
.badge-administrateur { background: #fff3f0; color: #c94a20; }
.badge-professeur     { background: #f0faf5; color: #1e7a50; }
.badge-eleve          { background: #eef5ff; color: #2563a8; }

.selected-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
  flex-shrink: 0;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 36px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #eef5ff;
  border: 1px solid #c7dcf5;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  color: #2563a8;
}

.chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #2563a8;
  font-size: 11px;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.1s;
}
.chip-remove:hover { opacity: 1; }

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.users-list::-webkit-scrollbar,
.modal-body::-webkit-scrollbar { width: 4px; }
.users-list::-webkit-scrollbar-track,
.modal-body::-webkit-scrollbar-track { background: transparent; }
.users-list::-webkit-scrollbar-thumb,
.modal-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

@media (max-width: 640px) {
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal-container { border-radius: 16px 16px 0 0; max-height: 92vh; }
  .sub-filters { flex-direction: column; }
}
</style>