<template>
    <div>
        <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item">
         ° Publicaciones
        </router-link>
        <router-link to="/perfil" class="menu-item active">
         ° Mi Perfil
        </router-link>
        <router-link to="/veterinarios" class="menu-item">
         ° Veterinarios
        </router-link>
        <router-link to="/servicios" class="menu-item">
         ° Otros servicios
        </router-link>
        <router-link to="/ajustes" class="menu-item">
          ° Ajustes
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">
          Cerrar Sesión
        </button>
      </div>
    </aside>
    <div class="main-content">
        <header class="top-bar">
        </header>
        <main class="feed-section">
            <h2 class="feed-title">Bienvenido a tu perfil 😊</h2>
        </main>
    </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();

const handleLogout = () => {
    sessionStorage.removeItem('migo_user');
    router.push('/');
};
</script>
<style scoped src="./ScreenMiperfil.css">
</style>