<template>
  <div class="feed-section">
    <h2 class="feed-title">Panel de administración</h2>

    <!-- Filtros -->
    <div class="filters-bar">
      <select v-model="selectedEstado" class="filter-select">
        <option value="">Todos los estados</option>
        <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
      </select>
      <select v-model="selectedEspecie" class="filter-select">
        <option value="">Todas las especies</option>
        <option v-for="especie in especies" :key="especie" :value="especie">{{ especie }}</option>
      </select>
      <select v-model="selectedTipo" class="filter-select">
        <option value="">Todos los tipos</option>
        <option v-for="tipo in tipos" :key="tipo" :value="tipo">{{ tipo }}</option>
      </select>
    </div>

    <div v-if="cargando" class="feed-title">Cargando publicaciones...</div>

    <div class="grid-publicaciones">
      <div v-for="pub in filteredPublicaciones" :key="pub.id_publi" class="pub-card">
<img v-if="pub.ruta_imagen" :src="getImageUrl(pub.ruta_imagen)" :alt="pub.nombre_pet"
           class="pub-image" @click="abrirImagen(getImageUrl(pub.ruta_imagen))">

        <div class="pub-info">
          <span class="badge-tipo" :class="pub.tipo === 'En Adopción' ? 'badge-adopcion' : 'badge-busqueda'">
            {{ pub.tipo }}
          </span>
          <h3>{{ pub.nombre_pet }}</h3>
          <p>{{ pub.descripcion }}</p>
          <p class="pub-meta">
            Publicado por: <strong>{{ pub.usuario }}</strong> ({{ pub.correo }})<br>
            Estado: <strong>{{ pub.estado }}</strong>
          </p>

          <div class="pub-actions">
            <button class="btn-eliminar" @click="confirmarEliminar(pub)">
              🗑️ Eliminar publicación
            </button>
            <button class="btn-reportar" @click="abrirModalReporte(pub)">
              ⚠️ Reportar usuario
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!cargando && filteredPublicaciones.length === 0" class="feed-title">
      No se han encontrado publicaciones..💩
    </p>

    <div v-if="imagenAmpliada" class="modal-overlay" @click="cerrarImagen">
      <div class="modal-content-img">
        <img :src="imagenAmpliada" alt="Imagen ampliada">
      </div>
    </div>

    <div v-if="modalReporte" class="modal-overlay" @click.self="cerrarModalReporte">
      <div class="modal-edicion">
        <header class="modal-edicion-header">
          <h2>Reportar Usuario</h2>
          <button class="close-btn" @click="cerrarModalReporte">✕</button>
        </header>
        <div class="modal-edicion-body">
          <p>Vas a reportar a <strong>{{ publicacionSeleccionada?.usuario }}</strong> por la publicación "<strong>{{ publicacionSeleccionada?.nombre_pet }}</strong>".</p>
          <div class="field">
            <label>Motivo del reporte</label>
            <textarea v-model="motivoReporte" placeholder="Describe el motivo del reporte..." required></textarea>
          </div>
        </div>
        <footer class="modal-edicion-footer">
          <button class="btn-cancelar" @click="cerrarModalReporte">Cancelar</button>
          <button class="btn-guardar" :disabled="enviandoReporte" @click="enviarReporte">
            {{ enviandoReporte ? 'Enviando...' : 'Reportar usuario' }}
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { obtenerPublicaciones, eliminarPublicacionAdmin, reportarUsuario } from './Publicacionesadmin';

const idAdminActual = sessionStorage.getItem('id_admin') ? parseInt(sessionStorage.getItem('id_admin')) : null;

const publicaciones = ref([]);
const cargando = ref(true);
const searchQuery = ref(''); // Nota: si ya no usas el buscador aquí porque está en el header, puedes quitarlo
const selectedEstado = ref('');
const selectedEspecie = ref('');
const selectedTipo = ref('');
const estados = ref([]);
const especies = ref([]);
const tipos = ref([]);

const imagenAmpliada = ref(null);
const abrirImagen = (src) => { imagenAmpliada.value = src; };
const cerrarImagen = () => { imagenAmpliada.value = null; };

const getImageUrl = (ruta) => {
  if (!ruta) return '';
  return /^https?:\/\//i.test(ruta) ? ruta : `https://migobackenddeploy-production.up.railway.app${ruta}`;
};

const modalReporte = ref(false);
const enviandoReporte = ref(false);
const motivoReporte = ref('');
const publicacionSeleccionada = ref(null);

const cargarPublicaciones = async () => {
  cargando.value = true;
  try {
    publicaciones.value = await obtenerPublicaciones();
    estados.value = [...new Set(publicaciones.value.map(p => p.estado))];
    especies.value = [...new Set(publicaciones.value.map(p => p.especie))];
    tipos.value = [...new Set(publicaciones.value.map(p => p.tipo))];
  } catch (err) {
    console.error('Error al cargar publicaciones:', err);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarPublicaciones);

const filteredPublicaciones = computed(() => {
  return publicaciones.value.filter(pub => {
    const matchesSearch = !searchQuery.value || (pub.nombre_pet + ' ' + pub.descripcion + ' ' + (pub.usuario || '')).toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesEstado = !selectedEstado.value || pub.estado === selectedEstado.value;
    const matchesEspecie = !selectedEspecie.value || pub.especie === selectedEspecie.value;
    const matchesTipo = !selectedTipo.value || pub.tipo === selectedTipo.value;
    return matchesSearch && matchesEstado && matchesEspecie && matchesTipo;
  });
});

const confirmarEliminar = async (pub) => {
  if (!idAdminActual) return alert('No se detectó sesión de administrador.');
  if (!confirm(`¿Eliminar la publicación "${pub.nombre_pet}"?`)) return;
  try {
    await eliminarPublicacionAdmin(pub.id_publi, idAdminActual);
    alert('Publicación eliminada correctamente');
    await cargarPublicaciones();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
};

const abrirModalReporte = (pub) => {
  publicacionSeleccionada.value = pub;
  motivoReporte.value = '';
  modalReporte.value = true;
};

const cerrarModalReporte = () => {
  modalReporte.value = false;
  publicacionSeleccionada.value = null;
};

const enviarReporte = async () => {
  if (!motivoReporte.value.trim()) return alert('Escribe un motivo');
  enviandoReporte.value = true;
  try {
    await reportarUsuario(publicacionSeleccionada.value.id_usuario, idAdminActual, motivoReporte.value);
    alert('Usuario reportado correctamente');
    cerrarModalReporte();
  } catch (err) {
    alert('Error al reportar: ' + err.message);
  } finally {
    enviandoReporte.value = false;
  }
};
</script>

<style scoped src="./ScreenAdminPublicaciones.css"></style>