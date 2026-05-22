-- CreateTable
CREATE TABLE "_classeTomatiere" (
    "id_classe" BIGINT NOT NULL,
    "id_matiere" BIGINT NOT NULL,

    CONSTRAINT "_classeTomatiere_pkey" PRIMARY KEY ("id_classe","id_matiere")
);

-- AddForeignKey
ALTER TABLE "_classeTomatiere" ADD CONSTRAINT "_classeTomatiere_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "classe"("id_classe") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_classeTomatiere" ADD CONSTRAINT "_classeTomatiere_id_matiere_fkey" FOREIGN KEY ("id_matiere") REFERENCES "matiere"("id_matiere") ON DELETE CASCADE ON UPDATE CASCADE;
