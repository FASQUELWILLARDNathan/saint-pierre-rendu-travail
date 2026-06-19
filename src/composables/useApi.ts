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
  const getCours = () => request('/cours')

  /** Récupère la liste de tous les devoirs */
  const getDevoirs = () => request('/devoirs')

  /** Récupère la liste de tous les rendus */
  const getRendus = () => request('/rendus')

  /** Récupère la liste de tous les élèves */
  const getEleves = () => request('/eleves')

  /** Récupère la liste de tous les professeurs */
  const getProfesseurs = () => request('/professeurs')

  /** Récupère la liste de tous les utilisateurs */
  const getUsers = () => request('/users/list/public')

  /** Récupère les travaux à rendre (devoirs non rendus) */
  const getTravauxARendreRecents = () => request('/devoirs/travaux-a-rendre')

  /** Récupère les événements à venir */
  const getEvenementsAVenir = () => request('/evenements/a-venir')

  /** Récupère la liste de toutes les classes */
  const getClasses = () => request('/classes')

  /** Récupère la liste de toutes les matières */
  const getMatieres = () => request('/profile/matieres')

  /** Récupère la liste de toutes les spécialités */
  const getSpecialites = () => request('/specialites')

  /** Récupère la liste de toutes les options */
  const getOptions = () => request('/options')

  /** Récupère le profil de l'utilisateur connecté */
  const getProfil = () => request('/profile')

  /** Met à jour le profil de l'utilisateur connecté */
  const updateProfil = (data: any) =>
    request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })

  /** Récupère tous les élèves */
  const getAllEleves = () => request('/users/eleves/list')

  /** Récupère tous les professeurs (liste admin) */
  const getAllProfs = () => request('/import/profs/list')

  /** Importe des professeurs depuis un fichier XLSX */
  const importProfs = (data: FormData) =>
    request('/import/profs', {
      method: 'POST',
      body: data,
    })

  /** Met à jour un utilisateur (élève) */
  const updateUser = (id: string | number, data: any) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

  /** Crée un nouvel utilisateur (élève) */
  const createUser = (data: any) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  /** Supprime un utilisateur (élève) */
  const deleteUser = (id: string | number) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    })

  /** Récupère les messages reçus */
  const getReceivedMessages = () =>
    request('/messages/received', {
      method: 'GET',
    })

  /** Récupère les messages envoyés */
  const getSentMessages = () =>
    request('/messages/sent', {
      method: 'GET',
    })

  /** Récupère la conversation avec un utilisateur */
  const getConversation = (userId: string | number) =>
    request(`/messages/conversation/${userId}`, {
      method: 'GET',
    })

  /** Envoie un message avec pièces jointes */
  const sendMessage = (data: FormData) =>
    request('/messages', {
      method: 'POST',
      body: data,
    })

  /** Marque un message comme lu */
  const markMessageAsRead = (messageId: string | number) =>
    request(`/messages/${messageId}/read`, {
      method: 'PUT',
    })

  /** Supprime un message */
  const deleteMessage = (messageId: string | number) =>
    request(`/messages/${messageId}`, {
      method: 'DELETE',
    })

  /** Récupère l'info de stockage de l'utilisateur */
  const getStorageInfo = () =>
    request('/messages/storage/info', {
      method: 'GET',
    })

  /** Supprime tous les messages de l'utilisateur */
  const deleteAllUserMessages = () =>
    request('/messages/cleanup/user', {
      method: 'DELETE',
    })

  /** Nettoie les pièces jointes orphelines de l'utilisateur */
  const cleanupUserOrphanedAttachments = () =>
    request('/messages/cleanup/orphaned', {
      method: 'POST',
    })

  /** Nettoie toutes les pièces jointes orphelines (admin only) */
  const cleanupAllOrphanedAttachments = () =>
    request('/messages/cleanup/orphaned-all', {
      method: 'POST',
    })

  const getCoursByCategory = (kind: 'matiere' | 'specialite' | 'option', id: string | number) =>
    request(`/cours?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(String(id))}`)

  const getCoursByMatiere = (matiereId: string | number) =>
    request(`/cours/matiere/${matiereId}`)

  const getDevoirsByCategory = (kind: 'matiere' | 'specialite' | 'option', id: string | number) =>
    request(
      `/devoirs/categorie?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(String(id))}`,
    )

  const getDevoirsByMatiere = (matiereId: string | number) =>
    request(`/devoirs/matiere/${matiereId}`)

  const getEvenementsByCategory = (
    kind: 'matiere' | 'specialite' | 'option',
    id: string | number,
  ) =>
    request(
      `/evenements/categorie?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(String(id))}`,
    )

  const getEvenementsByMatiere = (matiereId: string | number) =>
    request(`/evenements/matiere/${matiereId}`)

  const getAllMatieres = () => request('/matieres')

  const createCours = (data: FormData) =>
    request('/cours', {
      method: 'POST',
      body: data,
    })

  const createDevoir = (data: FormData) =>
    request('/devoirs', {
      method: 'POST',
      body: data,
    })

  const importEleves = (data: FormData) =>
    request('/import/eleves', {
      method: 'POST',
      body: data,
    })

  const importElevesAndDownload = async (data: FormData) => {
    const token = storage.get<string>('token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token as string}`

    const res = await fetch(`${BASE_URL}/import/eleves?download=1`, {
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

    const res = await fetch(`${BASE_URL}/import/export-results`, {
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
    request('/evenements', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const createEvenementFromMatiere = (data: any) =>
    request('/evenements/matiere', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const createEvenementFromSpecialite = (data: any) =>
    request('/evenements/specialite', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const createEvenementFromOption = (data: any) =>
    request('/evenements/option', {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const getCoursBySpecialite = (specialiteId: string | number) =>
    request(`/cours/specialite/${specialiteId}`)

  const getCoursByOption = (optionId: string | number) => request(`/cours/option/${optionId}`)

  const getMesDevoirs = () => request('/devoirs/mes-devoirs')

  const getMesNotes = () => request('/rendus/mes-notes')

  const rendreDevoir = (data: FormData) => request('/rendus', { method: 'POST', body: data })

  const deleteRendu = (idDevoir: string | number) =>
    request(`/rendus/devoir/${idDevoir}`, {
      method: 'DELETE',
    })

  const updateRendu = (
    idRendu: string | number,
    data: { note?: string | number | null; retour?: string | null },
  ) =>
    request(`/rendus/${idRendu}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

  const archiveRendu = (idRendu: string | number) =>
    request(`/rendus/${idRendu}/archive`, {
      method: 'POST',
    })

  async function post(url: string, data?: any) {
    return request(url, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  async function deleteCours(id: string) {
    return request(`/cours/${id}`, {
      method: 'DELETE',
    })
  }

  async function deleteDevoir(id: string) {
    return request(`/devoirs/${id}`, {
      method: 'DELETE',
    })
  }

  async function deleteEvenement(id: string) {
    return request(`/evenements/${id}`, {
      method: 'DELETE',
    })
  }

  async function updateCours(id: string, data: FormData) {
    return request(`/cours/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function updateDevoir(id: string, data: FormData) {
    return request(`/devoirs/${id}`, {
      method: 'PUT',
      body: data,
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
    updateCours,
    updateDevoir,
    getAllProfs,
    importProfs,
  }
}
