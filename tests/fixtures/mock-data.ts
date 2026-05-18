/**
 * Fixtures - Données de test réutilisables
 */

export const mockUsers = {
  eleve1: {
    id_user: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    login: 'jdupont',
    email: 'jdupont@saint-pierre.fr',
    password: 'hashed-password-123',
    role: 'eleve',
    eleve: {
      id_user: 1,
      classe: {
        id_classe: '1',
        niveau: 'Seconde',
        lettre: 'A',
        nom_classe: '2nde A',
      },
      annee: '2026',
    },
    professeur: null,
  },
  eleve2: {
    id_user: 2,
    nom: 'Martin',
    prenom: 'Marie',
    login: 'mmartin',
    email: 'mmartin@saint-pierre.fr',
    password: 'hashed-password-456',
    role: 'eleve',
    eleve: {
      id_user: 2,
      classe: {
        id_classe: '2',
        niveau: 'Première',
        lettre: 'B',
        nom_classe: '1ère B',
      },
      annee: '2026',
    },
    professeur: null,
  },
  prof1: {
    id_user: 3,
    nom: 'Bernard',
    prenom: 'Pierre',
    login: 'pbernard',
    email: 'pbernard@saint-pierre.fr',
    password: 'hashed-password-789',
    role: 'professeur',
    eleve: null,
    professeur: {
      matiere: 'Mathématiques',
    },
  },
  admin: {
    id_user: 4,
    nom: 'Admin',
    prenom: 'System',
    login: 'admin',
    email: 'admin@saint-pierre.fr',
    password: 'hashed-password-admin',
    role: 'administrateur',
    eleve: null,
    professeur: null,
  },
}

export const mockAuthTokens = {
  valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImVsZXZlIn0.valid-token',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImVsZXZlIn0.expired-token',
  invalid: 'invalid-token-format',
}

export const mockSignUpPayload = {
  valid: {
    nom: 'Nouvelle',
    prenom: 'Personne',
    login: 'npersonne',
    password: 'SecurePassword123!',
    role: 'eleve',
    classe: '2nde A',
    annee: 2026,
    email: 'npersonne@saint-pierre.fr',
  },
  invalid: {
    nom: '',
    prenom: '',
    login: 'a', // Too short
    password: '123', // Too weak
    role: 'invalid_role',
    classe: '',
    annee: -1,
    email: 'invalid-email',
  },
}

export const mockDevoirs = [
  {
    id: 1,
    titre: 'Devoir de mathématiques',
    description: 'Résoudre les équations du chapitre 3',
    matiere: 'Mathématiques',
    dateEcheance: new Date('2026-05-25'),
    dateRemise: new Date('2026-05-24'),
    statut: 'actif',
  },
  {
    id: 2,
    titre: 'Dissertation français',
    description: 'Écrire une dissertation sur le thème "Progrès"',
    matiere: 'Français',
    dateEcheance: new Date('2026-05-30'),
    dateRemise: new Date('2026-05-29'),
    statut: 'actif',
  },
]

export const mockEvenements = [
  {
    id: 1,
    titre: 'Conseil de classe',
    description: 'Conseil de classe 2nde A',
    date: new Date('2026-05-20'),
    heure: '16:30',
    lieu: 'Amphithéâtre',
    type: 'reunion',
    icon: 'calendar',
  },
  {
    id: 2,
    titre: 'Sortie pédagogique',
    description: 'Visite au musée',
    date: new Date('2026-06-10'),
    heure: '09:00',
    lieu: 'Musée local',
    type: 'sorties',
    icon: 'map-pin',
  },
]

export const mockMatieres = [
  {
    id: 1,
    nom: 'Mathématiques',
    code: 'MATH',
    couleur: '#FF6B6B',
  },
  {
    id: 2,
    nom: 'Français',
    code: 'FR',
    couleur: '#4ECDC4',
  },
  {
    id: 3,
    nom: 'Histoire-Géographie',
    code: 'HG',
    couleur: '#45B7D1',
  },
]

export const mockAuthResponse = {
  token: mockAuthTokens.valid,
  user: mockUsers.eleve1,
  message: 'Authentification réussie',
}

export const mockPaginatedResponse = {
  data: mockDevoirs,
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
}

export const mockErrorResponse = {
  error: 'Une erreur est survenue',
  message: 'Veuillez réessayer',
  status: 500,
}
