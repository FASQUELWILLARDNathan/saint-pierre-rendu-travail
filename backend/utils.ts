import type { Message } from './types/messages'

// Vérifie si une chaîne de caractères représente un BigInt valide et strictement positif.
export function isValidBigInt(value: string): boolean {
  try {
    BigInt(value)
    return !isNaN(Number(value)) && Number(value) > 0
  } catch {
    return false
  }
}

export function formatMessage(msg: any): Message {
  return {
    id_message: msg.id_message.toString(),
    id_expediteur: msg.id_expediteur.toString(),
    id_destinataire: msg.id_destinataire.toString(),
    sujet: msg.sujet,
    contenu: msg.contenu,   
    date_envoi: msg.date_envoi,
    lu: msg.lu,
    expediteur: msg.expediteur
      ? {
          id_user: msg.expediteur.id_user.toString(),
          nom: msg.expediteur.nom,
          prenom: msg.expediteur.prenom,
          email: msg.expediteur.email,
          login: msg.expediteur.login,
        }
      : undefined,
    destinataire: msg.destinataire
      ? {
          id_user: msg.destinataire.id_user?.toString(),
          nom: msg.destinataire.nom,
          prenom: msg.destinataire.prenom,
          email: msg.destinataire.email,
          login: msg.destinataire.login,
        }
      : undefined,
    pieces_jointes: msg.pieces_jointes.map((pj: any) => ({
      id_piece_jointe: pj.id_piece_jointe.toString(),
      nom_fichier: pj.nom_fichier,
      chemin_fichier: pj.chemin_fichier,
      type_fichier: pj.type_fichier,
      taille_octets: pj.taille_octets.toString(),
    })),
  }
}


export function toBigIntOrNull(value: any): bigint | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  try {
    const num = Number(value)
    if (isNaN(num)) return null
    const bigintValue = BigInt(value)
    return bigintValue
  } catch {
    return null
  }
}