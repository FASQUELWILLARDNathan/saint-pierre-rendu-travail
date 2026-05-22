-- AlterTable
ALTER TABLE "cours" ADD COLUMN     "id_option" BIGINT,
ADD COLUMN     "id_specialite" BIGINT;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_id_specialite_fkey" FOREIGN KEY ("id_specialite") REFERENCES "specialite"("id_specialite") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_id_option_fkey" FOREIGN KEY ("id_option") REFERENCES "option"("id_option") ON DELETE SET NULL ON UPDATE CASCADE;
