CREATE TABLE users(
   id_user BIGSERIAL PRIMARY KEY,
   nom VARCHAR(50) NOT NULL,
   prenom VARCHAR(50) NOT NULL,
   login VARCHAR(50) NOT NULL UNIQUE,
   hashed_password VARCHAR(255) NOT NULL,
   role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'professeur', 'eleve')),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eleves(
   id_user BIGINT PRIMARY KEY,
   classe VARCHAR(50),
   FOREIGN KEY(id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE professeurs(
   id_user BIGINT PRIMARY KEY,
   matiere VARCHAR(50),
   FOREIGN KEY(id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE cours(
   id_cours BIGSERIAL PRIMARY KEY,
   id_user BIGINT NOT NULL,
   nom_cours VARCHAR(50) NOT NULL,
   description_cours TEXT,
   FOREIGN KEY(id_user) REFERENCES professeurs(id_user)
);

CREATE TABLE devoirs(
   id_devoir BIGSERIAL PRIMARY KEY,
   id_cours BIGINT NOT NULL,
   nom_devoir VARCHAR(255) NOT NULL,
   description_devoir TEXT,
   coefficient DECIMAL(5,2),
   FOREIGN KEY(id_cours) REFERENCES cours(id_cours)
);

CREATE TABLE asso_professeur_devoir(
   id_user BIGINT NOT NULL,
   id_devoir BIGINT NOT NULL,
   PRIMARY KEY(id_user, id_devoir),
   FOREIGN KEY(id_user) REFERENCES professeurs(id_user),
   FOREIGN KEY(id_devoir) REFERENCES devoirs(id_devoir)
);

CREATE TABLE rendus(
   id_rendu BIGSERIAL PRIMARY KEY,
   id_devoir BIGINT NOT NULL,
   id_user BIGINT NOT NULL,
   date_rendu TIMESTAMP,
   note DECIMAL(5,2),
   retour VARCHAR(255),
   FOREIGN KEY(id_devoir) REFERENCES devoirs(id_devoir),
   FOREIGN KEY(id_user) REFERENCES eleves(id_user),
   UNIQUE(id_devoir, id_user)
);