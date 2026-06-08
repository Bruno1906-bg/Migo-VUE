<template>
  <div class="home">
    <header class="header">
      <nav class="navbar">
        <div class="logo">
          <img src="../assets/LogoMigo.jpeg" alt="MIGO Logo">
        </div>
      </nav>
    </header>

    <section class="Anuncio1">
      <div class="Anuncio1-content">
        <h1>Conoce la mejor opcion para el bienestar de tu mascota.</h1>
        <p>Reporta, Adopta y Cuida.</p>
        
        <div class="cta-container">
          <!-- Usamos <router-link> en lugar de <a> para navegar sin recargar la página -->
          <router-link to="/login" class="cta-button login">Iniciar sesión</router-link>
          <router-link to="/crear-cuenta" class="cta-button register">Crear cuenta</router-link>
        </div>
      </div>
    </section>

    <!-- El resto de tus secciones se copian igual -->
    <section class="features">
      <div class="feature-item">
        <img src="../assets/imagen3.webp" alt="publicaciones">
        <h4>Publicaciones de mascotas perdidas.</h4>
        <p>Seguimiento a publicaciones de mascotas perdidas.</p>
      </div>
      <!-- ... (resto de tus items) -->
    </section>

    <main class="contenedor-inicio" id="acceso">
      <h2 class="titulo-seccion">¿Qué deseas hacer hoy?</h2>
      <div class="menu">
        <router-link to="/dashboard" class="card">
          <h3>Realizar publicacion.</h3>
          <p>Realiza tu primera publicación o ve la de los demas usuarios.</p>
        </router-link>
        <!-- ... (resto de tus cards) -->
      </div>
    </main>

    <footer class="pie-pagina">
      <p>MIGO || FBJB-CodeTeam </p>
    </footer>
  </div>
</template>
<script setup>
</script>
<style scoped src="../ScreenLandingPage/ScreenLandingPage.css"></style>
