/*
  Warnings:

  - You are about to drop the column `classe` on the `eleve` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "eleve" DROP COLUMN "classe",
ADD COLUMN     "id_classe" BIGINT;

-- CreateTable
CREATE TABLE "classe" (
    "id_classe" BIGSERIAL NOT NULL,
    "niveau" VARCHAR(20) NOT NULL,
    "lettre" VARCHAR(1) NOT NULL,
    "nom_classe" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classe_pkey" PRIMARY KEY ("id_classe")
);

-- CreateTable
CREATE TABLE "specialite" (
    "id_specialite" BIGSERIAL NOT NULL,
    "nom_specialite" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialite_pkey" PRIMARY KEY ("id_specialite")
);

-- CreateTable
CREATE TABLE "option" (
    "id_option" BIGSERIAL NOT NULL,
    "nom_option" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_pkey" PRIMARY KEY ("id_option")
);

-- CreateTable
CREATE TABLE "_eleveTospecialite" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_eleveTospecialite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_eleveTooption" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_eleveTooption_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_classeToprofesseur" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_classeToprofesseur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "classe_nom_classe_key" ON "classe"("nom_classe");

-- CreateIndex
CREATE UNIQUE INDEX "classe_niveau_lettre_key" ON "classe"("niveau", "lettre");

-- CreateIndex
CREATE UNIQUE INDEX "specialite_nom_specialite_key" ON "specialite"("nom_specialite");

-- CreateIndex
CREATE UNIQUE INDEX "option_nom_option_key" ON "option"("nom_option");

-- CreateIndex
CREATE INDEX "_eleveTospecialite_B_index" ON "_eleveTospecialite"("B");

-- CreateIndex
CREATE INDEX "_eleveTooption_B_index" ON "_eleveTooption"("B");

-- CreateIndex
CREATE INDEX "_classeToprofesseur_B_index" ON "_classeToprofesseur"("B");

-- AddForeignKey
ALTER TABLE "eleve" ADD CONSTRAINT "eleve_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "classe"("id_classe") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eleveTospecialite" ADD CONSTRAINT "_eleveTospecialite_A_fkey" FOREIGN KEY ("A") REFERENCES "eleve"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eleveTospecialite" ADD CONSTRAINT "_eleveTospecialite_B_fkey" FOREIGN KEY ("B") REFERENCES "specialite"("id_specialite") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eleveTooption" ADD CONSTRAINT "_eleveTooption_A_fkey" FOREIGN KEY ("A") REFERENCES "eleve"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eleveTooption" ADD CONSTRAINT "_eleveTooption_B_fkey" FOREIGN KEY ("B") REFERENCES "option"("id_option") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_classeToprofesseur" ADD CONSTRAINT "_classeToprofesseur_A_fkey" FOREIGN KEY ("A") REFERENCES "classe"("id_classe") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_classeToprofesseur" ADD CONSTRAINT "_classeToprofesseur_B_fkey" FOREIGN KEY ("B") REFERENCES "professeur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
