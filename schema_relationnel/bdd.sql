CREATE TABLE utilisateurs(
   id_user BIGINT,
   nom VARCHAR(50) NOT NULL,
   prenom VARCHAR(50) NOT NULL,
   login VARCHAR(50) NOT NULL,
   email VARCHAR(255) NOT NULL,
   hashed_password VARCHAR(255) NOT NULL,
   role VARCHAR(50),
   created_at DATETIME,
   reset_token TEXT,
   reset_token_expiry DATETIME,
   PRIMARY KEY(id_user)
);

CREATE TABLE eleves(
   id_user BIGINT,
   classe VARCHAR(50),
   annee VARCHAR(50),
   PRIMARY KEY(id_user),
   FOREIGN KEY(id_user) REFERENCES utilisateurs(id_user)
);

CREATE TABLE professeurs(
   id_user BIGINT,
   matiere VARCHAR(50),
   PRIMARY KEY(id_user),
   FOREIGN KEY(id_user) REFERENCES utilisateurs(id_user)
);

CREATE TABLE cours(
   id_cours INT,
   nom_cours VARCHAR(50) NOT NULL,
   description_cours TEXT,
   id_user BIGINT NOT NULL,
   PRIMARY KEY(id_cours),
   UNIQUE(nom_cours),
   FOREIGN KEY(id_user) REFERENCES professeurs(id_user)
);

CREATE TABLE devoirs(
   id_devoir BIGINT,
   nom_devoir VARCHAR(255) NOT NULL,
   description_devoir TEXT,
   coefficient DECIMAL(5,2),
   id_cours INT NOT NULL,
   PRIMARY KEY(id_devoir),
   FOREIGN KEY(id_cours) REFERENCES cours(id_cours)
);

CREATE TABLE rendre(
   id_user BIGINT,
   id_devoir BIGINT,
   date_rendu DATETIME,
   note DECIMAL(5,2),
   retour VARCHAR(255),
   PRIMARY KEY(id_user, id_devoir),
   FOREIGN KEY(id_user) REFERENCES eleves(id_user),
   FOREIGN KEY(id_devoir) REFERENCES devoirs(id_devoir)
);

CREATE TABLE associer(
   id_user BIGINT,
   id_devoir BIGINT,
   PRIMARY KEY(id_user, id_devoir),
   FOREIGN KEY(id_user) REFERENCES professeurs(id_user),
   FOREIGN KEY(id_devoir) REFERENCES devoirs(id_devoir)
);
