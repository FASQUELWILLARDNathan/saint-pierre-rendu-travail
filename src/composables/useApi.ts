import type { AuthResponse, SignInPayload, SignUpPayload } from '../types/index.ts'
import { useStorage } from './useStorage.ts'

const BASE_URL = import.meta.env.VITE_API_URL
const storage = useStorage()

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = storage.get<string>('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message || `Erreur ${res.status}`)
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
  const signUp = ({ nom, prenom, login, password, role, classe, annee }: SignUpPayload) =>
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
  const getUsers = () => request('/api/users')

  return {
    signIn,
    signUp,
    logout,
    getCours,
    getDevoirs,
    getRendus,
    getEleves,
    getProfesseurs,
    getUsers,
  }
}
