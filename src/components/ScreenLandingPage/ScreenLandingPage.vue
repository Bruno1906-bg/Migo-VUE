<template>
  <div class="home">
    <header class="header">
      <nav class="navbar">
        <div class="logo">
          <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
        </div>
      </nav>
    </header>

    <section class="Anuncio1">
      <div class="Anuncio1-content">
        <h1>Conoce la mejor opción para el bienestar de tu mascota.</h1>
        <p>Reporta, Adopta y Cuida.</p>
        
        <div class="cta-container">
          <router-link to="/login" class="cta-button login">Iniciar sesión</router-link>
          <router-link to="/crearcuenta" class="cta-button register">Crear cuenta</router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="feature-item">
        <img src="../../assets/imagen3.webp" alt="publicaciones">
        <h4>Publicaciones de mascotas perdidas.</h4>
        <p>Seguimiento a publicaciones de mascotas perdidas.</p>
      </div>
      <div class="feature-item">
        <img src="../../assets/imagen2.jpg" alt="adopcion">
        <h4>Adopción de mascotas.</h4>
        <p>Encuentra la mascota ideal para ti.</p>
      </div>
    </section>

    <section class="Anuncio2">
      <div class="Anuncio2-content">
        <h1>Uniendo huellas y salvando vidas.</h1>
        <p>La plataforma ideal para cualquier amigo peludo.</p>
      </div>
    </section>

    <main class="anuncios-grid">
      <section class="Anuncio3">
        <div class="Anuncio3-content">
          <h1>Realiza tu primera publicación.</h1>
          <p>Realiza una publicación o ve la de otros usuarios..📸🐶😽</p>
          <div class="cta-container">
            <router-link to="/login" class="cta-button login">Publicación</router-link>
          </div>
        </div>
      </section>
 
      <section class="Anuncio4">
        <div class="Anuncio4-content">
          <h1>¿Quieres adoptar una mascota?</h1>
          <p>Encuentra la mascota ideal para ti!🐶😽</p>
          <div class="cta-container">
            <router-link to="/login" class="cta-button login">Adopta</router-link>
          </div>
        </div>
      </section>
    </main>

    <section class="Anuncio5">
      <div class="Anuncio5-content">
        <h1>¿Eres dueño de algún negocio?</h1>
        <p>Regístrate aquí para darte a conocer!😊</p>
        <div class="cta-container">
          <router-link to="/loginVet" class="cta-button login">Registrar mi negocio</router-link>
        </div>
      </div>
    </section>

    <footer class="pie-pagina">
      <p>MIGO || FBJB-CodeTeam </p>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped src="./ScreenLandingPage.css"></style>
