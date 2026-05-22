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

  const passwordProf = await bcrypt.hash('prof123', 10)
  const passwordEleve = await bcrypt.hash('eleve123', 10)

  // Create users
  const prof1 = await prisma.utilisateur.upsert({
    where: { login: 'dupont.jean' },
    update: {},
    create: {
      nom: 'Dupont',
      prenom: 'Jean',
      login: 'dupont.jean',
      email: 'dupont.jean@gmail.com',
      hashed_password: passwordProf,
      role: 'professeur',
    },
  })

  const prof2 = await prisma.utilisateur.upsert({
    where: { login: 'martin.marie' },
    update: {},
    create: {
      nom: 'Martin',
      prenom: 'Marie',
      login: 'martin.marie',
      email: 'martin.marie@gmail.com',
      hashed_password: passwordProf,
      role: 'professeur',
    },
  })

  const prof3 = await prisma.utilisateur.upsert({
    where: { login: 'leclerc.paul' },
    update: {},
    create: {
      nom: 'Leclerc',
      prenom: 'Paul',
      login: 'leclerc.paul',
      email: 'leclerc.paul@gmail.com',
      hashed_password: passwordProf,
      role: 'professeur',
    },
  })

  const prof4 = await prisma.utilisateur.upsert({
    where: { login: 'fasquel.nathan' },
    update: {},
    create: {
      nom: 'Fasquel',
      prenom: 'Nathan',
      login: 'fasquel.nathan',
      email: 'neyznn.pro@gmail.com',
      hashed_password: passwordProf,
      role: 'professeur',
    },
  })

  const admin = await prisma.utilisateur.upsert({
    where: { email: process.env.DEFAULT_ADMIN_EMAIL! },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'Serveur',
      login: 'admin.serveur',
      email: process.env.DEFAULT_ADMIN_EMAIL!,
      hashed_password: await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD!, 10),
      role: 'administrateur',
    },
  })

  const eleve1 = await prisma.utilisateur.upsert({
    where: { login: 'moreau.pierre' },
    update: {},
    create: {
      nom: 'Moreau',
      prenom: 'Pierre',
      login: 'moreau.pierre',
      email: 'moreau.pierre@cs-saintpierrecalais.fr',
      hashed_password: passwordEleve,
      role: 'eleve',
    },
  })

  const eleve2 = await prisma.utilisateur.upsert({
    where: { login: 'bernard.sophie' },
    update: {},
    create: {
      nom: 'Bernard',
      prenom: 'Sophie',
      login: 'bernard.sophie',
      email: 'bernard.sophie@cs-saintpierrecalais.fr',
      hashed_password: passwordEleve,
      role: 'eleve',
    },
  })

  const eleve3 = await prisma.utilisateur.upsert({
    where: { login: 'thomas.luc' },
    update: {},
    create: {
      nom: 'Thomas',
      prenom: 'Luc',
      login: 'thomas.luc',
      email: 'thomas.luc@cs-saintpierrecalais.fr',
      hashed_password: passwordEleve,
      role: 'eleve',
    },
  })

  // Create professeurs
  await prisma.professeur.upsert({
    where: { id_user: prof1.id_user },
    update: {},
    create: {
      id_user: prof1.id_user,
      matiere: 'Mathématiques',
    },
  })

  await prisma.professeur.upsert({
    where: { id_user: prof2.id_user },
    update: {},
    create: {
      id_user: prof2.id_user,
      matiere: 'Français',
    },
  })

  await prisma.professeur.upsert({
    where: { id_user: prof4.id_user },
    update: {},
    create: {
      id_user: prof4.id_user,
      matiere: '',
    },
  })

  await prisma.professeur.upsert({
    where: { id_user: prof3.id_user },
    update: {},
    create: {
      id_user: prof3.id_user,
      matiere: 'Langues',
    },
  })

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
        where: {
          nom_classe: `${config.niveau} ${lettre}`,
        },
        update: {},
        create: {
          niveau: config.niveau,
          lettre,
          nom_classe: `${config.niveau} ${lettre}`,
        },
      })
    }
  }

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
      where: {
        nom_specialite: nom,
      },
      update: {},
      create: {
        nom_specialite: nom,
      },
    })
  }

  // Get specialites
  const specNSI = await prisma.specialite.findUnique({
    where: { nom_specialite: 'NSI' },
  })
  const specSVT = await prisma.specialite.findUnique({
    where: { nom_specialite: 'SVT' },
  })

  // Create options
  const optSport = await prisma.option.upsert({
    where: { nom_option: 'Sport' },
    update: {},
    create: { nom_option: 'Sport' },
  })

  const optLatin = await prisma.option.upsert({
    where: { nom_option: 'Latin' },
    update: {},
    create: { nom_option: 'Latin' },
  })

  // Get classes
  const classeTerminaleA = await prisma.classe.findUnique({
    where: { nom_classe: 'Terminale A' },
  })
  const classeTerminaleB = await prisma.classe.findUnique({
    where: { nom_classe: 'Terminale B' },
  })

  // Create eleves with classes and specialites/options
  for (const [index, eleve] of [eleve1, eleve2, eleve3].entries()) {
    const classeId = index === 0 ? classeTerminaleA?.id_classe : classeTerminaleB?.id_classe
    const specialiteIds =
      index < 2
        ? specNSI?.id_specialite
          ? [specNSI.id_specialite]
          : []
        : specSVT?.id_specialite
          ? [specSVT.id_specialite]
          : []
    const optionIds = index < 2 ? [optSport.id_option] : [optLatin.id_option]

    await prisma.eleve.upsert({
      where: { id_user: eleve.id_user },
      update: {
        specialites: {
          deleteMany: {},
          create: specialiteIds.filter(Boolean).map((id) => ({ id_specialite: id })),
        },
        options: {
          deleteMany: {},
          create: optionIds.filter(Boolean).map((id) => ({ id_option: id })),
        },
      },
      create: {
        id_user: eleve.id_user,
        id_classe: classeId,
        annee: '2025-2026',
        specialites: {
          create: specialiteIds.filter(Boolean).map((id) => ({ id_specialite: id })),
        },
        options: {
          create: optionIds.filter(Boolean).map((id) => ({ id_option: id })),
        },
      },
    })
  }

  // Create matieres with colors and icons from the frontend config
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
      where: {
        nom_matiere: matiere.nom_matiere,
      },
      update: {},
      create: matiere,
    })
  }

  // Get matieres
  const matMath = await prisma.matiere.findUnique({
    where: { nom_matiere: 'Mathématiques' },
  })
  const matFrancais = await prisma.matiere.findUnique({
    where: { nom_matiere: 'Français' },
  })
  const matLangues = await prisma.matiere.findUnique({
    where: { nom_matiere: 'Anglais' },
  })
  const matHistoire = await prisma.matiere.findUnique({
    where: { nom_matiere: 'Histoire-Géo' },
  })

  if (!matMath || !matFrancais) {
    throw new Error('Matieres not found')
  }

  // Create cours
  const coursMath = await prisma.cours.upsert({
    where: {
      id_matiere_nom_cours: {
        id_matiere: matMath.id_matiere,
        nom_cours: 'Mathématiques Avancées',
      },
    },
    update: {},
    create: {
      id_user: prof1.id_user,
      id_matiere: matMath.id_matiere,
      nom_cours: 'Mathématiques Avancées',
      description_cours: 'Approfondissement des concepts mathématiques fondamentaux',
    },
  })

  const coursFrancais = await prisma.cours.upsert({
    where: {
      id_matiere_nom_cours: {
        id_matiere: matFrancais.id_matiere,
        nom_cours: 'Littérature Française',
      },
    },
    update: {},
    create: {
      id_user: prof2.id_user,
      id_matiere: matFrancais.id_matiere,
      nom_cours: 'Littérature Française',
      description_cours: 'Étude des grands classiques de la littérature française',
    },
  })

  // Create devoirs
  const devoir1 = await prisma.devoir.upsert({
    where: {
      id_cours_nom_devoir: {
        id_cours: coursMath.id_cours,
        nom_devoir: 'Exercices sur les équations',
      },
    },
    update: {},
    create: {
      id_cours: coursMath.id_cours,
      id_matiere: matMath.id_matiere,
      nom_devoir: 'Exercices sur les équations',
      description_devoir: 'Résoudre des équations polynomiales',
      date_limite: new Date('2026-05-11T23:00:00'),
      coefficient: 2.5,
    },
  })

  const devoir2 = await prisma.devoir.upsert({
    where: {
      id_cours_nom_devoir: {
        id_cours: coursMath.id_cours,
        nom_devoir: 'Algèbre Linéaire',
      },
    },
    update: {},
    create: {
      id_cours: coursMath.id_cours,
      id_matiere: matMath.id_matiere,
      nom_devoir: 'Algèbre Linéaire',
      description_devoir: 'Matrices et systèmes',
      date_limite: new Date('2026-05-12T16:00:00'),
      coefficient: 2.0,
    },
  })

  const devoir3 = await prisma.devoir.upsert({
    where: {
      id_cours_nom_devoir: {
        id_cours: coursFrancais.id_cours,
        nom_devoir: 'Analyse de texte: Victor Hugo',
      },
    },
    update: {},
    create: {
      id_cours: coursFrancais.id_cours,
      id_matiere: matFrancais.id_matiere,
      nom_devoir: 'Analyse de texte: Victor Hugo',
      description_devoir: 'Analyse du poème de Victor Hugo',
      date_limite: new Date('2026-05-11T23:55:00'),
      coefficient: 1.5,
    },
  })

  // Associate professors to devoirs
  await prisma.assprofdevoir.createMany({
    data: [
      { id_user: prof1.id_user, id_devoir: devoir1.id_devoir },
      { id_user: prof1.id_user, id_devoir: devoir2.id_devoir },
      { id_user: prof2.id_user, id_devoir: devoir3.id_devoir },
    ],
    skipDuplicates: true,
  })

  // Create rendus
  await prisma.rendu.createMany({
    data: [
      {
        id_devoir: devoir1.id_devoir,
        id_user: eleve1.id_user,
        date_rendu: new Date('2025-04-15'),
        note: 18.5,
        retour: 'Très bon travail!',
      },
      {
        id_devoir: devoir1.id_devoir,
        id_user: eleve2.id_user,
        date_rendu: new Date('2025-04-14'),
        note: 16,
        retour: 'Bon travail',
      },
    ],
    skipDuplicates: true,
  })

  // Create evenements with correct matiere and icons
  const evenementsData: any[] = [
    {
      id_matiere: matFrancais.id_matiere,
      nom_evenement: 'Interrogation conjugaison',
      description: 'Interrogation surprise sur les conjugaisons',
      type_evenement: 'interrogation',
      date_evenement: new Date('2026-05-19T11:00:00'),
      duree_minutes: 30,
      icon_url: '/francais-devoir-icon.svg',
    },
    {
      id_matiere: matMath.id_matiere,
      nom_evenement: 'Interrogation fonctions',
      description: 'Interrogation sur les fonctions',
      type_evenement: 'interrogation',
      date_evenement: new Date('2026-05-19T13:00:00'),
      duree_minutes: 45,
      icon_url: '/maths-devoir-icon.svg',
    },
  ]

  if (matLangues) {
    evenementsData.push({
      id_matiere: matLangues.id_matiere,
      nom_evenement: 'Interrogation irregular verbs',
      description: 'Test sur les verbes irréguliers',
      type_evenement: 'interrogation',
      date_evenement: new Date('2026-05-19T13:00:00'),
      duree_minutes: 30,
      icon_url: '/langues-devoir-icon.svg',
    })
  }

  if (matHistoire) {
    evenementsData.push({
      id_matiere: matHistoire.id_matiere,
      nom_evenement: 'Examen Histoire',
      description: 'Examen final sur le cours complet',
      type_evenement: 'examen',
      date_evenement: new Date('2026-06-05T14:00:00'),
      duree_minutes: 120,
      icon_url: '/histoire-geo-devoir-icon.svg',
    })
  }

  await prisma.evenement.createMany({
    data: evenementsData,
    skipDuplicates: true,
  })

  // Matières par niveau
  const matieresByNiveau = {
    college: [
      'Mathématiques',
      'Français',
      'Anglais',
      'Espagnol',
      'Allemand',
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
      'Anglais',
      'Espagnol',
      'Allemand',
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
      'Anglais',
      'Espagnol',
      'Allemand',
      'Histoire-Géo',
      'Enseignement Scientifique',
      'Sport',
      'EMC',
    ],
    terminale: [
      'Philosophie',
      'Mathématiques',
      'Anglais',
      'Espagnol',
      'Allemand',
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

  console.log('✅ Seed OK (idempotent propre)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
