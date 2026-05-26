/*
  Warnings:

  - You are about to drop the column `id_matiere` on the `devoir` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "devoir" DROP CONSTRAINT "devoir_id_matiere_fkey";

-- AlterTable
ALTER TABLE "devoir" DROP COLUMN "id_matiere";

-- CreateTable
CREATE TABLE "piece_jointe_rendu" (
    "id_piece_jointe" BIGSERIAL NOT NULL,
    "id_rendu" BIGINT NOT NULL,
    "nom_fichier" VARCHAR(255) NOT NULL,
    "chemin_fichier" VARCHAR(500) NOT NULL,
    "type_fichier" VARCHAR(50) NOT NULL,
    "taille_octets" BIGINT NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "piece_jointe_rendu_pkey" PRIMARY KEY ("id_piece_jointe")
);

-- AddForeignKey
ALTER TABLE "piece_jointe_rendu" ADD CONSTRAINT "piece_jointe_rendu_id_rendu_fkey" FOREIGN KEY ("id_rendu") REFERENCES "rendu"("id_rendu") ON DELETE CASCADE ON UPDATE CASCADE;
