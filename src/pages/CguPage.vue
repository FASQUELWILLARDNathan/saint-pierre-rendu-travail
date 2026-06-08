<template>
  <div class="classes-page">
    <Sidebar />

    <div class="classes-content">
      <h1>Conditions Générales d’Utilisation</h1>

      <div class="classes-container">
        <div class="section">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales d’Utilisation (CGU) ont pour objet de définir les
            modalités d’accès et d’utilisation de la plateforme
            <strong>Saint Pierre Plateforme</strong>.
          </p>
          <p>
            L’accès au site est réservé aux membres de la communauté éducative de l’Institution
            Saint-Pierre Calais (élèves, parents, enseignants, personnels).
          </p>
        </div>

        <div class="section">
          <h2>2. Accès au service</h2>
          <p>
            L’accès à la plateforme nécessite la création d’un compte utilisateur fourni par
            l’établissement. L’utilisateur est responsable de la confidentialité de ses
            identifiants.
          </p>
          <p>
            Toute connexion ou action réalisée avec ses identifiants est réputée effectuée par lui.
          </p>
        </div>

        <div class="section">
          <h2>3. Utilisation conforme</h2>
          <p>L’utilisateur s’engage à utiliser la plateforme dans le respect :</p>
          <ul>
            <li>des lois et règlements en vigueur ;</li>
            <li>du règlement intérieur de l’établissement ;</li>
            <li>des règles de courtoisie et de respect d’autrui.</li>
          </ul>
          <p>
            Toute utilisation abusive, frauduleuse ou portant atteinte à l’image de l’établissement
            pourra entraîner la suspension ou la suppression du compte.
          </p>
        </div>

        <div class="section">
          <h2>4. Contenus</h2>
          <p>
            Les contenus pédagogiques, documents, devoirs et informations mis à disposition sur la
            plateforme sont destinés exclusivement à un usage scolaire interne.
          </p>
          <p>Toute reproduction, diffusion ou partage non autorisé est interdit.</p>
        </div>

        <div class="section">
          <h2>5. Disponibilité du service</h2>
          <p>
            L’éditeur s’efforce d’assurer l’accessibilité de la plateforme, sans garantie d’une
            disponibilité continue. Des interruptions peuvent survenir pour maintenance ou
            amélioration.
          </p>
        </div>

        <div class="section">
          <h2>6. Modification des CGU</h2>
          <p>
            Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés
            en cas de changement significatif.
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
