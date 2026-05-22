-- AlterTable
ALTER TABLE "cours" ADD COLUMN     "id_classe" BIGINT;

-- CreateTable
CREATE TABLE "ressource_cours" (
    "id_ressource" BIGSERIAL NOT NULL,
    "id_cours" BIGINT NOT NULL,
    "nom_fichier" VARCHAR(255) NOT NULL,
    "chemin_fichier" VARCHAR(500) NOT NULL,
    "type_fichier" VARCHAR(50) NOT NULL,
    "taille_octets" BIGINT NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ressource_cours_pkey" PRIMARY KEY ("id_ressource")
);

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "classe"("id_classe") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ressource_cours" ADD CONSTRAINT "ressource_cours_id_cours_fkey" FOREIGN KEY ("id_cours") REFERENCES "cours"("id_cours") ON DELETE CASCADE ON UPDATE CASCADE;
