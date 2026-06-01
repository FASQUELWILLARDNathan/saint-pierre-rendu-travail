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
    classe?: Classe
    annee?: string

    specialites?: {
      id_specialite: string | number
      nom_specialite: string
    }[]
    options?: {
      id_option: string | number
      nom_option: string
    }[]
  }

  professeur?: {
    id_user?: string | number
    matiere?: string
    classes_enseignees?: { classe: Classe }[]
    specialites_enseignees?: {
      specialite: {
        id_specialite: string | number
        nom_specialite: string
      }
    }[]
    options_enseignees?: {
      option: {
        id_option: string | number
        nom_option: string
      }
    }[]
  }
}

// Structure d'une classe d'un eleve
export interface Classe {
  id_classe: string | number
  niveau: string
  lettre: string
  nom_classe: string
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
  id_classe?: string
  annee: string
  email: string
  specialites?: Array<string | number>
  options?: Array<string | number>
}
