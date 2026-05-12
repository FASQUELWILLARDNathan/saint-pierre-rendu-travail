/*
  Warnings:

  - A unique constraint covering the columns `[id_matiere,nom_cours]` on the table `cours` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_matiere` to the `cours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_matiere` to the `devoir` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "cours_nom_cours_key";

-- AlterTable
ALTER TABLE "cours" ADD COLUMN     "id_matiere" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "devoir" ADD COLUMN     "date_limite" TIMESTAMP(3),
ADD COLUMN     "id_matiere" BIGINT NOT NULL;

-- CreateTable
CREATE TABLE "matiere" (
    "id_matiere" BIGSERIAL NOT NULL,
    "nom_matiere" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "couleur" VARCHAR(7),
    "icon_url" TEXT,
    "devoir_icon_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matiere_pkey" PRIMARY KEY ("id_matiere")
);

-- CreateTable
CREATE TABLE "evenement" (
    "id_evenement" BIGSERIAL NOT NULL,
    "id_matiere" BIGINT NOT NULL,
    "nom_evenement" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type_evenement" VARCHAR(50) NOT NULL,
    "date_evenement" TIMESTAMP(3) NOT NULL,
    "duree_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evenement_pkey" PRIMARY KEY ("id_evenement")
);

-- CreateIndex
CREATE UNIQUE INDEX "matiere_nom_matiere_key" ON "matiere"("nom_matiere");

-- CreateIndex
CREATE UNIQUE INDEX "cours_id_matiere_nom_cours_key" ON "cours"("id_matiere", "nom_cours");

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_id_matiere_fkey" FOREIGN KEY ("id_matiere") REFERENCES "matiere"("id_matiere") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoir" ADD CONSTRAINT "devoir_id_matiere_fkey" FOREIGN KEY ("id_matiere") REFERENCES "matiere"("id_matiere") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_id_matiere_fkey" FOREIGN KEY ("id_matiere") REFERENCES "matiere"("id_matiere") ON DELETE RESTRICT ON UPDATE CASCADE;
