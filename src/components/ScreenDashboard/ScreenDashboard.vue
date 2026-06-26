<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item active">° Publicaciones</router-link>
        <router-link to="/perfil" class="menu-item">° Mi Perfil</router-link>
        <router-link to="/veterinarios" class="menu-item">° Veterinarios</router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <div class="main-content">
      <header class="top-bar">
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Busca una publicación aquí..."
            class="search-input"
          >
        </div>
        <router-link to="/crearpublicacion">
          <button class="btn-create">Nueva Publicación</button>
        </router-link>
      </header>

      <main class="feed-section">
        <h2 class="feed-title">Reportes Recientes en la Comunidad</h2>

        <div class="filters-bar">
          <select v-model="selectedEstado" class="filter-select">
            <option value="">Todos los estados</option>
            <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
          </select>

          <select v-model="selectedEspecie" class="filter-select">
            <option value="">Todas las especies</option>
            <option v-for="especie in especies" :key="especie" :value="especie">{{ especie }}</option>
          </select>

          <select v-model="selectedTipo" class="filter-select">
            <option value="">Todos los tipos</option>
            <option v-for="tipo in tipos" :key="tipo" :value="tipo">{{ tipo }}</option>
          </select>
        </div>
        
        <div class="grid-publicaciones">
          <div 
            v-for="pub in filteredPublicaciones" 
            :key="pub.id_publi" 
            class="pub-card"
          >
            <img 
              v-if="pub.ruta_imagen" 
              :src="pub.ruta_imagen" 
              :alt="pub.nombre_pet" 
              class="pub-image"
              @click="abrirImagen(pub.ruta_imagen)"
            >
            
            <div class="pub-info">
              <h3>{{ pub.nombre_pet }}</h3>
              <p>{{ pub.descripcion }}</p>
              <button class="btn-ver-mas" @click="irDetallesPubli(pub.id_publi)">Ver Detalles</button>
            </div>
          </div>
        </div>

        <p v-if="filteredPublicaciones.length === 0" class="sin-resultados">
          No hay publicaciones aún...
        </p>
      </main>
    </div>

    <div v-if="imagenAmpliada" class="modal-overlay" @click="cerrarImagen">
      <div class="modal-content">
        <img :src="imagenAmpliada" alt="Imagen ampliada">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';
const router = useRouter();

const publicaciones = ref([]);
const searchQuery = ref('');
const imagenAmpliada = ref(null);

const abrirImagen = (src) => {
  imagenAmpliada.value = src;
};

const cerrarImagen = () => {
  imagenAmpliada.value = null;
};

const irDetallesPubli = (idPubli) => {
  router.push({
    path: '/masinfopubli',
    query: { id_publi: idPubli }
  });
};

const selectedEstado = ref('');
const selectedEspecie = ref('');
const selectedTipo = ref('');
const estados = ref([]);
const especies = ref([]);
const tipos = ref([]);

const cargarPublicaciones = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/publicaciones`);
    if (!res.ok) throw new Error('Error al cargar publicaciones');
    publicaciones.value = await res.json();

    estados.value = [...new Set(publicaciones.value.map(p => p.estado).filter(Boolean))];
    especies.value = [...new Set(publicaciones.value.map(p => p.especie).filter(Boolean))];
    tipos.value = [...new Set(publicaciones.value.map(p => p.tipo).filter(Boolean))];
  } catch (err) {
    console.error("Error:", err);
  }
};

onMounted(cargarPublicaciones);

const filteredPublicaciones = computed(() => {
  return publicaciones.value.filter(pub => {
    const matchesSearch = !searchQuery.value || 
      (pub.nombre_pet + ' ' + pub.descripcion + ' ' + pub.nombre_colonia)
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());

    const matchesEstado = !selectedEstado.value || pub.estado === selectedEstado.value;
    const matchesEspecie = !selectedEspecie.value || pub.especie === selectedEspecie.value;
    const matchesTipo = !selectedTipo.value || pub.tipo === selectedTipo.value;

    return matchesSearch && matchesEstado && matchesEspecie && matchesTipo;
  });
});

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  sessionStorage.removeItem('id_usuario');
  router.push('/');
};
</script>

<style scoped src="../ScreenDashboard/ScreenDashboard.css"></style>