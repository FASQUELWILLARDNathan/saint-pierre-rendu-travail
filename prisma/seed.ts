import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import { create } from 'domain'

const connectionString = process.env.DATABASE_URL

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

async function main() {
  console.log('🌱 Seed...')

  // ADMIN UNIQUEMENT
  const admin = await prisma.utilisateur.upsert({
    where: { email: process.env.DEFAULT_ADMIN_EMAIL! },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'Serveur',
      login: 'admin.serveur',
      email: process.env.DEFAULT_ADMIN_EMAIL!,
      hashed_password: await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD!, 12),
      role: 'administrateur',
    },
  })

  const ghostId = BigInt(process.env.GHOST_USER_ID!)

  const ghostUser = await prisma.utilisateur.upsert({
    where: { id_user: ghostId },
    update: {},
    create: {
      id_user: ghostId,
      nom: 'Archive',
      prenom: 'User',
      login: 'archive.user',
      email: 'archive@example.com',
      hashed_password: await bcrypt.hash('unused_password', 12),
      role: 'eleve',
    },
  })

  await prisma.eleve.upsert({
    where: { id_user: ghostId },
    update: {},
    create: {
      id_user: ghostId,
      id_classe: null,
      annee: null,
    },
  })

  // CLASSES
  const classesConfig = [
    { niveau: '6ème', lettres: ['A', 'B', 'C', 'D', 'E'] },
    { niveau: '5ème', lettres: ['A', 'B', 'C', 'D'] },
    { niveau: '4ème', lettres: ['A', 'B', 'C', 'D'] },
    { niveau: '3ème', lettres: ['A', 'B', 'C', 'D'] },
    { niveau: '2nde', lettres: ['1', '2', '3', '4', '5'] },
    { niveau: '1ère', lettres: ['A', 'B', 'C', 'D', 'E'] },
    { niveau: 'Terminale', lettres: ['A', 'B', 'C', 'D', 'E'] },
  ]

  for (const config of classesConfig) {
    for (const lettre of config.lettres) {
      await prisma.classe.upsert({
        where: { nom_classe: `${config.niveau} ${lettre}` },
        update: {},
        create: {
          niveau: config.niveau,
          lettre,
          nom_classe: `${config.niveau} ${lettre}`,
        },
      })
    }
  }

  // SPÉCIALITÉS LYCÉE
  const specialitesLycee = [
    'Mathématiques',
    'SES',
    'Physique',
    'SVT',
    'NSI',
    'HGGSP',
    'AMC',
    'LLCE',
    'HLP',
  ]

  for (const nom of specialitesLycee) {
    await prisma.specialite.upsert({
      where: { nom_specialite: nom },
      update: {},
      create: { nom_specialite: nom },
    })
  }

  // OPTIONS
  const optionsList = [
    'Anglais',
    'Espagnol',
    'Allemand',
    'Chinois',
    'Chinois option',
    'Section Européenne',
    'Mathématiques expertes',
    'Mathématiques complémentaires',
    'Latin',
    'DGEMC',
    'Management',
    'Sport',
    'Handball',
    'Football',
    'Volleyball',
    'ACCPE',
    'FirstCa',
    'FirstCa DNL',
    'PET Cambridge',
  ]

  for (const nom of optionsList) {
    await prisma.option.upsert({
      where: { nom_option: nom },
      update: {},
      create: { nom_option: nom },
    })
  }

  // MATIÈRES
  const matieresData = [
    {
      nom_matiere: 'Mathématiques',
      description: 'La mathématique est une science qui étudie les nombres, fonctions et espaces.',
      couleur: '#0EA304',
      icon_url: '/maths-icon.svg',
      devoir_icon_url: '/maths-devoir-icon.svg',
    },
    {
      nom_matiere: 'Français',
      description: "L'enseignement du français développe les compétences en lecture et écriture.",
      couleur: '#70BEFA',
      icon_url: '/francais-icon.svg',
      devoir_icon_url: '/francais-devoir-icon.svg',
    },
    {
      nom_matiere: 'Anglais',
      description: 'Apprentissage de la langue anglaise.',
      couleur: '#FF0000',
      icon_url: '/langues-icon.svg',
      devoir_icon_url: '/langues-devoir-icon.svg',
    },
    {
      nom_matiere: 'Espagnol',
      description: 'Apprentissage de la langue espagnole.',
      couleur: '#FF0000',
      icon_url: '/langues-icon.svg',
      devoir_icon_url: '/langues-devoir-icon.svg',
    },
    {
      nom_matiere: 'Allemand',
      description: 'Apprentissage de la langue allemande.',
      couleur: '#FF0000',
      icon_url: '/langues-icon.svg',
      devoir_icon_url: '/langues-devoir-icon.svg',
    },
    {
      nom_matiere: 'Histoire-Géo',
      description: 'Histoire, géographie et EMC.',
      couleur: '#FF6600',
      icon_url: '/histoire-geo-icon.svg',
      devoir_icon_url: '/histoire-geo-devoir-icon.svg',
    },
    {
      nom_matiere: 'EMC',
      description: 'Enseignement moral et civique.',
      couleur: '#FF6600',
      icon_url: '/histoire-geo-icon.svg',
      devoir_icon_url: '/histoire-geo-devoir-icon.svg',
    },
    {
      nom_matiere: 'SVT',
      description: 'Sciences de la vie et de la Terre.',
      couleur: '#FF5CF4',
      icon_url: '/sciences-icon.svg',
      devoir_icon_url: '/sciences-devoir-icon.svg',
    },
    {
      nom_matiere: 'Physique',
      description: 'Physique-Chimie.',
      couleur: '#FF5CF4',
      icon_url: '/sciences-icon.svg',
      devoir_icon_url: '/sciences-devoir-icon.svg',
    },
    {
      nom_matiere: 'Technologie',
      description: 'Découverte des systèmes techniques.',
      couleur: '#95A092',
      icon_url: '/technologie-icon.svg',
      devoir_icon_url: '/other-devoir-icon.svg',
    },
    {
      nom_matiere: 'Sport',
      description: 'Education physique et sportive.',
      couleur: '#703603',
      icon_url: '/sport-icon.svg',
      devoir_icon_url: '/other-devoir-icon.svg',
    },
    {
      nom_matiere: 'Arts Plastiques',
      description: 'Expression artistique et visuelle.',
      couleur: '#00FF73',
      icon_url: '/arts-plastiques-icon.svg',
      devoir_icon_url: '/other-devoir-icon.svg',
    },
    {
      nom_matiere: 'Musique',
      description: 'Education musicale.',
      couleur: '#5900FF',
      icon_url: '/musique-icon.svg',
      devoir_icon_url: '/other-devoir-icon.svg',
    },
    {
      nom_matiere: 'SES',
      description: 'Sciences économiques et sociales.',
      couleur: '#5900FF',
      icon_url: '/ses-icon.svg',
      devoir_icon_url: '/other-devoir-icon.svg',
    },
    {
      nom_matiere: 'SNT',
      description: 'Sciences numériques et technologie.',
      couleur: '#00FF73',
      icon_url: '/snt-icon.svg',
      devoir_icon_url: '/other-devoir-icon.svg',
    },
    {
      nom_matiere: 'Philosophie',
      description: 'Réflexion philosophique et dissertation.',
      couleur: '#70BEFA',
      icon_url: '/francais-icon.svg',
      devoir_icon_url: '/francais-devoir-icon.svg',
    },
    {
      nom_matiere: 'Enseignement Scientifique',
      description: 'Enseignement scientifique du lycée général.',
      couleur: '#FF5CF4',
      icon_url: '/sciences-icon.svg',
      devoir_icon_url: '/sciences-devoir-icon.svg',
    },
  ]

  for (const matiere of matieresData) {
    await prisma.matiere.upsert({
      where: { nom_matiere: matiere.nom_matiere },
      update: {},
      create: matiere,
    })
  }

  // MATIÈRES PAR NIVEAU
  const matieresByNiveau = {
    college: [
      'Mathématiques',
      'Français',
      'Histoire-Géo',
      'EMC',
      'SVT',
      'Physique',
      'Technologie',
      'Arts Plastiques',
      'Musique',
      'Sport',
      'CDI',
    ],
    seconde: [
      'Mathématiques',
      'Français',
      'Histoire-Géo',
      'EMC',
      'SVT',
      'Physique',
      'SES',
      'SNT',
      'Sport',
    ],
    premiere: [
      'Mathématiques',
      'Français',
      'Histoire-Géo',
      'Enseignement Scientifique',
      'Sport',
      'EMC',
    ],
    terminale: [
      'Philosophie',
      'Histoire-Géo',
      'EMC',
      'Enseignement Scientifique',
      'Sport',
    ],
  }

  const niveauMap: Record<string, keyof typeof matieresByNiveau> = {
    '6ème': 'college',
    '5ème': 'college',
    '4ème': 'college',
    '3ème': 'college',
    '2nde': 'seconde',
    '1ère': 'premiere',
    Terminale: 'terminale',
  }

  const toutesLesClasses = await prisma.classe.findMany()
  const toutesLesMatieres = await prisma.matiere.findMany()
  const matiereByNom = Object.fromEntries(toutesLesMatieres.map((m) => [m.nom_matiere, m]))

  for (const classe of toutesLesClasses) {
    const niveauKey = niveauMap[classe.niveau]
    if (!niveauKey) continue

    const nomsMatieres = matieresByNiveau[niveauKey]
    for (const nom of nomsMatieres) {
      const matiere = matiereByNom[nom]
      if (!matiere) continue

      await prisma.classeMatiere.upsert({
        where: {
          id_classe_id_matiere: {
            id_classe: classe.id_classe,
            id_matiere: matiere.id_matiere,
          },
        },
        update: {},
        create: {
          id_classe: classe.id_classe,
          id_matiere: matiere.id_matiere,
        },
      })
    }
  }

  console.log('✅ Seed OK')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
