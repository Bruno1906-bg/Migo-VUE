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
        <router-link to="/servicios" class="menu-item">° Otros servicios</router-link>
        <router-link to="/ajustes" class="menu-item">° Ajustes</router-link>
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

        <!-- 🔹 Barra de filtros -->
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
            <!-- Imagen con click para ampliar -->
            <img 
              v-if="pub.ruta_imagen" 
              :src="'http://localhost:4000' + pub.ruta_imagen" 
              :alt="pub.nombre_pet" 
              class="pub-image"
              @click="abrirImagen('http://localhost:4000' + pub.ruta_imagen)"
            >
            
            <div class="pub-info">
              <h3>{{ pub.nombre_pet }}</h3>
              <p>{{ pub.descripcion }}</p>
              <p><small>Colonia: {{ pub.nombre_colonia }}</small></p>
              <p><small>Publicado por: {{ pub.usuario }}</small></p>
              <p><small>Especie: {{ pub.especie }}</small></p>
              <p><small>Tipo: {{ pub.tipo }}</small></p>
              <p><small>Estado: {{ pub.estado }}</small></p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 🔹 Modal para ampliar imagen -->
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

const publicaciones = ref([]);
const searchQuery = ref('');
const router = useRouter();

// 🔹 Estado para el modal de imagen
const imagenAmpliada = ref(null);

const abrirImagen = (src) => {
  imagenAmpliada.value = src;
};

const cerrarImagen = () => {
  imagenAmpliada.value = null;
};

// 🔹 Filtros
const selectedEstado = ref('');
const selectedEspecie = ref('');
const selectedTipo = ref('');
const estados = ref([]);
const especies = ref([]);
const tipos = ref([]);

const cargarPublicaciones = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/publicaciones');
    if (!res.ok) throw new Error('Error al cargar publicaciones');
    publicaciones.value = await res.json();

    // Extraer valores únicos para filtros
    estados.value = [...new Set(publicaciones.value.map(p => p.estado))];
    especies.value = [...new Set(publicaciones.value.map(p => p.especie))];
    tipos.value = [...new Set(publicaciones.value.map(p => p.tipo))];
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
  router.push('/');
};
</script>

<style scoped src="../ScreenDashboard/ScreenDashboard.css"></style>
