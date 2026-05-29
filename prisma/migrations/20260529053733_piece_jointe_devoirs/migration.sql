-- CreateTable
CREATE TABLE "DevoirFichier" (
    "id" BIGSERIAL NOT NULL,
    "nom_fichier" TEXT NOT NULL,
    "chemin" TEXT NOT NULL,
    "type" TEXT,
    "taille" INTEGER,
    "id_devoir" BIGINT NOT NULL,

    CONSTRAINT "DevoirFichier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piece_jointe_devoir" (
    "id_piece_jointe_devoir" BIGSERIAL NOT NULL,
    "nom_fichier" TEXT NOT NULL,
    "chemin_fichier" TEXT NOT NULL,
    "type_fichier" TEXT NOT NULL,
    "taille_octets" BIGINT NOT NULL,
    "id_devoir" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "piece_jointe_devoir_pkey" PRIMARY KEY ("id_piece_jointe_devoir")
);

-- CreateIndex
CREATE INDEX "piece_jointe_devoir_id_devoir_idx" ON "piece_jointe_devoir"("id_devoir");

-- AddForeignKey
ALTER TABLE "DevoirFichier" ADD CONSTRAINT "DevoirFichier_id_devoir_fkey" FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece_jointe_devoir" ADD CONSTRAINT "piece_jointe_devoir_id_devoir_fkey" FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir") ON DELETE CASCADE ON UPDATE CASCADE;
