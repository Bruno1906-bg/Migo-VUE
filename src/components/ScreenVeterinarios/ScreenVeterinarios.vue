<template>
  <div class="veterinarios-container">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item">° Publicaciones</router-link>
        <router-link to="/perfil" class="menu-item">° Mi Perfil</router-link>
        <router-link to="/veterinarios" class="menu-item active">° Veterinarios</router-link>
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
            placeholder="Busca tu veterinaria ideal aqui..."
            class="search-input"
          >
        </div>
      </header>

      <main class="feed-section">
        <h2 class="feed-title">Encuentra tu veterinaria ideal aqui..🐶😽</h2>

        <p>Veterinarias encontradas: {{ veterinarios.length }}</p>

        <div class="grid-veterinarios">
          <div v-for="vet in veterinarios" :key="vet.id" class="vet-card">
            <img :src="getImageUrl(vet.imagen)" :alt="vet.nombre" class="vet-image">
            <div class="vet-info">
              <h3>{{ vet.nombre }}</h3>
              <p>{{ vet.descripcion }}</p>
              <p><strong>Colonia:</strong> {{ vet.nombre_colonia }}</p>
            </div>
          </div>
        </div>

        <p v-if="veterinarios.length === 0" class="sin-resultados">
          No se encontraron veterinarios..💩💩
        </p>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const veterinarios = ref([]);
const searchQuery = ref('');
const router = useRouter();

const cargarVeterinarios = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/veterinarios/veterinarios');
    console.log('Status de la API:', res.status);

    if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

    const data = await res.json();
    console.log('Datos recibidos:', data);
    veterinarios.value = data;

  } catch (err) {
    console.error('Error al cargar veterinarios:', err.message);
  }
};

const getImageUrl = (nombreImagen) => {
  if (!nombreImagen) return '';
  try {
    return new URL(`../../assets/imgvet/${nombreImagen}`, import.meta.url).href;
  } catch (error) {
    console.error('Imagen no encontrada:', nombreImagen);
    return '';
  }
};

onMounted(cargarVeterinarios);

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  router.push('/');
};
</script>

<style scoped src="./ScreenVeterinarios.css"></style>