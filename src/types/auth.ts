export interface User {
  id: number
  login: string
  username: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface SignInPayload {
  login: string
  password: string
}

export interface SignUpPayload {
  nom: string
  prenom: string
  login: string
  password: string
  role: string
  classe: string
  annee: string
}
