/*
  Warnings:

  - You are about to drop the `_renduTouser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_renduTouser" DROP CONSTRAINT "_renduTouser_A_fkey";

-- DropForeignKey
ALTER TABLE "_renduTouser" DROP CONSTRAINT "_renduTouser_B_fkey";

-- DropForeignKey
ALTER TABLE "eleve" DROP CONSTRAINT "eleve_id_user_fkey";

-- DropForeignKey
ALTER TABLE "professeur" DROP CONSTRAINT "professeur_id_user_fkey";

-- DropTable
DROP TABLE "_renduTouser";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "utilisateur" (
    "id_user" BIGSERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "login" VARCHAR(50) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "_renduToutilisateur" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_renduToutilisateur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_login_key" ON "utilisateur"("login");

-- CreateIndex
CREATE INDEX "_renduToutilisateur_B_index" ON "_renduToutilisateur"("B");

-- AddForeignKey
ALTER TABLE "eleve" ADD CONSTRAINT "eleve_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeur" ADD CONSTRAINT "professeur_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_renduToutilisateur" ADD CONSTRAINT "_renduToutilisateur_A_fkey" FOREIGN KEY ("A") REFERENCES "rendu"("id_rendu") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_renduToutilisateur" ADD CONSTRAINT "_renduToutilisateur_B_fkey" FOREIGN KEY ("B") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
