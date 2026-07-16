<template>
  <AppShell
    :active-menu="activeMenu"
    :menu-items="vetMenuItems"
    :show-desktop-top-bar="false"
    :hide-top-bar-on-scroll="true"
    :logout-to="'/loginvet'"
    :main-class="'dashboard-vet-main'"
    @logout="handleLogout"
  >
    <router-view />
  </AppShell>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppShell from '../../components/AppShell/AppShell.vue';

const route = useRoute();

const vetMenuItems = [
  { key: 'minegocio', to: '/dashboardvet', label: '° Mi Negocio' },
  { key: 'resenas', to: '/dashboardvet/resenas', label: '° Reseñas' },
  { key: 'ajustes', to: '/dashboardvet/ajustes-vet', label: '° Ajustes' }
];

const activeMenu = computed(() => {
  if (route.path.includes('/resenas')) return 'resenas';
  if (route.path.includes('/ajustes-vet')) return 'ajustes';
  return 'minegocio';
});

const handleLogout = () => {
  sessionStorage.clear();
};
</script>

<style scoped src="./ScreenDashboardVet.css"></style>