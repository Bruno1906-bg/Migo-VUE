<template>
  <AppShell active-menu="ajustes" :show-desktop-top-bar="false" :logout-to="'/'" :main-class="'ajustes-main'" @logout="handleLogout">
    <main class="feed-section">
      <h2 class="feed-title">Bienvenido a la ventana de ajustes..⚙️🛠️</h2>
    </main>
  </AppShell>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import AppShell from '../AppShell/AppShell.vue';

const veterinarias = ref([]);
const router = useRouter();

const handleLogout = () => {
    sessionStorage.removeItem('migo_user');
    router.push('/');
};
</script>
<style scoped src="./ScreenAjustes.css">
</style>