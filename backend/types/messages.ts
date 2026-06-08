import type { User } from './auth.ts'

export interface PieceJointe {
  id_piece_jointe: string
  nom_fichier: string
  chemin_fichier: string
  type_fichier: string
  taille_octets: string
}

export interface UtilisateurSimple {
  id_user: string
  nom: string
  prenom: string
  email: string
}

export interface Message {
  id_message: string
  id_expediteur: string
  id_destinataire: string
  sujet: string
  contenu: string
  date_envoi: Date
  lu: boolean
  expediteur?: User
  destinataire?: User
  pieces_jointes: PieceJointe[]
}
