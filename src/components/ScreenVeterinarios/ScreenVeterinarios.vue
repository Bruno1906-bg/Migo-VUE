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
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <div class="main-content">
      <header class="top-bar">
        <div class="search-container">
          <input type="text" v-model="searchQuery" placeholder="Busca tu veterinaria ideal aquí..."
            class="search-input">
        </div>
      </header>

      <main class="feed-section">
        <h2 class="feed-title">Encuentra tu veterinaria ideal aquí 🐶😽</h2>

        <p>Veterinarias encontradas: {{ filteredVeterinarios.length }}</p>

        <div class="grid-veterinarios">
          <div v-for="vet in filteredVeterinarios" :key="vet.id_vet" class="vet-card">
            <img :src="getImageUrl(vet.imagen_logo)" :alt="vet.nombre_establecimiento" class="vet-image">
            <div class="vet-info">
              <h3>{{ vet.nombre_establecimiento }}</h3>
              <p>{{ vet.descripcion }}</p>
              <p><strong>Ubicación:</strong> {{ vet.nombre_colonia }}</p>

              <!-- Mostrar horario del día actual -->
              <p>
                <strong>Horario hoy:</strong>
                {{ obtenerHorarioHoy(vet.horarios) }}
              </p>

              <!-- Mostrar servicios -->
              <p><strong>Servicios:</strong> {{ obtenerServicios(vet.servicios) }}</p>

              <button class="btn-cita" @click="irCita(vet.id_vet)">Ver detalles</button>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');
const veterinarios = ref([]);

// Día actual
const diaActual = new Date().getDay();

const cargarVeterinarios = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/veterinarias/detallado');
    if (!res.ok) throw new Error('Error al cargar veterinarias');
    veterinarios.value = await res.json();
  } catch (err) {
    console.error("Error al obtener veterinarios:", err);
  }
};

onMounted(cargarVeterinarios);

const filteredVeterinarios = computed(() => {
  if (!searchQuery.value) return veterinarios.value;
  return veterinarios.value.filter(vet => {
    const busqueda = (
        vet.nombre_establecimiento + ' ' + 
        vet.descripcion + ' ' + 
        (vet.nombre_colonia || '') + ' ' + 
        (vet.correo_negocio || '') + ' ' + 
        (vet.telefono_local || '')
    ).toLowerCase();
    
    return busqueda.includes(searchQuery.value.toLowerCase());
  });
});

// Función para mostrar horario del día actual
const obtenerHorarioHoy = (horarios) => {
  if (!horarios || !horarios[diaActual]) return "No disponible";

  const hoy = horarios[diaActual];
  if (hoy.cerrado) return "Cerrado";

  return `${hoy.hora_apertura} - ${hoy.hora_cierre}`;
};

// Función para mostrar servicios
const obtenerServicios = (servicios) => {
  if (!servicios || servicios.length === 0) return "No registrados";
  return servicios.map(s => s.nombre).join(", ");
};

// Imagen del negocio
const getImageUrl = (ruta) => {
  if (!ruta) return '';
  return `http://localhost:4000${ruta}`;
};


const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  router.push('/');
};

const irCita = (idVet) => {
  router.push({path:'/masinfo', query: { id_vet: idVet }});
}
</script>

<style scoped src="./ScreenVeterinarios.css"></style>
