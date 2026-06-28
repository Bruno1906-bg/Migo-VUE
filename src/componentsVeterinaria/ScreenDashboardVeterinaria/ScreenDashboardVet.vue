<template>
  <div class="dashboard-vet-layout">
    <div class="sidebar-overlay" :class="{ active: menuAbierto }" @click="menuAbierto = false"></div>

    <aside class="sidebar" :class="{ open: menuAbierto }">
      <button class="close-sidebar" @click="menuAbierto = false">✕</button>
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboardvet" class="menu-item">° Mi Negocio</router-link>
        <router-link to="/dashboardvet/resenas" class="menu-item">° Reseñas</router-link>
        <router-link to="/dashboardvet/ajustes-vet" class="menu-item">° Ajustes</router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <main class="main-content">
      <button class="btn-hamburger" @click="menuAbierto = !menuAbierto">
        <span></span><span></span><span></span>
      </button>
      
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const menuAbierto = ref(false);

const handleLogout = () => {
  sessionStorage.clear();
  router.push('/loginvet');
};
</script>

<style scoped src="./ScreenDashboardVet.css"></style>