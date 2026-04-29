import 'dotenv/config'
import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

const connectionString =
  process.env.DATABASE_URL || 'postgresql://nathanf:Nathan17111983!@postgres:5432/saintpierrestage'

const adapter = new PrismaPg({
  connectionString,
})

const prisma = new PrismaClient({ adapter })

export default prisma

async function main() {
  console.log('🌱 Début du seed de la base de données...')

  // 🔥 Nettoyage (ordre SAFE)
  console.log('🗑️ Nettoyage des données existantes...')

  await prisma.rendu.deleteMany()
  await prisma.assprofdevoir.deleteMany()
  await prisma.devoir.deleteMany()
  await prisma.cours.deleteMany()
  await prisma.eleve.deleteMany()
  await prisma.professeur.deleteMany()
  await prisma.user.deleteMany()

  // 👨‍🏫 PROFESSEURS
  console.log('👨‍🏫 Création des professeurs...')

  const prof1 = await prisma.user.create({
    data: {
      nom: 'Dupont',
      prenom: 'Jean',
      login: 'jdupont',
      hashed_password: await bcrypt.hash('prof123', 10),
      role: 'professeur',
      professeur: {
        create: {
          matiere: 'Mathématiques',
        },
      },
    },
  })

  const prof2 = await prisma.user.create({
    data: {
      nom: 'Martin',
      prenom: 'Marie',
      login: 'mmartin',
      hashed_password: await bcrypt.hash('prof123', 10),
      role: 'professeur',
      professeur: {
        create: {
          matiere: 'Français',
        },
      },
    },
  })

  // 👨‍🎓 ÉLÈVES
  console.log('👨‍🎓 Création des élèves...')

  const eleve1 = await prisma.user.create({
    data: {
      nom: 'Moreau',
      prenom: 'Pierre',
      login: 'pmoreau',
      hashed_password: await bcrypt.hash('eleve123', 10),
      role: 'eleve',
      eleve: {
        create: {
          classe: 'BUT2 Informatique',
          annee: '2025-2026',
        },
      },
    },
  })

  const eleve2 = await prisma.user.create({
    data: {
      nom: 'Bernard',
      prenom: 'Sophie',
      login: 'sbernard',
      hashed_password: await bcrypt.hash('eleve123', 10),
      role: 'eleve',
      eleve: {
        create: {
          classe: 'BUT2 Informatique',
          annee: '2025-2026',
        },
      },
    },
  })

  const eleve3 = await prisma.user.create({
    data: {
      nom: 'Thomas',
      prenom: 'Luc',
      login: 'lthomas',
      hashed_password: await bcrypt.hash('eleve123', 10),
      role: 'eleve',
      eleve: {
        create: {
          classe: 'BUT2 Informatique',
          annee: '2025-2026',
        },
      },
    },
  })

  // 📚 COURS
  console.log('📚 Création des cours...')

  const cours1 = await prisma.cours.create({
    data: {
      id_user: prof1.id_user,
      nom_cours: 'Mathématiques Avancées',
      description_cours: 'Approfondissement des concepts mathématiques fondamentaux',
    },
  })

  const cours2 = await prisma.cours.create({
    data: {
      id_user: prof2.id_user,
      nom_cours: 'Littérature Française',
      description_cours: 'Étude des grands classiques de la littérature française',
    },
  })

  // 📝 DEVOIRS
  console.log('📝 Création des devoirs...')

  const devoir1 = await prisma.devoir.create({
    data: {
      id_cours: cours1.id_cours,
      nom_devoir: 'Calcul Intégral',
      description_devoir: 'Exercices sur les intégrales et primitives',
      coefficient: 2.5,
    },
  })

  const devoir2 = await prisma.devoir.create({
    data: {
      id_cours: cours1.id_cours,
      nom_devoir: 'Algèbre Linéaire',
      description_devoir: 'Matrices et systèmes linéaires',
      coefficient: 2.0,
    },
  })

  const devoir3 = await prisma.devoir.create({
    data: {
      id_cours: cours2.id_cours,
      nom_devoir: 'Analyse de texte',
      description_devoir: 'Commentaire composé sur une œuvre de Molière',
      coefficient: 1.5,
    },
  })

  // 🔗 ASSO PROF-DEVOIR
  console.log('🔗 Associations...')

  await prisma.assprofdevoir.createMany({
    data: [
      { id_user: prof1.id_user, id_devoir: devoir1.id_devoir },
      { id_user: prof1.id_user, id_devoir: devoir2.id_devoir },
      { id_user: prof2.id_user, id_devoir: devoir3.id_devoir },
    ],
  })

  // ✅ RENDUS
  console.log('📨 Création des rendus...')

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
        note: 16.0,
        retour: 'Bon travail, quelques erreurs mineures',
      },
      {
        id_devoir: devoir2.id_devoir,
        id_user: eleve3.id_user,
        date_rendu: new Date('2025-04-16'),
        note: 14.5,
        retour: 'À revoir certains calculs',
      },
      {
        id_devoir: devoir3.id_devoir,
        id_user: eleve1.id_user,
        date_rendu: new Date('2025-04-17'),
        note: 17.0,
        retour: 'Excellente analyse!',
      },
    ],
  })

  console.log('✨ Seed terminé avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
