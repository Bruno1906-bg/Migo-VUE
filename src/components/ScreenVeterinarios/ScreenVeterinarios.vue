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
            placeholder="Busca tu veterinaria ideal aquí..."
            class="search-input"
          >
        </div>
      </header>

      <main class="feed-section">
        <h2 class="feed-title">Encuentra tu veterinaria ideal aquí 🐶😽</h2>

        <p>Veterinarias encontradas: {{ filteredVeterinarios.length }}</p>

        <div class="grid-veterinarios">
          <div v-for="vet in filteredVeterinarios" :key="vet.id" class="vet-card">
            <img :src="getImageUrl(vet.imagen)" :alt="vet.nombre" class="vet-image">
            <div class="vet-info">
              <h3>{{ vet.nombre }}</h3>
              <p>{{ vet.descripcion }}</p>
              <p><strong>Colonia:</strong> {{ vet.nombre_colonia }}</p>
            </div>
          </div>
        </div>

        <p v-if="filteredVeterinarios.length === 0" class="sin-resultados">
          No se encontraron veterinarios..💩💩
        </p>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');

// 🔹 Datos estáticos de ejemplo
const veterinarios = ref([
  {
    id: 1,
    nombre: "Veterinaria Patitas Felices",
    descripcion: "Atención general para perros y gatos, vacunas y consultas.",
    nombre_colonia: "Centro",
    imagen: "local1.jpg"
  }
]);

const filteredVeterinarios = computed(() => {
  if (!searchQuery.value) return veterinarios.value;
  return veterinarios.value.filter(vet =>
    (vet.nombre + ' ' + vet.descripcion + ' ' + vet.nombre_colonia)
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  );
});

const getImageUrl = (nombreImagen) => {
  if (!nombreImagen) return '';
  try {
    return new URL(`../../assets/imgvet/${nombreImagen}`, import.meta.url).href;
  } catch (error) {
    console.error('Imagen no encontrada:', nombreImagen);
    return '';
  }
};

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  router.push('/');
};
</script>

<style scoped src="./ScreenVeterinarios.css"></style>
