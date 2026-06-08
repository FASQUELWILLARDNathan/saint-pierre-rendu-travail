<template>
  <div class="classes-page">
    <Sidebar />

    <div class="classes-content">
      <h1>Mentions légales</h1>

      <div class="classes-container">
        <!-- SECTION : Éditeur du site -->
        <div class="section">
          <h2>Éditeur du site</h2>
          <p>
            Le site <strong>Saint Pierre Plateforme</strong> est édité par
            <strong>ASSOCIATION DE GESTION DE L'INSTITUTION SAINT-PIERRE CALAIS</strong>,
            association déclarée auprès de la <strong>62 – Sous-préfecture de Calais</strong>.
          </p>

          <p>
            <strong>Représentante légale :</strong> Estelle Jusselme<br />
            <strong>Adresse :</strong> 26 RUE DU FOUR A CHAUX, 62100 CALAIS, FRANCE<br />
            <strong>RNA :</strong> W626000377<br />
            <strong>Assujetti à la TVA :</strong> Non
          </p>
          <p>
            <strong>Directrice de la publication :</strong> Estelle Jusselme<br />
            <strong>Responsable de la rédaction :</strong> Estelle Jusselme
          </p>
        </div>

        <!-- SECTION : Informations sur le site -->
        <div class="section">
          <h2>Informations sur le site</h2>
          <p>
            <strong>Nom du site :</strong> Saint Pierre Plateforme<br />
            <strong>URL :</strong>
            <a href="https://saintpierrecalais.fr" target="_blank">
              https://saintpierrecalais.fr
            </a>
          </p>
        </div>

        <!-- SECTION : Hébergement -->
        <div class="section">
          <h2>Hébergement</h2>
          <p>
            Le site est hébergé par <strong>OVH</strong>.<br />
            OVH SAS – 2 rue Kellermann – 59100 Roubaix – France.
          </p>
        </div>

        <!-- SECTION : Contact -->
        <div class="section">
          <h2>Contact</h2>
          <p>
            <strong>Email :</strong> direction@saintpierrecalais.fr<br />
            <strong>Téléphone :</strong> 06 25 36 71 77<br />
            <strong>Adresse postale :</strong> 26 RUE DU FOUR A CHAUX, 62100 CALAIS, FRANCE
          </p>
        </div>

        <!-- SECTION : Données personnelles -->
        <div class="section">
          <h2>Données personnelles</h2>
          <p>
            Le site collecte des données personnelles dans le cadre de son fonctionnement (gestion
            des comptes, devoirs, communications internes).
          </p>

          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
            d’un droit d’accès, de rectification, de suppression et d’opposition concernant vos
            données.
          </p>

          <p>
            <strong>Délégué à la Protection des Données (DPO) :</strong> Aucun DPO n’a été désigné.
          </p>
        </div>

        <!-- SECTION : Cookies -->
        <div class="section">
          <h2>Cookies</h2>
          <p>
            Le site utilise des cookies techniques nécessaires à son fonctionnement. Aucun cookie
            publicitaire ou de suivi externe n’est utilisé.
          </p>
        </div>

        <!-- SECTION : Propriété intellectuelle -->
        <div class="section">
          <h2>Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus présents sur le site (textes, images, logos, documents) sont la
            propriété exclusive de l’Association Saint-Pierre Calais ou de leurs auteurs respectifs.
          </p>
        </div>

        <!-- SECTION : Limitation de responsabilité -->
        <div class="section">
          <h2>Limitation de responsabilité</h2>
          <p>
            L’éditeur du site ne saurait être tenu responsable en cas de dysfonctionnement,
            interruption ou indisponibilité du service.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/home/Sidebar.vue'
</script>

<style scoped>
/* On réutilise exactement ta DA */
* {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
}

.classes-page {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.classes-content {
  flex: 1;
  margin-left: 180px;
  padding: 24px;
}

h1 {
  color: #205781;
  margin-bottom: 24px;
  font-size: 28px;
}

h2 {
  color: #205781;
  margin: 24px 0 16px 0;
  font-size: 20px;
  border-bottom: 2px solid #4f959d;
  padding-bottom: 8px;
}

p {
  margin-bottom: 12px;
  color: #444;
  line-height: 1.5;
}

a {
  color: #205781;
  text-decoration: underline;
}

.classes-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .classes-content {
    margin-left: 0;
    padding: 16px;
  }
}
</style>
