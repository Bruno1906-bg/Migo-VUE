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
        <img src="../../assets/imagen4.jpg" alt="veterinarias">
        <h4>Brindamos servicios para mascotas.</h4>
        <p>Encuentra el servicio ideal para tu mascota de veterinarios certificados.</p>
      </div>
    </section>

    <section class="Anuncio2">
      <div class="Anuncio2-content">
        <h1>Uniendo huellas y salvando vidas.</h1>
        <p>La plataforma ideal para cualquier amigo peludo.</p>
      </div>
    </section>

    <main>
      <section class="Anuncio3">
      <div class="Anuncio3-content">
        <h1>Realiza tu primera publicacion.</h1>
        <p>Realiza una publicacion o ve la de otros usuarios..📸🐶😽</p>
        <div class="cta-container">
          <router-link to="/login" class="cta-button login">Publicacion</router-link>
        </div>
      </div>
    </section>
 
    <section class="Anuncio4">
      <div class="Anuncio4-content">
        <h1>Consulta servicios.</h1>
        <p>Consulta los mejores servicios para tu mascota..🔎🧑‍⚕️👩‍⚕️</p>
        <div class="cta-container">
          <router-link to="/login" class="cta-button login">Servicios</router-link>
        </div>
      </div>
    </section>
    </main>
    <footer class="pie-pagina">
      <p>MIGO || FBJB-CodeTeam </p>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped src="./ScreenLandingPage.css">
</style>