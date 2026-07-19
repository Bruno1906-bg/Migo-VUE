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
        <router-link to="/dashboardadmin/verificaciones" class="menu-item menu-item--verification" exact>
          <span class="menu-item__label">° Verificaciones</span>
          <span v-if="verificationCount > 0" class="menu-item__badge">{{ verificationCount }}</span>
        </router-link>
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
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const menuAbierto = ref(false);
const verificationCount = ref(0);
const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';

const cargarContadorVerificaciones = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/veterinarias`);
    if (!response.ok) return;

    const veterinarias = await response.json();
    verificationCount.value = veterinarias.filter(v => v.estado_verificacion === 'pendiente').length;
  } catch (error) {
    verificationCount.value = 0;
  }
};

const handleVerificationUpdate = () => {
  cargarContadorVerificaciones();
};

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  sessionStorage.removeItem('id_admin');
  router.push('/');
};

onMounted(() => {
  cargarContadorVerificaciones();
  window.addEventListener('migo-verification-updated', handleVerificationUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener('migo-verification-updated', handleVerificationUpdate);
});
</script>

<style scoped src="./ScreenDashboardAdmin.css"></style>