<template>
  <div class="dashboard-vet-layout">
    <!-- Sidebar con opciones de Veterinario -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboardvet" class="menu-item active">° Mi Negocio</router-link>
        <router-link to="/dashboardvet/resenas" class="menu-item">° Reseñas</router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>
 
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  sessionStorage.clear();
  router.push('/loginvet');
};
</script>

<style scoped src="./ScreenDashboardVet.css"></style>
