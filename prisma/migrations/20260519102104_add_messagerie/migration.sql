-- CreateTable
CREATE TABLE "message" (
    "id_message" BIGSERIAL NOT NULL,
    "id_expediteur" BIGINT NOT NULL,
    "id_destinataire" BIGINT NOT NULL,
    "sujet" VARCHAR(255) NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lu" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id_message")
);

-- CreateTable
CREATE TABLE "piece_jointe" (
    "id_piece_jointe" BIGSERIAL NOT NULL,
    "id_message" BIGINT NOT NULL,
    "nom_fichier" VARCHAR(255) NOT NULL,
    "chemin_fichier" VARCHAR(500) NOT NULL,
    "type_fichier" VARCHAR(50) NOT NULL,
    "taille_octets" BIGINT NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "piece_jointe_pkey" PRIMARY KEY ("id_piece_jointe")
);

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_id_expediteur_fkey" FOREIGN KEY ("id_expediteur") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_id_destinataire_fkey" FOREIGN KEY ("id_destinataire") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece_jointe" ADD CONSTRAINT "piece_jointe_id_message_fkey" FOREIGN KEY ("id_message") REFERENCES "message"("id_message") ON DELETE CASCADE ON UPDATE CASCADE;
