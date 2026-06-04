<template>
  <div class="classes-page">
    <Sidebar />

    <div class="classes-content">
      <h1>Informations RGPD</h1>

      <div class="classes-container">
        <div class="section">
          <h2>1. Cadre général</h2>
          <p>
            La plateforme <strong>Saint Pierre Plateforme</strong> est utilisée dans le cadre des
            missions d’enseignement et de suivi pédagogique de l’Institution Saint-Pierre Calais.
          </p>
          <p>
            Les traitements de données personnelles sont réalisés conformément au Règlement (UE)
            2016/679 (RGPD) et à la loi Informatique et Libertés.
          </p>
        </div>

        <div class="section">
          <h2>2. Responsable du traitement</h2>
          <p>
            Le responsable du traitement est
            <strong>ASSOCIATION DE GESTION DE L'INSTITUTION SAINT-PIERRE CALAIS</strong>, située
            au 26 RUE DU FOUR A CHAUX, 62100 CALAIS, FRANCE.
          </p>
        </div>

        <div class="section">
          <h2>3. Délégué à la Protection des Données</h2>
          <p>
            Aucun Délégué à la Protection des Données (DPO) n’a été formellement désigné. Pour toute
            question relative à la protection des données, vous pouvez contacter :
            <strong>direction@saintpierrecalais.fr</strong>.
          </p>
        </div>

        <div class="section">
          <h2>4. Registre des traitements</h2>
          <p>
            Les principaux traitements concernent :
          </p>
          <ul>
            <li>la gestion des comptes utilisateurs ;</li>
            <li>la gestion des devoirs, rendus et notes ;</li>
            <li>la communication interne entre l’établissement et les utilisateurs.</li>
          </ul>
        </div>

        <div class="section">
          <h2>5. Droits des personnes</h2>
          <p>
            Chaque utilisateur dispose des droits suivants sur ses données : accès, rectification,
            effacement, limitation, opposition, et, le cas échéant, portabilité.
          </p>
          <p>
            Les demandes peuvent être adressées à : <strong>direction@saintpierrecalais.fr</strong>.
          </p>
        </div>

        <div class="section">
          <h2>6. Sous-traitants et hébergement</h2>
          <p>
            Les données sont hébergées chez <strong>OVH</strong>, en France. Les prestataires
            techniques intervenant sur la plateforme agissent en qualité de sous-traitants et sont
            soumis à des obligations de confidentialité et de sécurité.
          </p>
        </div>

        <div class="section">
          <h2>7. Sécurité des données</h2>
          <p>
            Des mesures techniques et organisationnelles sont mises en œuvre pour garantir un niveau
            de sécurité adapté aux risques (contrôle d’accès, journalisation, sauvegardes, etc.).
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
