import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

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
    where: { id_user: prof3.id_user },
    update: {},
    create: {
      id_user: prof3.id_user,
      matiere: 'Langues',
    },
  })

  // Create eleves
  for (const eleve of [eleve1, eleve2, eleve3]) {
    await prisma.eleve.upsert({
      where: { id_user: eleve.id_user },
      update: {},
      create: {
        id_user: eleve.id_user,
        classe: 'BUT2 Informatique',
        annee: '2025-2026',
      },
    })
  }

  // Create matieres with colors and icons from the frontend config
  const matMath = await prisma.matiere.upsert({
    where: { nom_matiere: 'Mathématiques' },
    update: {},
    create: {
      nom_matiere: 'Mathématiques',
      description:
        '​La mathématique est une science qui étudie, par le biais du raisonnement logique et déductif, les propriétés et les relations qui existent entre les objets abstraits. Parmi ces objets abstraits, on note les nombres, les figures géométriques, les fonctions, les espaces, etc.',
      couleur: '#0EA304',
      icon_url: '/maths-icon.svg',
      devoir_icon_url: '/maths-devoir-icon.svg',
    },
  })

  const matFrancais = await prisma.matiere.upsert({
    where: { nom_matiere: 'Français' },
    update: {},
    create: {
      nom_matiere: 'Français',
      description:
        "L'enseignement du français développe les compétences en lecture, écriture, expression orale et analyse littéraire.",
      couleur: '#70BEFA',
      icon_url: '/francais-icon.svg',
      devoir_icon_url: '/francais-devoir-icon.svg',
    },
  })

  const matLangues = await prisma.matiere.upsert({
    where: { nom_matiere: 'Langues' },
    update: {},
    create: {
      nom_matiere: 'Langues',
      description: 'Anglais, Espagnol, Allemand',
      couleur: '#FF0000',
      icon_url: '/langues-icon.svg',
      devoir_icon_url: '/anglais-devoir-icon.svg',
    },
  })

  const matHistoire = await prisma.matiere.upsert({
    where: { nom_matiere: 'Histoire-Géo' },
    update: {},
    create: {
      nom_matiere: 'Histoire-Géo',
      description: 'Histoire Géographie et Education Civique et Moral',
      couleur: '#FF6600',
      icon_url: '/histoire-geo-icon.svg',
      devoir_icon_url: '/histoire-geo-devoir-icon.svg',
    },
  })

  const matSciences = await prisma.matiere.upsert({
    where: { nom_matiere: 'Sciences' },
    update: {},
    create: {
      nom_matiere: 'Sciences',
      description: 'Physique, Chimie et SVT',
      couleur: '#FF5CF4',
      icon_url: '/sciences-icon.svg',
      devoir_icon_url: '/sciences-devoir-icon.svg',
    },
  })

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
  await prisma.evenement.createMany({
    data: [
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
      {
        id_matiere: matLangues.id_matiere,
        nom_evenement: 'Interrogation irregular verbs',
        description: 'Test sur les verbes irréguliers',
        type_evenement: 'interrogation',
        date_evenement: new Date('2026-05-19T13:00:00'),
        duree_minutes: 30,
        icon_url: '/langues-devoir-icon.svg',
      },
      {
        id_matiere: matHistoire.id_matiere,
        nom_evenement: 'Examen Histoire',
        description: 'Examen final sur le cours complet',
        type_evenement: 'examen',
        date_evenement: new Date('2026-06-05T14:00:00'),
        duree_minutes: 120,
        icon_url: '/histoire-geo-devoir-icon.svg',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed OK (idempotent propre)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
