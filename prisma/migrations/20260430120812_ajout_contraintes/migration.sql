/*
  Warnings:

  - A unique constraint covering the columns `[nom_cours]` on the table `cours` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nom_devoir]` on the table `devoir` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cours_nom_cours_key" ON "cours"("nom_cours");

-- CreateIndex
CREATE UNIQUE INDEX "devoir_nom_devoir_key" ON "devoir"("nom_devoir");
