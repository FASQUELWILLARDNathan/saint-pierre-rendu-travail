-- ============================================================
-- Schéma PostgreSQL généré depuis le schéma Prisma
-- ============================================================

-- Enum Role
CREATE TYPE "Role" AS ENUM ('eleve', 'professeur', 'administrateur');

-- ============================================================
-- Tables indépendantes (sans clés étrangères)
-- ============================================================

CREATE TABLE "matiere" (
    "id_matiere"      BIGSERIAL PRIMARY KEY,
    "nom_matiere"     VARCHAR(50)  NOT NULL UNIQUE,
    "description"     TEXT,
    "couleur"         VARCHAR(7),
    "icon_url"        TEXT,
    "devoir_icon_url" TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "specialite" (
    "id_specialite"  BIGSERIAL PRIMARY KEY,
    "nom_specialite" VARCHAR(50)  NOT NULL UNIQUE,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "option" (
    "id_option"  BIGSERIAL PRIMARY KEY,
    "nom_option" VARCHAR(50)  NOT NULL UNIQUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "classe" (
    "id_classe"  BIGSERIAL PRIMARY KEY,
    "niveau"     VARCHAR(20) NOT NULL,
    "lettre"     VARCHAR(1)  NOT NULL,
    "nom_classe" VARCHAR(50) NOT NULL UNIQUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("niveau", "lettre")
);

CREATE TABLE "utilisateur" (
    "id_user"            BIGSERIAL PRIMARY KEY,
    "nom"                VARCHAR(50)  NOT NULL,
    "prenom"             VARCHAR(50)  NOT NULL,
    "login"              VARCHAR(50)  NOT NULL UNIQUE,
    "email"              VARCHAR(255) NOT NULL UNIQUE,
    "hashed_password"    VARCHAR(255) NOT NULL,
    "role"               "Role"       NOT NULL,
    "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reset_token"        TEXT,
    "reset_token_expiry" TIMESTAMP(3)
);

-- ============================================================
-- Extensions utilisateur (héritent de utilisateur)
-- ============================================================

CREATE TABLE "eleve" (
    "id_user"   BIGINT PRIMARY KEY,
    "id_classe" BIGINT,
    "annee"     VARCHAR(50),
    CONSTRAINT "fk_eleve_user"
        FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE,
    CONSTRAINT "fk_eleve_classe"
        FOREIGN KEY ("id_classe") REFERENCES "classe"("id_classe") ON DELETE SET NULL
);

CREATE TABLE "professeur" (
    "id_user" BIGINT PRIMARY KEY,
    "matiere" VARCHAR(50),
    CONSTRAINT "fk_professeur_user"
        FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE
);

-- ============================================================
-- Tables de liaison N:N
-- ============================================================

CREATE TABLE "_eleveTospecialite" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,
    PRIMARY KEY ("A", "B"),
    CONSTRAINT "fk_elevespe_eleve"
        FOREIGN KEY ("A") REFERENCES "eleve"("id_user") ON DELETE CASCADE,
    CONSTRAINT "fk_elevespe_spe"
        FOREIGN KEY ("B") REFERENCES "specialite"("id_specialite") ON DELETE CASCADE
);

CREATE TABLE "_eleveTooption" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,
    PRIMARY KEY ("A", "B"),
    CONSTRAINT "fk_eleveopt_eleve"
        FOREIGN KEY ("A") REFERENCES "eleve"("id_user") ON DELETE CASCADE,
    CONSTRAINT "fk_eleveopt_option"
        FOREIGN KEY ("B") REFERENCES "option"("id_option") ON DELETE CASCADE
);

CREATE TABLE "_professeurTospecialite" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,
    PRIMARY KEY ("A", "B"),
    CONSTRAINT "fk_profspe_prof"
        FOREIGN KEY ("A") REFERENCES "professeur"("id_user") ON DELETE CASCADE,
    CONSTRAINT "fk_profspe_spe"
        FOREIGN KEY ("B") REFERENCES "specialite"("id_specialite") ON DELETE CASCADE
);

CREATE TABLE "_optionToprofesseur" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,
    PRIMARY KEY ("A", "B"),
    CONSTRAINT "fk_profopt_prof"
        FOREIGN KEY ("A") REFERENCES "professeur"("id_user") ON DELETE CASCADE,
    CONSTRAINT "fk_profopt_option"
        FOREIGN KEY ("B") REFERENCES "option"("id_option") ON DELETE CASCADE
);

CREATE TABLE "_classeToprofesseur" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,
    PRIMARY KEY ("A", "B"),
    CONSTRAINT "fk_classeprof_classe"
        FOREIGN KEY ("A") REFERENCES "classe"("id_classe") ON DELETE CASCADE,
    CONSTRAINT "fk_classeprof_prof"
        FOREIGN KEY ("B") REFERENCES "professeur"("id_user") ON DELETE CASCADE
);

CREATE TABLE "_classeTomatiere" (
    "id_classe"  BIGINT NOT NULL,
    "id_matiere" BIGINT NOT NULL,
    PRIMARY KEY ("id_classe", "id_matiere"),
    CONSTRAINT "fk_classematiere_classe"
        FOREIGN KEY ("id_classe") REFERENCES "classe"("id_classe") ON DELETE CASCADE,
    CONSTRAINT "fk_classematiere_matiere"
        FOREIGN KEY ("id_matiere") REFERENCES "matiere"("id_matiere") ON DELETE CASCADE
);

-- ============================================================
-- Cours et ressources
-- ============================================================

CREATE TABLE "cours" (
    "id_cours"          BIGSERIAL PRIMARY KEY,
    "id_user"           BIGINT       NOT NULL,
    "id_matiere"        BIGINT,
    "id_classe"         BIGINT,
    "id_specialite"     BIGINT,
    "id_option"         BIGINT,
    "nom_cours"         VARCHAR(50)  NOT NULL,
    "description_cours" TEXT,
    CONSTRAINT "fk_cours_prof"
        FOREIGN KEY ("id_user")       REFERENCES "professeur"("id_user"),
    CONSTRAINT "fk_cours_matiere"
        FOREIGN KEY ("id_matiere")    REFERENCES "matiere"("id_matiere"),
    CONSTRAINT "fk_cours_classe"
        FOREIGN KEY ("id_classe")     REFERENCES "classe"("id_classe"),
    CONSTRAINT "fk_cours_specialite"
        FOREIGN KEY ("id_specialite") REFERENCES "specialite"("id_specialite"),
    CONSTRAINT "fk_cours_option"
        FOREIGN KEY ("id_option")     REFERENCES "option"("id_option")
);

CREATE TABLE "ressource_cours" (
    "id_ressource"   BIGSERIAL PRIMARY KEY,
    "id_cours"       BIGINT       NOT NULL,
    "nom_fichier"    VARCHAR(255) NOT NULL,
    "chemin_fichier" VARCHAR(500) NOT NULL,
    "type_fichier"   TEXT         NOT NULL,
    "taille_octets"  BIGINT       NOT NULL,
    "date_ajout"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_ressource_cours"
        FOREIGN KEY ("id_cours") REFERENCES "cours"("id_cours") ON DELETE CASCADE
);

-- ============================================================
-- Devoirs et fichiers associés
-- ============================================================

CREATE TABLE "devoir" (
    "id_devoir"          BIGSERIAL PRIMARY KEY,
    "id_cours"           BIGINT       NOT NULL,
    "nom_devoir"         VARCHAR(255) NOT NULL,
    "description_devoir" TEXT,
    "date_limite"        TIMESTAMP(3),
    "coefficient"        DECIMAL(5, 2),
    CONSTRAINT "fk_devoir_cours"
        FOREIGN KEY ("id_cours") REFERENCES "cours"("id_cours"),
    UNIQUE ("id_cours", "nom_devoir")
);

CREATE TABLE "DevoirFichier" (
    "id"          BIGSERIAL PRIMARY KEY,
    "nom_fichier" TEXT   NOT NULL,
    "chemin"      TEXT   NOT NULL,
    "type"        TEXT,
    "taille"      INTEGER,
    "id_devoir"   BIGINT NOT NULL,
    CONSTRAINT "fk_devoirfichier_devoir"
        FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir")
);

CREATE TABLE "piece_jointe_devoir" (
    "id_piece_jointe_devoir" BIGSERIAL PRIMARY KEY,
    "nom_fichier"            TEXT         NOT NULL,
    "chemin_fichier"         TEXT         NOT NULL,
    "type_fichier"           TEXT         NOT NULL,
    "taille_octets"          BIGINT       NOT NULL,
    "id_devoir"              BIGINT       NOT NULL,
    "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_pjdevoir_devoir"
        FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir") ON DELETE CASCADE
);
CREATE INDEX "idx_piece_jointe_devoir_id_devoir" ON "piece_jointe_devoir"("id_devoir");

-- Table de liaison professeur <-> devoir
CREATE TABLE "assprofdevoir" (
    "id_user"   BIGINT NOT NULL,
    "id_devoir" BIGINT NOT NULL,
    PRIMARY KEY ("id_user", "id_devoir"),
    CONSTRAINT "fk_assprofdevoir_prof"
        FOREIGN KEY ("id_user")   REFERENCES "professeur"("id_user"),
    CONSTRAINT "fk_assprofdevoir_devoir"
        FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir")
);

-- ============================================================
-- Rendus et pièces jointes
-- ============================================================

CREATE TABLE "rendu" (
    "id_rendu"   BIGSERIAL PRIMARY KEY,
    "id_devoir"  BIGINT       NOT NULL,
    "id_user"    BIGINT       NOT NULL,
    "date_rendu" TIMESTAMP(3),
    "note"       DECIMAL(5, 2),
    "retour"     VARCHAR(255),
    "archive"    BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT "fk_rendu_devoir"
        FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir"),
    CONSTRAINT "fk_rendu_eleve"
        FOREIGN KEY ("id_user")   REFERENCES "eleve"("id_user"),
    UNIQUE ("id_devoir", "id_user")
);

CREATE TABLE "piece_jointe_rendu" (
    "id_piece_jointe" BIGSERIAL PRIMARY KEY,
    "id_rendu"        BIGINT       NOT NULL,
    "nom_fichier"     VARCHAR(255) NOT NULL,
    "chemin_fichier"  VARCHAR(500) NOT NULL,
    "type_fichier"    TEXT         NOT NULL,
    "taille_octets"   BIGINT       NOT NULL,
    "date_ajout"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_pjrendu_rendu"
        FOREIGN KEY ("id_rendu") REFERENCES "rendu"("id_rendu") ON DELETE CASCADE
);

-- ============================================================
-- Événements
-- ============================================================

CREATE TABLE "evenement" (
    "id_evenement"   BIGSERIAL PRIMARY KEY,
    "id_matiere"     BIGINT,
    "id_specialite"  BIGINT,
    "id_option"      BIGINT,
    "nom_evenement"  VARCHAR(255) NOT NULL,
    "description"    TEXT,
    "type_evenement" VARCHAR(50)  NOT NULL,
    "date_evenement" TIMESTAMP(3) NOT NULL,
    "duree_minutes"  INTEGER,
    "icon_url"       TEXT,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_evenement_matiere"
        FOREIGN KEY ("id_matiere")    REFERENCES "matiere"("id_matiere"),
    CONSTRAINT "fk_evenement_specialite"
        FOREIGN KEY ("id_specialite") REFERENCES "specialite"("id_specialite"),
    CONSTRAINT "fk_evenement_option"
        FOREIGN KEY ("id_option")     REFERENCES "option"("id_option")
);

-- ============================================================
-- Messagerie
-- ============================================================

CREATE TABLE "message" (
    "id_message"      BIGSERIAL PRIMARY KEY,
    "id_expediteur"   BIGINT       NOT NULL,
    "id_destinataire" BIGINT       NOT NULL,
    "sujet"           VARCHAR(255) NOT NULL,
    "contenu"         TEXT         NOT NULL,
    "date_envoi"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lu"              BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT "fk_message_expediteur"
        FOREIGN KEY ("id_expediteur")   REFERENCES "utilisateur"("id_user") ON DELETE CASCADE,
    CONSTRAINT "fk_message_destinataire"
        FOREIGN KEY ("id_destinataire") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE
);

CREATE TABLE "piece_jointe" (
    "id_piece_jointe" BIGSERIAL PRIMARY KEY,
    "id_message"      BIGINT       NOT NULL,
    "nom_fichier"     VARCHAR(255) NOT NULL,
    "chemin_fichier"  VARCHAR(500) NOT NULL,
    "type_fichier"    TEXT         NOT NULL,
    "taille_octets"   BIGINT       NOT NULL,
    "date_ajout"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_pj_message"
        FOREIGN KEY ("id_message") REFERENCES "message"("id_message") ON DELETE CASCADE
);