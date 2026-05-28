-- DropForeignKey
ALTER TABLE "evenement" DROP CONSTRAINT "evenement_id_matiere_fkey";

-- AlterTable
ALTER TABLE "evenement" ADD COLUMN     "id_option" BIGINT,
ADD COLUMN     "id_specialite" BIGINT,
ALTER COLUMN "id_matiere" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_id_matiere_fkey" FOREIGN KEY ("id_matiere") REFERENCES "matiere"("id_matiere") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_id_specialite_fkey" FOREIGN KEY ("id_specialite") REFERENCES "specialite"("id_specialite") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_id_option_fkey" FOREIGN KEY ("id_option") REFERENCES "option"("id_option") ON DELETE SET NULL ON UPDATE CASCADE;
