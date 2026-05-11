// Représente un utilisateur authentifié.
export interface User {
  id_user?: string | number
  id?: number
  nom?: string
  prenom?: string
  login: string
  username?: string
  email?: string
  role?: string
  eleve?: {
    id_user?: string | number
    classe?: string
    annee?: string
  }
  professeur?: {
    id_user?: string | number
    matiere?: string
  }
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
