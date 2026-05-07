// Représente un utilisateur authentifié.
export interface User {
  id: number
  login: string
  username: string
  email?: string
}

// Structure de la réponse renvoyée après authentification.
export interface AuthResponse {
  token: string
  user: User
}

// Données nécessaires pour la connexion utilisateur.
export interface SignInPayload {
  login: string
  password: string
}

// Données nécessaires pour l'inscription utilisateur.
export interface SignUpPayload {
  nom: string
  prenom: string
  login: string
  password: string
  role: string
  classe: string
  annee: string
  email: string
}
