<template>
  <div class="dashboard-vet-layout">
    <!-- Sidebar con opciones de Veterinario -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboardvet" class="menu-item active">° Mi Negocio</router-link>
        <router-link>° Reseñas</router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <main class="main-content">
      
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nombreVeterinaria = ref('Clínica Veterinaria Migo');
const servicios = ref([]);

onMounted(async () => {
});

const handleLogout = () => {
  sessionStorage.clear();
  router.push('/loginvet');
};
</script>

<style scoped src="./ScreenDashboardVet.css"></style>