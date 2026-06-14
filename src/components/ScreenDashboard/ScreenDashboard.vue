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
        
        <div class="publications-grid">
          <div v-if="publicaciones.length === 0" class="empty-feed">
            <p>No hay publicaciones que mostrar....💩</p>
          </div>
          
          <div v-for="pub in publicaciones" :key="pub.id_publi" class="pub-card">
            <h3 class="card-title">🐾 {{ pub.nombre_pet }}</h3>
            <p class="card-description">{{ pub.descripcion }}</p>
            
            <div class="pub-meta">
              <span class="badge">Especie ID: {{ pub.id_especie }}</span>
              <span class="badge">Estado: {{ pub.id_estado }}</span>
            </div>
            
            <div class="pub-date">
              Publicado el: {{ new Date(pub.fecha_publi).toLocaleDateString() }}
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

const router = useRouter();
const searchQuery = ref('');
const publicaciones = ref([]);

// Hacemos el fetch directamente aquí para asegurar la ruta
const cargarPublicaciones = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/publicaciones/publicaciones');
    if (!response.ok) throw new Error('Error al conectar con el servidor');
    
    const data = await response.json();
    publicaciones.value = data; 
  } catch (error) {
    console.error("Error al cargar publicaciones:", error);
    alert("No se pudieron cargar las publicaciones.");
  }
};

onMounted(cargarPublicaciones);

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  sessionStorage.removeItem('id_usuario'); // Limpiamos también el ID
  router.push('/');
};
</script>

<style scoped src="../ScreenDashboard/ScreenDashboard.css"></style>