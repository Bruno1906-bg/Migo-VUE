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
        <router-link to="/perfil" class="menu-item">
         ° Mi Perfil
        </router-link>
        <router-link to="/veterinarios" class="menu-item active">
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
                  placeholder="Busca tu veterinaria ideal aqui..."
                  class="search-input"
                >
            </div>
        </header>
        <main class="feed-section">
            <h2 class="feed-title">Encuentra  tu servicio ideal aqui!</h2>

            <div class="publicaciones-grid">
                <div v-if="veterinarias.length === 0" class="empty-feed">
                    <p>No se encontraron veterinarias en su ubicacion....💩</p>
                </div>
            </div>
        </main>
    </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const veterinarias = ref([]);
const router = useRouter();

const handleLogout = () => {
    sessionStorage.removeItem('migo_user');
    router.push('/');
};
</script>
<style scoped src="./ScreenVeterinarios.css">
</style>