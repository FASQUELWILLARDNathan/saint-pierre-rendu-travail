-- DropForeignKey
ALTER TABLE "cours" DROP CONSTRAINT "cours_id_matiere_fkey";

-- AlterTable
ALTER TABLE "cours" ALTER COLUMN "id_matiere" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_id_matiere_fkey" FOREIGN KEY ("id_matiere") REFERENCES "matiere"("id_matiere") ON DELETE SET NULL ON UPDATE CASCADE;
