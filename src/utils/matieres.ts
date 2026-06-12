/**
 * Configuration des matières avec leurs couleurs et icônes
 * À utiliser pour lier automatiquement les devoirs aux matières
 */

export interface Matiere {
  id: number
  nom: string
  icon: string
  color: string
  devoirIcon: string
}

export const MATIERES: Matiere[] = [
  {
    id: 1,
    nom: 'Français',
    icon: '/francais-icon.svg',
    color: '#70BEFA',
    devoirIcon: '/francais-devoir-icon.svg',
  },
  {
    id: 2,
    nom: 'Mathématiques',
    icon: '/maths-icon.svg',
    color: '#0EA304',
    devoirIcon: '/maths-devoir-icon.svg',
  },
  {
    id: 3,
    nom: 'Langues',
    icon: '/langues-icon.svg',
    color: '#FF0000',
    devoirIcon: '/langues-devoir-icon.svg',
  },
  {
    id: 4,
    nom: 'Histoire-Géo',
    icon: '/histoire-geo-icon.svg',
    color: '#FF6600',
    devoirIcon: '/histoire-geo-devoir-icon.svg',
  },
  {
    id: 5,
    nom: 'Sciences',
    icon: '/sciences-icon.svg',
    color: '#FF5CF4',
    devoirIcon: '/sciences-devoir-icon.svg',
  },
  {
    id: 6,
    nom: 'Technologie',
    icon: '/technologie-icon.svg',
    color: '#95A092',
    devoirIcon: '/other-devoir-icon.svg',
  },
  {
    id: 7,
    nom: 'Arts Plastiques',
    icon: '/arts-plastiques-icon.svg',
    color: '#00FF73',
    devoirIcon: '/other-devoir-icon.svg',
  },
  {
    id: 8,
    nom: 'Musique',
    icon: '/musique-icon.svg',
    color: '#5900FF',
    devoirIcon: '/other-devoir-icon.svg',
  },
  {
    id: 9,
    nom: 'Autres',
    icon: '/others-icon.svg',
    color: '#703603',
    devoirIcon: '/other-devoir-icon.svg',
  },
  {
    id: 10,
    nom: 'SES',
    icon: '/others-icon.svg',
    color: '#00FF73',
    devoirIcon: '/other-devoir-icon.svg',
  },
  {
    id: 11,
    nom: 'SNT',
    icon: '/others-icon.svg',
    color: '#5900FF',
    devoirIcon: '/other-devoir-icon.svg',
  },
  {
    id: 12,
    nom: 'Philosophie',
    icon: '/others-icon.svg',
    color: '#70BEFA',
    devoirIcon: '/other-devoir-icon.svg',
  },
  {
    id: 13,
    nom: 'NSI',
    icon: '/code-icon.svg',
    color: '#5900FF',
    devoirIcon: '/other-devoir-icon.svg',
  },
]

//Récupère une matière par son ID
export const getMatiereById = (id: number): Matiere | undefined => {
  return MATIERES.find((matiere) => matiere.id === id)
}

//Récupère une matière par son nom
export const getMatiereByName = (nom: string): Matiere | undefined => {
  return MATIERES.find((matiere) => matiere.nom.toLowerCase() === nom.toLowerCase())
}

// Récupère la couleur d'une matière par son ID
// Utile pour lier automatiquement les devoirs
export const getMatiereCouleur = (matiereId: number): string => {
  const matiere = getMatiereById(matiereId)
  return matiere?.color || '#CCCCCC'
}

//Récupère l'icône de devoir pour une matière
export const getMatiereDevoirIcon = (matiereId: number): string => {
  const matiere = getMatiereById(matiereId)
  return matiere?.devoirIcon || '/other-devoir-icon.svg'
}
