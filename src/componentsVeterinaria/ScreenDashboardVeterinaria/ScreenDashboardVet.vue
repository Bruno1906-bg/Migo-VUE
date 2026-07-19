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
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppShell from '../../components/AppShell/AppShell.vue';

const route = useRoute();
const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';
const verificationState = ref('sin_solicitud');
const idVet = sessionStorage.getItem('id_vet');

const normalizarEstadoVerificacion = (estado) => {
  const estadosValidos = ['sin_solicitud', 'pendiente', 'aprobada', 'rechazada'];
  return estadosValidos.includes(estado) ? estado : 'sin_solicitud';
};

const cargarEstadoVerificacion = async () => {
  if (!idVet) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/veterinaria/${idVet}`);
    if (!response.ok) return;

    const data = await response.json();
    verificationState.value = normalizarEstadoVerificacion(data.estado_verificacion);

    const sessionUser = JSON.parse(sessionStorage.getItem('migo_user') || 'null');
    if (sessionUser) {
      sessionUser.estado_verificacion = verificationState.value;
      sessionUser.documento_verificacion_nombre = data.documento_verificacion_nombre || null;
      sessionStorage.setItem('migo_user', JSON.stringify(sessionUser));
    }
  } catch (error) {
    verificationState.value = 'sin_solicitud';
  }
};

const vetMenuItems = computed(() => ([
  { key: 'minegocio', to: '/dashboardvet', label: '° Mi Negocio' },
  { key: 'resenas', to: '/dashboardvet/resenas', label: '° Reseñas' },
  { key: 'ajustes', to: '/dashboardvet/ajustes-vet', label: '° Ajustes' },
  {
    key: 'verificacion',
    to: '/dashboardvet/verificacion',
    label: 'Verifica tu veterinaria',
    icon: 'check',
    variant: 'verification',
    verificationState: verificationState.value
  }
]));

const activeMenu = computed(() => {
  if (route.path.includes('/resenas')) return 'resenas';
  if (route.path.includes('/ajustes-vet')) return 'ajustes';
  if (route.path.includes('/verificacion')) return 'verificacion';
  return 'minegocio';
});

const handleLogout = () => {
  sessionStorage.clear();
};

onMounted(() => {
  cargarEstadoVerificacion();
});
</script>

<style scoped src="./ScreenDashboardVet.css"></style>