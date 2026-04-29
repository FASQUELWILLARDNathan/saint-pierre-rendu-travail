-- CreateTable
CREATE TABLE "User" (
    "id_user" BIGSERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "login" VARCHAR(50) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Eleve" (
    "id_user" BIGINT NOT NULL,
    "classe" VARCHAR(50),
    "annee" VARCHAR(50),

    CONSTRAINT "Eleve_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Professeur" (
    "id_user" BIGINT NOT NULL,
    "matiere" VARCHAR(50),

    CONSTRAINT "Professeur_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Cours" (
    "id_cours" BIGSERIAL NOT NULL,
    "id_user" BIGINT NOT NULL,
    "nom_cours" VARCHAR(50) NOT NULL,
    "description_cours" TEXT,

    CONSTRAINT "Cours_pkey" PRIMARY KEY ("id_cours")
);

-- CreateTable
CREATE TABLE "Devoir" (
    "id_devoir" BIGSERIAL NOT NULL,
    "id_cours" BIGINT NOT NULL,
    "nom_devoir" VARCHAR(255) NOT NULL,
    "description_devoir" TEXT,
    "coefficient" DECIMAL(5,2),

    CONSTRAINT "Devoir_pkey" PRIMARY KEY ("id_devoir")
);

-- CreateTable
CREATE TABLE "AssProfDevoir" (
    "id_user" BIGINT NOT NULL,
    "id_devoir" BIGINT NOT NULL,

    CONSTRAINT "AssProfDevoir_pkey" PRIMARY KEY ("id_user","id_devoir")
);

-- CreateTable
CREATE TABLE "Rendu" (
    "id_rendu" BIGSERIAL NOT NULL,
    "id_devoir" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "date_rendu" TIMESTAMP(3),
    "note" DECIMAL(5,2),
    "retour" VARCHAR(255),

    CONSTRAINT "Rendu_pkey" PRIMARY KEY ("id_rendu")
);

-- CreateTable
CREATE TABLE "_RenduToUser" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_RenduToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Rendu_id_devoir_id_user_key" ON "Rendu"("id_devoir", "id_user");

-- CreateIndex
CREATE INDEX "_RenduToUser_B_index" ON "_RenduToUser"("B");

-- AddForeignKey
ALTER TABLE "Eleve" ADD CONSTRAINT "Eleve_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professeur" ADD CONSTRAINT "Professeur_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Professeur"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devoir" ADD CONSTRAINT "Devoir_id_cours_fkey" FOREIGN KEY ("id_cours") REFERENCES "Cours"("id_cours") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssProfDevoir" ADD CONSTRAINT "AssProfDevoir_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Professeur"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssProfDevoir" ADD CONSTRAINT "AssProfDevoir_id_devoir_fkey" FOREIGN KEY ("id_devoir") REFERENCES "Devoir"("id_devoir") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rendu" ADD CONSTRAINT "Rendu_id_devoir_fkey" FOREIGN KEY ("id_devoir") REFERENCES "Devoir"("id_devoir") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rendu" ADD CONSTRAINT "Rendu_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Eleve"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RenduToUser" ADD CONSTRAINT "_RenduToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Rendu"("id_rendu") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RenduToUser" ADD CONSTRAINT "_RenduToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
