<template>
  <div class="dashboard-layout">
    <div class="sidebar-overlay" :class="{ active: menuAbierto }" @click="menuAbierto = false"></div>

    <aside class="sidebar" :class="{ open: menuAbierto }">
      <button class="close-sidebar" @click="menuAbierto = false">✕</button>

      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboardadmin" class="menu-item" exact>° Publicaciones</router-link>
        <router-link to="/dashboardadmin/usuarios" class="menu-item" exact>° Usuarios</router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <button class="btn-hamburger" @click="menuAbierto = !menuAbierto" aria-label="Abrir menú">
          <span></span><span></span><span></span>
        </button>
      </header>
      
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
  sessionStorage.removeItem('migo_user');
  sessionStorage.removeItem('id_admin');
  router.push('/');
};
</script>

<style scoped src="./ScreenDashboardAdmin.css"></style>