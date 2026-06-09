<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item active">
         ° Publicaciones
        </router-link>
        <router-link to="/perfil" class="menu-item">
         ° Mi Perfil
        </router-link>
        <router-link to="/veterinarios" class="menu-item">
         ° Veterinarios
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
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Busca una publicacion en especifico.."
            class="search-input"
          >
        </div>
        <router-link to="/crearpublicacion">
          <button class="btn-create">Nueva Publicación</button>
        </router-link>
      </header>

      <main class="feed-section">
        <h2 class="feed-title">Reportes Recientes en la Comunidad</h2>
        
        <div class="publications-grid">
          <div v-if="publicaciones.length === 0" class="empty-feed">
            <p>No hay reportes recientes para mostrar.</p>
          </div>
          
          <div v-for="pub in publicaciones" :key="pub.id" class="pub-card">
            </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');
const publicaciones = ref([]);

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  router.push('/');
};
</script>

<style scoped src="../ScreenDashboard/ScreenDashboard.css">
</style>