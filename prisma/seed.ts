import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

const connectionString =
  process.env.DATABASE_URL || 'postgresql://nathanf:Nathan17111983!@postgres:5432/saintpierrestage'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

async function main() {
  console.log('🌱 Seed...')

  const passwordProf = await bcrypt.hash('prof123', 10)
  const passwordEleve = await bcrypt.hash('eleve123', 10)

  const prof1 = await prisma.utilisateur.upsert({
    where: { login: 'dupont.jean' },
    update: {
      nom: 'Dupont',
      prenom: 'Jean',
    },
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
    update: {
      nom: 'Martin',
      prenom: 'Marie',
    },
    create: {
      nom: 'Martin',
      prenom: 'Marie',
      login: 'martin.marie',
      email: 'martin.marie@gmail.com',
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

  const cours1 = await prisma.cours.upsert({
    where: {
      nom_cours: 'Mathématiques Avancées',
    },
    update: {},
    create: {
      id_user: prof1.id_user,
      nom_cours: 'Mathématiques Avancées',
      description_cours: 'Approfondissement des concepts mathématiques fondamentaux',
    },
  })

  const cours2 = await prisma.cours.upsert({
    where: { nom_cours: 'Littérature Française' },
    update: {},
    create: {
      id_user: prof2.id_user,
      nom_cours: 'Littérature Française',
      description_cours: 'Étude des grands classiques de la littérature française',
    },
  })

  const devoir1 = await prisma.devoir.upsert({
    where: { nom_devoir: 'Calcul Intégral' },
    update: {},
    create: {
      id_cours: cours1.id_cours,
      nom_devoir: 'Calcul Intégral',
      description_devoir: 'Exercices sur les intégrales',
      coefficient: 2.5,
    },
  })

  const devoir2 = await prisma.devoir.upsert({
    where: { nom_devoir: 'Algèbre Linéaire' },
    update: {},
    create: {
      id_cours: cours1.id_cours,
      nom_devoir: 'Algèbre Linéaire',
      description_devoir: 'Matrices et systèmes',
      coefficient: 2.0,
    },
  })

  const devoir3 = await prisma.devoir.upsert({
    where: { nom_devoir: 'Analyse de texte' },
    update: {},
    create: {
      id_cours: cours2.id_cours,
      nom_devoir: 'Analyse de texte',
      description_devoir: 'Molière',
      coefficient: 1.5,
    },
  })

  await prisma.assprofdevoir.createMany({
    data: [
      { id_user: prof1.id_user, id_devoir: devoir1.id_devoir },
      { id_user: prof1.id_user, id_devoir: devoir2.id_devoir },
      { id_user: prof2.id_user, id_devoir: devoir3.id_devoir },
    ],
    skipDuplicates: true,
  })

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

  console.log('✅ Seed OK (idempotent)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
