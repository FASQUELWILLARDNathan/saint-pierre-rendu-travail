-- CreateTable
CREATE TABLE "_professeurTospecialite" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_professeurTospecialite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_optionToprofesseur" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_optionToprofesseur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_professeurTospecialite_B_index" ON "_professeurTospecialite"("B");

-- CreateIndex
CREATE INDEX "_optionToprofesseur_B_index" ON "_optionToprofesseur"("B");

-- AddForeignKey
ALTER TABLE "_professeurTospecialite" ADD CONSTRAINT "_professeurTospecialite_A_fkey" FOREIGN KEY ("A") REFERENCES "professeur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_professeurTospecialite" ADD CONSTRAINT "_professeurTospecialite_B_fkey" FOREIGN KEY ("B") REFERENCES "specialite"("id_specialite") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionToprofesseur" ADD CONSTRAINT "_optionToprofesseur_A_fkey" FOREIGN KEY ("A") REFERENCES "option"("id_option") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionToprofesseur" ADD CONSTRAINT "_optionToprofesseur_B_fkey" FOREIGN KEY ("B") REFERENCES "professeur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
