-- DropForeignKey
ALTER TABLE "_optionToprofesseur" DROP CONSTRAINT "_optionToprofesseur_A_fkey";

-- DropForeignKey
ALTER TABLE "_optionToprofesseur" DROP CONSTRAINT "_optionToprofesseur_B_fkey";

-- DropIndex
DROP INDEX "_classeToprofesseur_B_index";

-- DropIndex
DROP INDEX "_eleveTooption_B_index";

-- DropIndex
DROP INDEX "_eleveTospecialite_B_index";

-- DropIndex
DROP INDEX "_optionToprofesseur_B_index";

-- DropIndex
DROP INDEX "_professeurTospecialite_B_index";

-- AlterTable
ALTER TABLE "_classeToprofesseur" RENAME CONSTRAINT "_classeToprofesseur_AB_pkey" TO "_classeToprofesseur_pkey";

-- AlterTable
ALTER TABLE "_eleveTooption" RENAME CONSTRAINT "_eleveTooption_AB_pkey" TO "_eleveTooption_pkey";

-- AlterTable
ALTER TABLE "_eleveTospecialite" RENAME CONSTRAINT "_eleveTospecialite_AB_pkey" TO "_eleveTospecialite_pkey";

-- AlterTable
ALTER TABLE "_optionToprofesseur" RENAME CONSTRAINT "_optionToprofesseur_AB_pkey" TO "_optionToprofesseur_pkey";

-- AlterTable
ALTER TABLE "_professeurTospecialite" RENAME CONSTRAINT "_professeurTospecialite_AB_pkey" TO "_professeurTospecialite_pkey";

-- AddForeignKey
ALTER TABLE "_optionToprofesseur" ADD CONSTRAINT "_optionToprofesseur_A_fkey" FOREIGN KEY ("A") REFERENCES "professeur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionToprofesseur" ADD CONSTRAINT "_optionToprofesseur_B_fkey" FOREIGN KEY ("B") REFERENCES "option"("id_option") ON DELETE CASCADE ON UPDATE CASCADE;
