import type { AuthResponse, SignInPayload, SignUpPayload } from '../types/index.ts'
import { useStorage } from './useStorage.ts'
import { useAuthStore } from '@/stores/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const storage = useStorage()

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = storage.get<string>('token')

  const headers: Record<string, string> = {}

  // Only set Content-Type if not FormData and not already set
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // Merge with provided headers
  Object.assign(headers, options.headers as Record<string, string>)

  if (token) {
    headers['Authorization'] = `Bearer ${token as string}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))

    if (res.status === 403) {
      throw {
        status: 403,
        message: data.error || data.message || 'Accès refusé',
      }
    }

    if (res.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      throw {
        status: 401,
        message: 'Session expirée',
      }
    }

    throw {
      status: res.status,
      message: data.error || data.message || `Erreur ${res.status}`,
    }
  }

  return res.json() as Promise<T>
}

/**
 * Composable exposant toutes les méthodes HTTP de l'API.
 *
 * - Le token JWT est injecté automatiquement dans chaque requête.
 * - En cas d'erreur (4xx, 5xx), une exception est levée avec le message renvoyé par l'API.
 *
 * @example
 * const api = useApi()
 * const cards = await api.getCards()
 */
export function useApi() {
  /** Connecte un utilisateur existant. Retourne le token JWT et les infos utilisateur. */
  const signIn = ({ login, password }: SignInPayload) =>
    request<AuthResponse>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    })

  /** Crée un nouveau compte. Retourne le token JWT et les infos utilisateur. */
  const signUp = ({
    nom,
    prenom,
    login,
    password,
    role,
    classe,
    annee,
    email,
    specialites,
    options,
  }: SignUpPayload) =>
    request<AuthResponse>('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({
        nom,
        prenom,
        login,
        password,
        role,
        classe,
        annee,
        email,
        specialites,
        options,
      }),
    })

  /** Déconnecte l'utilisateur */
  const logout = () =>
    request('/auth/logout', {
      method: 'POST',
    })

  /** Récupère la liste de tous les cours */
  const getCours = () => request('/api/cours')

  /** Récupère la liste de tous les devoirs */
  const getDevoirs = () => request('/api/devoirs')

  /** Récupère la liste de tous les rendus */
  const getRendus = () => request('/api/rendus')

  /** Récupère la liste de tous les élèves */
  const getEleves = () => request('/api/eleves')

  /** Récupère la liste de tous les professeurs */
  const getProfesseurs = () => request('/api/professeurs')

  /** Récupère la liste de tous les utilisateurs */
  const getUsers = () => request('/api/users/list/public')

  /** Récupère les travaux à rendre (devoirs non rendus) */
  const getTravauxARendreRecents = () => request('/api/devoirs/travaux-a-rendre')

  /** Récupère les événements à venir */
  const getEvenementsAVenir = () => request('/api/evenements/a-venir')

  /** Récupère la liste de toutes les classes */
  const getClasses = () => request('/api/classes')

  /** Récupère la liste de toutes les matières */
  const getMatieres = () => request('/api/profile/matieres')

  /** Récupère la liste de toutes les spécialités */
  const getSpecialites = () => request('/api/specialites')

  /** Récupère la liste de toutes les options */
  const getOptions = () => request('/api/options')

  /** Récupère le profil de l'utilisateur connecté */
  const getProfil = () => request('/api/profile')

  /** Met à jour le profil de l'utilisateur connecté */
  const updateProfil = (data: any) =>
    request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })

  /** Récupère tous les élèves */
  const getAllEleves = () => request('/api/users/eleves/list')

  /** Récupère tous les professeurs (liste admin) */
  const getAllProfs = () => request('/api/import/profs/list')

  /** Importe des professeurs depuis un fichier XLSX */
  const importProfs = (data: FormData) =>
    request('/api/import/profs', {
      method: 'POST',
      body: data,
    })

  /** Met à jour un utilisateur (élève) */
  const updateUser = (id: string | number, data: any) =>
    request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

  /** Crée un nouvel utilisateur (élève) */
  const createUser = (data: any) =>
    request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  /** Supprime un utilisateur (élève) */
  const deleteUser = (id: string | number) =>
    request(`/api/users/${id}`, {
      method: 'DELETE',
    })

  /** Récupère les messages reçus */
  const getReceivedMessages = () =>
    request('/api/messages/received', {
      method: 'GET',
    })

  /** Récupère les messages envoyés */
  const getSentMessages = () =>
    request('/api/messages/sent', {
      method: 'GET',
    })

  /** Récupère la conversation avec un utilisateur */
  const getConversation = (userId: string | number) =>
    request(`/api/messages/conversation/${userId}`, {
      method: 'GET',
    })

  /** Envoie un message avec pièces jointes */
  const sendMessage = (data: FormData) =>
    request('/api/messages', {
      method: 'POST',
      body: data,
    })

  /** Marque un message comme lu */
  const markMessageAsRead = (messageId: string | number) =>
    request(`/api/messages/${messageId}/read`, {
      method: 'PUT',
    })

  /** Supprime un message */
  const deleteMessage = (messageId: string | number) =>
    request(`/api/messages/${messageId}`, {
      method: 'DELETE',
    })

  /** Récupère l'info de stockage de l'utilisateur */
  const getStorageInfo = () =>
    request('/api/messages/storage/info', {
      method: 'GET',
    })

  /** Supprime tous les messages de l'utilisateur */
  const deleteAllUserMessages = () =>
    request('/api/messages/cleanup/user', {
      method: 'DELETE',
    })

  /** Nettoie les pièces jointes orphelines de l'utilisateur */
  const cleanupUserOrphanedAttachments = () =>
    request('/api/messages/cleanup/orphaned', {
      method: 'POST',
    })

  /** Nettoie toutes les pièces jointes orphelines (admin only) */
  const cleanupAllOrphanedAttachments = () =>
    request('/api/messages/cleanup/orphaned-all', {
      method: 'POST',
    })

  const getCoursByCategory = (kind: 'matiere' | 'specialite' | 'option', id: string | number) =>
    request(`/api/cours?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(String(id))}`)

  const getCoursByMatiere = (matiereId: string | number) =>
    request(`/api/cours/matiere/${matiereId}`)

  const getDevoirsByCategory = (kind: 'matiere' | 'specialite' | 'option', id: string | number) =>
    request(
      `/api/devoirs/categorie?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(String(id))}`,
    )

  const getDevoirsByMatiere = (matiereId: string | number) =>
    request(`/api/devoirs/matiere/${matiereId}`)

  const getEvenementsByCategory = (
    kind: 'matiere' | 'specialite' | 'option',
    id: string | number,
  ) =>
    request(
      `/api/evenements/categorie?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(String(id))}`,
    )

  const getEvenementsByMatiere = (matiereId: string | number) =>
    request(`/api/evenements/matiere/${matiereId}`)

  const getAllMatieres = () => request('/api/matieres')

  const createCours = (data: FormData) =>
    request('/api/cours', {
      method: 'POST',
      body: data,
    })

  const createDevoir = (data: FormData) =>
    request('/api/devoirs', {
      method: 'POST',
      body: data,
    })

  const importEleves = (data: FormData) =>
    request('/api/import/eleves', {
      method: 'POST',
      body: data,
    })

  const importElevesAndDownload = async (data: FormData) => {
    const token = storage.get<string>('token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token as string}`

    const res = await fetch(`${BASE_URL}/api/import/eleves?download=1`, {
      method: 'POST',
      body: data,
      headers,
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error((d as any).error || `Erreur ${res.status}`)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const disposition = res.headers.get('content-disposition')
    let filename = 'import-result.xlsx'
    if (disposition) {
      const m = disposition.match(/filename="?([^";]+)"?/)
      if (m?.[1]) filename = m[1]
    }
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return true
  }

  const exportImportResults = async (results: any[]) => {
    const token = storage.get<string>('token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token as string}`

    const res = await fetch(`${BASE_URL}/api/import/export-results`, {
      method: 'POST',
      body: JSON.stringify({ results }),
      headers,
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error((d as any).error || `Erreur ${res.status}`)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const disposition = res.headers.get('content-disposition')
    let filename = 'import-result.xlsx'
    if (disposition) {
      const m = disposition.match(/filename="?([^";]+)"?/)
      if (m?.[1]) filename = m[1]
    }
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return true
  }

  const createEvenement = (data: any) =>
    request('/api/evenements', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const createEvenementFromMatiere = (data: any) =>
    request('/api/evenements/matiere', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const createEvenementFromSpecialite = (data: any) =>
    request('/api/evenements/specialite', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const createEvenementFromOption = (data: any) =>
    request('/api/evenements/option', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const getCoursBySpecialite = (specialiteId: string | number) =>
    request(`/api/cours/specialite/${specialiteId}`)

  const getCoursByOption = (optionId: string | number) => request(`/api/cours/option/${optionId}`)

  const getMesDevoirs = () => request('/api/devoirs/mes-devoirs')

  const getMesNotes = () => request('/api/rendus/mes-notes')

  const rendreDevoir = (data: FormData) => request('/api/rendus', { method: 'POST', body: data })

  const deleteRendu = (idDevoir: string | number) =>
    request(`/api/rendus/devoir/${idDevoir}`, {
      method: 'DELETE',
    })

  const updateRendu = (
    idRendu: string | number,
    data: { note?: string | number | null; retour?: string | null },
  ) =>
    request(`/api/rendus/${idRendu}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

  const archiveRendu = (idRendu: string | number) =>
    request(`/api/rendus/${idRendu}/archive`, {
      method: 'POST',
    })

  async function post(url: string, data?: any) {
    return request(url, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  async function deleteCours(id: string) {
    return request(`/api/cours/${id}`, {
      method: 'DELETE',
    })
  }

  async function deleteDevoir(id: string) {
    return request(`/api/devoirs/${id}`, {
      method: 'DELETE',
    })
  }

  async function deleteEvenement(id: string) {
    return request(`/api/evenements/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    signIn,
    signUp,
    logout,
    request,
    getCours,
    getDevoirs,
    getRendus,
    getEleves,
    getProfesseurs,
    getUsers,
    getTravauxARendreRecents,
    getEvenementsAVenir,
    getClasses,
    getMatieres,
    getSpecialites,
    getOptions,
    getProfil,
    updateProfil,
    getAllEleves,
    updateUser,
    createUser,
    deleteUser,
    getReceivedMessages,
    getSentMessages,
    getConversation,
    sendMessage,
    markMessageAsRead,
    deleteMessage,
    getStorageInfo,
    deleteAllUserMessages,
    cleanupUserOrphanedAttachments,
    cleanupAllOrphanedAttachments,
    getCoursByCategory,
    getCoursByMatiere,
    getEvenementsByCategory,
    getEvenementsByMatiere,
    getDevoirsByCategory,
    getDevoirsByMatiere,
    getAllMatieres,
    createCours,
    createDevoir,
    importEleves,
    importElevesAndDownload,
    exportImportResults,
    createEvenement,
    createEvenementFromMatiere,
    createEvenementFromSpecialite,
    createEvenementFromOption,
    getCoursBySpecialite,
    getCoursByOption,
    getMesDevoirs,
    getMesNotes,
    rendreDevoir,
    deleteRendu,
    updateRendu,
    archiveRendu,
    post,
    deleteCours,
    deleteDevoir,
    deleteEvenement,
    getAllProfs,
    importProfs
  }
}
