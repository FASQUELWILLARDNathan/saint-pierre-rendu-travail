/*
  Warnings:

  - You are about to drop the `AssProfDevoir` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Devoir` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Eleve` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Professeur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rendu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RenduToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssProfDevoir" DROP CONSTRAINT "AssProfDevoir_id_devoir_fkey";

-- DropForeignKey
ALTER TABLE "AssProfDevoir" DROP CONSTRAINT "AssProfDevoir_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Cours" DROP CONSTRAINT "Cours_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Devoir" DROP CONSTRAINT "Devoir_id_cours_fkey";

-- DropForeignKey
ALTER TABLE "Eleve" DROP CONSTRAINT "Eleve_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Professeur" DROP CONSTRAINT "Professeur_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Rendu" DROP CONSTRAINT "Rendu_id_devoir_fkey";

-- DropForeignKey
ALTER TABLE "Rendu" DROP CONSTRAINT "Rendu_id_user_fkey";

-- DropForeignKey
ALTER TABLE "_RenduToUser" DROP CONSTRAINT "_RenduToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RenduToUser" DROP CONSTRAINT "_RenduToUser_B_fkey";

-- DropTable
DROP TABLE "AssProfDevoir";

-- DropTable
DROP TABLE "Cours";

-- DropTable
DROP TABLE "Devoir";

-- DropTable
DROP TABLE "Eleve";

-- DropTable
DROP TABLE "Professeur";

-- DropTable
DROP TABLE "Rendu";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_RenduToUser";

-- CreateTable
CREATE TABLE "user" (
    "id_user" BIGSERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "login" VARCHAR(50) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "eleve" (
    "id_user" BIGINT NOT NULL,
    "classe" VARCHAR(50),
    "annee" VARCHAR(50),

    CONSTRAINT "eleve_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "professeur" (
    "id_user" BIGINT NOT NULL,
    "matiere" VARCHAR(50),

    CONSTRAINT "professeur_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "cours" (
    "id_cours" BIGSERIAL NOT NULL,
    "id_user" BIGINT NOT NULL,
    "nom_cours" VARCHAR(50) NOT NULL,
    "description_cours" TEXT,

    CONSTRAINT "cours_pkey" PRIMARY KEY ("id_cours")
);

-- CreateTable
CREATE TABLE "devoir" (
    "id_devoir" BIGSERIAL NOT NULL,
    "id_cours" BIGINT NOT NULL,
    "nom_devoir" VARCHAR(255) NOT NULL,
    "description_devoir" TEXT,
    "coefficient" DECIMAL(5,2),

    CONSTRAINT "devoir_pkey" PRIMARY KEY ("id_devoir")
);

-- CreateTable
CREATE TABLE "assprofdevoir" (
    "id_user" BIGINT NOT NULL,
    "id_devoir" BIGINT NOT NULL,

    CONSTRAINT "assprofdevoir_pkey" PRIMARY KEY ("id_user","id_devoir")
);

-- CreateTable
CREATE TABLE "rendu" (
    "id_rendu" BIGSERIAL NOT NULL,
    "id_devoir" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "date_rendu" TIMESTAMP(3),
    "note" DECIMAL(5,2),
    "retour" VARCHAR(255),

    CONSTRAINT "rendu_pkey" PRIMARY KEY ("id_rendu")
);

-- CreateTable
CREATE TABLE "_renduTouser" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_renduTouser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_login_key" ON "user"("login");

-- CreateIndex
CREATE UNIQUE INDEX "rendu_id_devoir_id_user_key" ON "rendu"("id_devoir", "id_user");

-- CreateIndex
CREATE INDEX "_renduTouser_B_index" ON "_renduTouser"("B");

-- AddForeignKey
ALTER TABLE "eleve" ADD CONSTRAINT "eleve_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeur" ADD CONSTRAINT "professeur_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "professeur"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoir" ADD CONSTRAINT "devoir_id_cours_fkey" FOREIGN KEY ("id_cours") REFERENCES "cours"("id_cours") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assprofdevoir" ADD CONSTRAINT "assprofdevoir_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "professeur"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assprofdevoir" ADD CONSTRAINT "assprofdevoir_id_devoir_fkey" FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendu" ADD CONSTRAINT "rendu_id_devoir_fkey" FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendu" ADD CONSTRAINT "rendu_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "eleve"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_renduTouser" ADD CONSTRAINT "_renduTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "rendu"("id_rendu") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_renduTouser" ADD CONSTRAINT "_renduTouser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
