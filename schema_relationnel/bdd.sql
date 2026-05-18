-- Roles possibles pour un utilisateur
CREATE TYPE role AS ENUM ('eleve', 'professeur', 'administrateur');


CREATE TABLE matiere (
    id_matiere        BIGSERIAL       PRIMARY KEY,
    nom_matiere       VARCHAR(50)     NOT NULL UNIQUE,
    description       TEXT,
    couleur           VARCHAR(7),
    icon_url          TEXT,
    devoir_icon_url   TEXT,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE specialite (
    id_specialite     BIGSERIAL       PRIMARY KEY,
    nom_specialite    VARCHAR(50)     NOT NULL UNIQUE,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE option (
    id_option         BIGSERIAL       PRIMARY KEY,
    nom_option        VARCHAR(50)     NOT NULL UNIQUE,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE classe (
    id_classe         BIGSERIAL       PRIMARY KEY,
    niveau            VARCHAR(20)     NOT NULL,
    lettre            VARCHAR(1)      NOT NULL,
    nom_classe        VARCHAR(50)     NOT NULL UNIQUE,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (niveau, lettre)
);

CREATE TABLE utilisateur (
    id_user               BIGSERIAL       PRIMARY KEY,
    nom                   VARCHAR(50)     NOT NULL,
    prenom                VARCHAR(50)     NOT NULL,
    login                 VARCHAR(50)     NOT NULL UNIQUE,
    email                 VARCHAR(255)    NOT NULL UNIQUE,
    hashed_password       VARCHAR(255)    NOT NULL,
    role                  role            NOT NULL,
    created_at            TIMESTAMP       NOT NULL DEFAULT NOW(),
    reset_token           TEXT,
    reset_token_expiry    TIMESTAMP
);

CREATE TABLE eleve (
    id_user       BIGINT      PRIMARY KEY,
    id_classe     BIGINT,
    annee         VARCHAR(50),
    FOREIGN KEY (id_user)   REFERENCES utilisateur(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_classe) REFERENCES classe(id_classe)    ON DELETE SET NULL
);

CREATE TABLE professeur (
    id_user   BIGINT          PRIMARY KEY,
    matiere   VARCHAR(50),
    FOREIGN KEY (id_user) REFERENCES utilisateur(id_user) ON DELETE CASCADE
);

CREATE TABLE cours (
    id_cours          BIGSERIAL       PRIMARY KEY,
    id_user           BIGINT          NOT NULL,
    id_matiere        BIGINT          NOT NULL,
    nom_cours         VARCHAR(50)     NOT NULL,
    description_cours TEXT,
    UNIQUE (id_matiere, nom_cours),
    FOREIGN KEY (id_user)   REFERENCES professeur(id_user),
    FOREIGN KEY (id_matiere) REFERENCES matiere(id_matiere)
);

CREATE TABLE devoir (
    id_devoir           BIGSERIAL       PRIMARY KEY,
    id_cours            BIGINT          NOT NULL,
    id_matiere          BIGINT          NOT NULL,
    nom_devoir          VARCHAR(255)    NOT NULL,
    description_devoir  TEXT,
    date_limite         TIMESTAMP,
    coefficient         DECIMAL(5, 2),
    UNIQUE (id_cours, nom_devoir),
    FOREIGN KEY (id_cours)   REFERENCES cours(id_cours),
    FOREIGN KEY (id_matiere) REFERENCES matiere(id_matiere)
);

CREATE TABLE rendu (
    id_rendu      BIGSERIAL       PRIMARY KEY,
    id_devoir     BIGINT          NOT NULL,
    id_user       BIGINT          NOT NULL,
    date_rendu    TIMESTAMP,
    note          DECIMAL(5, 2),
    retour        VARCHAR(255),
    UNIQUE (id_devoir, id_user),
    FOREIGN KEY (id_devoir) REFERENCES devoir(id_devoir),
    FOREIGN KEY (id_user)   REFERENCES eleve(id_user)
);


CREATE TABLE evenement (
    id_evenement      BIGSERIAL       PRIMARY KEY,
    id_matiere        BIGINT          NOT NULL,
    nom_evenement     VARCHAR(255)    NOT NULL,
    description       TEXT,
    type_evenement    VARCHAR(50)     NOT NULL,
    date_evenement    TIMESTAMP       NOT NULL,
    duree_minutes     INT,
    icon_url          TEXT,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_matiere) REFERENCES matiere(id_matiere)
);


CREATE TABLE _eleveTospecialite (
    A   BIGINT  NOT NULL,
    B   BIGINT  NOT NULL,
    PRIMARY KEY (A, B),
    FOREIGN KEY (A) REFERENCES eleve(id_user)         ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES specialite(id_specialite) ON DELETE CASCADE
);

CREATE TABLE _eleveTooption (
    A   BIGINT  NOT NULL,
    B   BIGINT  NOT NULL,
    PRIMARY KEY (A, B),
    FOREIGN KEY (A) REFERENCES eleve(id_user)     ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES option(id_option)  ON DELETE CASCADE
);

CREATE TABLE _professeurTospecialite (
    A   BIGINT  NOT NULL,
    B   BIGINT  NOT NULL,
    PRIMARY KEY (A, B),
    FOREIGN KEY (A) REFERENCES professeur(id_user)        ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES specialite(id_specialite)  ON DELETE CASCADE
);

CREATE TABLE _optionToprofesseur (
    A   BIGINT  NOT NULL,
    B   BIGINT  NOT NULL,
    PRIMARY KEY (A, B),
    FOREIGN KEY (A) REFERENCES professeur(id_user)  ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES option(id_option)    ON DELETE CASCADE
);

CREATE TABLE _classeToprofesseur (
    A   BIGINT  NOT NULL,
    B   BIGINT  NOT NULL,
    PRIMARY KEY (A, B),
    FOREIGN KEY (A) REFERENCES classe(id_classe)    ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES professeur(id_user)  ON DELETE CASCADE
);

CREATE TABLE assprofdevoir (
    id_user     BIGINT  NOT NULL,
    id_devoir   BIGINT  NOT NULL,
    PRIMARY KEY (id_user, id_devoir),
    FOREIGN KEY (id_user)   REFERENCES professeur(id_user),
    FOREIGN KEY (id_devoir) REFERENCES devoir(id_devoir)
);