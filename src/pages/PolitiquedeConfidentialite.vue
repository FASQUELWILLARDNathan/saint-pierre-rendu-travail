<template>
  <div class="classes-page">
    <Sidebar />

    <div class="classes-content">
      <h1>Politique de confidentialité</h1>

      <div class="classes-container">
        <div class="section">
          <h2>1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données collectées via la plateforme
            <strong>Saint Pierre Plateforme</strong> est
            <strong>ASSOCIATION DE GESTION DE L'INSTITUTION SAINT-PIERRE CALAIS</strong>.
          </p>
        </div>

        <div class="section">
          <h2>2. Données collectées</h2>
          <p>
            Dans le cadre de l’utilisation de la plateforme, les données suivantes peuvent être
            collectées :
          </p>
          <ul>
            <li>Identité : nom, prénom, identifiant de connexion ;</li>
            <li>Données scolaires : classe, devoirs, rendus, notes ;</li>
            <li>Données de connexion : logs techniques, date et heure de connexion.</li>
          </ul>
        </div>

        <div class="section">
          <h2>3. Finalités du traitement</h2>
          <p>Les données sont utilisées pour :</p>
          <ul>
            <li>la gestion des comptes utilisateurs ;</li>
            <li>le suivi pédagogique (devoirs, rendus, notes) ;</li>
            <li>la communication interne entre l’établissement et les utilisateurs.</li>
          </ul>
        </div>

        <div class="section">
          <h2>4. Base légale</h2>
          <p>
            Les traitements sont fondés sur l’intérêt légitime de l’établissement et sur les
            missions d’enseignement et de suivi pédagogique.
          </p>
        </div>

        <div class="section">
          <h2>5. Durée de conservation</h2>
          <p>
            Les données sont conservées pendant la durée de la scolarité de l’élève au sein de
            l’établissement, puis archivées ou supprimées conformément aux obligations légales.
          </p>
        </div>

        <div class="section">
          <h2>6. Destinataires des données</h2>
          <p>
            Les données sont accessibles uniquement aux personnels habilités de l’établissement
            (direction, enseignants, personnels administratifs) et aux prestataires techniques
            intervenant sur la plateforme, dans la limite de leurs missions.
          </p>
        </div>

        <div class="section">
          <h2>7. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement,
            de limitation et d’opposition au traitement de vos données.
          </p>
          <p>
            Pour exercer vos droits, vous pouvez contacter l’établissement à l’adresse suivante :
            <strong>direction@saintpierrecalais.fr</strong>.
          </p>
        </div>

        <div class="section">
          <h2>8. Sécurité</h2>
          <p>
            Des mesures techniques et organisationnelles sont mises en œuvre pour protéger les
            données contre tout accès non autorisé, perte ou altération.
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

ul {
  margin-left: 20px;
  margin-bottom: 12px;
  color: #444;
}

li {
  margin-bottom: 4px;
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
