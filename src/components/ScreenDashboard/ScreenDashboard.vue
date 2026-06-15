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
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Busca una publicacion aqui.."
            class="search-input"
          >
        </div>
        <router-link to="/crearpublicacion">
          <button class="btn-create">Nueva Publicación</button>
        </router-link>
      </header>

      <main class="feed-section">
        <h2 class="feed-title">Reportes Recientes en la Comunidad</h2>
        
        <div class="grid-publicaciones">
    <div v-for="pub in publicaciones" :key="pub.id" class="pub-card">
        <img :src="'http://localhost:4000/uploads/' + pub.imagen" 
             :alt="pub.nombre" 
             class="pub-image">
             
        <div class="pub-info">
            <h3>{{ pub.nombre }}</h3>
            <p>{{ pub.descripcion }}</p>
            <p><small>Colonia: {{ pub.nombre_colonia }}</small></p>
        </div>
    </div>
</div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const publicaciones = ref([]);
const router = useRouter();

const cargarPublicaciones = async () => {
    try {
        const res = await fetch('http://localhost:4000/api/publicacione2/publicaciones2');
        
        if (!res.ok) throw new Error('Error al cargar publicaciones');
        
        const data = await res.json();
        publicaciones.value = data; 
    } catch (err) {
        console.error("Error:", err);
    }
};

onMounted(cargarPublicaciones);

const handleLogout = () => {
    sessionStorage.removeItem('migo_user');
    router.push('/');
};
</script>

<style scoped src="../ScreenDashboard/ScreenDashboard.css"></style>