/*
  Warnings:

  - A unique constraint covering the columns `[id_cours,nom_devoir]` on the table `devoir` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `role` on the `utilisateur` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('eleve', 'professeur', 'administrateur');

-- DropIndex
DROP INDEX "devoir_nom_devoir_key";

-- AlterTable
ALTER TABLE "utilisateur" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "devoir_id_cours_nom_devoir_key" ON "devoir"("id_cours", "nom_devoir");
