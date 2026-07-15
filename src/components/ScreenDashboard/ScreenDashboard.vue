<template>
  <AppShell active-menu="dashboard" :hide-top-bar-on-scroll="true" :logout-to="'/'" :main-class="'dashboard-main'" @logout="handleLogout">
      <template #header>
        <div class="search-container">
          <input type="text" v-model="searchQuery" placeholder="Busca una publicación aquí..." class="search-input">
        </div>
        <router-link to="/crearpublicacion">
          <button class="btn-create">Nueva Publicación</button>
        </router-link>
      </template>

      <main class="feed-section">
        <h2 class="feed-title">Reportes Recientes en la Comunidad</h2>

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

        <div class="grid-publicaciones">
          <div v-for="pub in filteredPublicaciones" :key="pub.id_publi" class="pub-card">
<img v-if="pub.ruta_imagen" :src="getImageUrl(pub.ruta_imagen)" :alt="pub.nombre_pet"
               class="pub-image" @click="abrirImagen(getImageUrl(pub.ruta_imagen))">

            <div class="pub-info">
              <span class="badge-tipo" :class="pub.tipo === 'Adopción' ? 'badge-adopcion' : 'badge-busqueda'">
                {{ pub.tipo }}
              </span>
              
              <span :class="['badge-estado', 'estado-' + pub.estado.toLowerCase()]">
                {{ pub.estado }}
              </span>

              <h3>{{ pub.nombre_pet }}</h3>
              <p>{{ pub.descripcion }}</p>

              <div class="pub-actions">
                <button class="btn-ver-mas" @click="irDetallesPubli(pub.id_publi)">Ver Detalles</button>
                <button v-if="pub.id_usuario === idUsuarioActual" class="btn-editar" @click="abrirModalEdicion(pub)">
                  Editar
                </button>
                <button v-if="pub.id_usuario === idUsuarioActual" class="btn-eliminar"
                  @click="eliminarPublicacion(pub.id_publi)">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

    <div v-if="imagenAmpliada" class="modal-overlay" @click="cerrarImagen">
      <div class="modal-content-img">
        <img :src="imagenAmpliada" alt="Imagen ampliada">
      </div>
    </div>

    <div v-if="modalEdicion" class="modal-overlay modal-overlay--edit" @click.self="cerrarModalEdicion">
      <div class="modal-edicion">
        <header class="modal-edicion-header">
          <h2>Editar Publicación</h2>
          <button class="close-btn" @click="cerrarModalEdicion">✕</button>
        </header>

        <div class="modal-edicion-body">
          <div class="field">
            <label>¿Qué sucede?</label>
            <select v-model="formEdicion.id_tipo" required>
              <option value="" disabled>Selecciona una opción</option>
              <option v-for="t in tipos_cat" :key="t.id_tipo" :value="t.id_tipo">{{ t.nombre }}</option>
            </select>
          </div>

          <div class="field">
            <label>Nombre de la mascota</label>
            <input v-model="formEdicion.nombre_pet" type="text" placeholder="Ej. Firulais" required>
          </div>

          <div class="field">
            <label>Especie</label>
            <select v-model="formEdicion.id_especie" required>
              <option value="" disabled>Selecciona una especie</option>
              <option v-for="e in especies_cat" :key="e.id_especie" :value="e.id_especie">{{ e.nombre }}</option>
            </select>
          </div>

          <div class="field autocomplete">
            <label for="colonia-edicion">Colonia</label>
            <input id="colonia-edicion" type="text" v-model="coloniaInputEdicion" placeholder="Escribe tu colonia..."
              @input="filtrarColoniasEdicion" />
            <ul v-if="showSuggestionsEdicion" class="suggestions">
              <li v-for="c in filteredColoniasEdicion" :key="c.id_colonia" @click="seleccionarColoniaEdicion(c)">
                {{ c.nombre }}
              </li>
            </ul>
          </div>

          <div class="field">
            <label>Descripción</label>
            <textarea v-model="formEdicion.descripcion" required></textarea>
          </div>
        </div>

        <footer class="modal-edicion-footer">
          <button class="btn-cancelar" @click="cerrarModalEdicion">Cancelar</button>
          <button class="btn-guardar" :disabled="guardando" @click="guardarEdicion">
            {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </footer>
      </div>
    </div>

  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AppShell from '../AppShell/AppShell.vue';

const router = useRouter();

const idUsuarioActual = sessionStorage.getItem('id_usuario')
  ? parseInt(sessionStorage.getItem('id_usuario'))
  : null;

const publicaciones = ref([]);
const searchQuery = ref('');
const selectedEstado = ref('');
const selectedEspecie = ref('');
const selectedTipo = ref('');
const estados = ref([]);
const especies = ref([]);
const tipos = ref([]);

const colonias_cat = ref([]);
const especies_cat = ref([]);
const tipos_cat = ref([]);

const savedBodyOverflow = ref('');

const restoreBodyScroll = () => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = savedBodyOverflow.value;
};

const imagenAmpliada = ref(null);
const abrirImagen = (src) => { imagenAmpliada.value = src; };
const cerrarImagen = () => { imagenAmpliada.value = null; };

const getImageUrl = (ruta) => {
  if (!ruta) return '';
  return /^https?:\/\//i.test(ruta) ? ruta : `https://migobackenddeploy-production.up.railway.app${ruta}`;
};

const modalEdicion = ref(false);
const guardando = ref(false);
const publicacionSeleccionada = ref(null);

const formEdicion = ref({
  id_publi: null,
  id_usuario: null,
  id_tipo: '',
  nombre_pet: '',
  id_especie: '',
  id_colonia: '',
  descripcion: ''
});

const coloniaInputEdicion = ref('');
const filteredColoniasEdicion = ref([]);
const showSuggestionsEdicion = ref(false);

const lockBodyScroll = (isLocked) => {
  if (typeof document === 'undefined') return;

  if (isLocked) {
    savedBodyOverflow.value = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = savedBodyOverflow.value;
  }
};

const filtrarColoniasEdicion = () => {
  const query = coloniaInputEdicion.value.toLowerCase();
  filteredColoniasEdicion.value = colonias_cat.value.filter(c =>
    c.nombre.toLowerCase().includes(query)
  );
  showSuggestionsEdicion.value = filteredColoniasEdicion.value.length > 0;
};

const seleccionarColoniaEdicion = (colonia) => {
  formEdicion.value.id_colonia = colonia.id_colonia;
  coloniaInputEdicion.value = colonia.nombre;
  showSuggestionsEdicion.value = false;
};

const abrirModalEdicion = (pub) => {
  publicacionSeleccionada.value = pub;
  formEdicion.value = {
    id_publi: pub.id_publi,
    id_usuario: pub.id_usuario,
    id_tipo: pub.id_tipo_raw ?? '',
    nombre_pet: pub.nombre_pet,
    id_especie: pub.id_especie_raw ?? '',
    id_colonia: pub.id_colonia_raw ?? '',
    descripcion: pub.descripcion
  };

  coloniaInputEdicion.value = pub.nombre_colonia ?? '';
  showSuggestionsEdicion.value = false;
  modalEdicion.value = true;
  lockBodyScroll(true);
};

const cerrarModalEdicion = () => {
  modalEdicion.value = false;
  guardando.value = false;
  lockBodyScroll(false);
};

const eliminarPublicacion = async (idPubli) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
    return;
  }

  try {
const res = await fetch(`https://migobackenddeploy-production.up.railway.app/api/publicaciones/${idPubli}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: idUsuarioActual })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar');

    alert('Publicación eliminada correctamente');
    await cargarPublicaciones();
  } catch (err) {
    console.error(err);
    alert('Error al intentar eliminar: ' + err.message);
  }
};

const guardarEdicion = async () => {
  if (guardando.value) return;
  guardando.value = true;

  try {
    const res = await fetch(`https://migobackenddeploy-production.up.railway.app/api/publicaciones/${formEdicion.value.id_publi}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: formEdicion.value.id_usuario,
        id_colonia: formEdicion.value.id_colonia,
        id_especie: formEdicion.value.id_especie,
        id_tipo: formEdicion.value.id_tipo,
        nombre_pet: formEdicion.value.nombre_pet,
        descripcion: formEdicion.value.descripcion
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar');

    alert('¡Publicación actualizada!');
    cerrarModalEdicion();
    await cargarPublicaciones();
  } catch (err) {
    console.error(err);
    alert('Error: ' + err.message);
  } finally {
    guardando.value = false;
  }
};

const cargarPublicaciones = async () => {
  try {
    const res = await fetch('https://migobackenddeploy-production.up.railway.app/api/publicaciones');
    if (!res.ok) throw new Error('Error al cargar publicaciones');
    publicaciones.value = await res.json();

    estados.value = [...new Set(publicaciones.value.map(p => p.estado))];
    especies.value = [...new Set(publicaciones.value.map(p => p.especie))];
    tipos.value = [...new Set(publicaciones.value.map(p => p.tipo))];
  } catch (err) {
    console.error('Error:', err);
  }
};

const cargarCatalogos = async () => {
  try {
    const [resC, resE, resT] = await Promise.all([
      fetch('https://migobackenddeploy-production.up.railway.app/api/colonias'),
      fetch('https://migobackenddeploy-production.up.railway.app/api/especies'),
      fetch('https://migobackenddeploy-production.up.railway.app/api/tipos_publi')
    ]);
    colonias_cat.value = await resC.json();
    especies_cat.value = await resE.json();
    tipos_cat.value = await resT.json();
  } catch (err) {
    console.error('Error al cargar catálogos:', err);
  }
};

onMounted(async () => {
  if (typeof document !== 'undefined') {
    savedBodyOverflow.value = document.body.style.overflow;
    document.body.style.overflow = '';
  }

  await Promise.all([cargarPublicaciones(), cargarCatalogos()]);
});

onBeforeUnmount(() => {
  restoreBodyScroll();
});

const filteredPublicaciones = computed(() => {
  return publicaciones.value.filter(pub => {
    const matchesSearch = !searchQuery.value ||
      (pub.nombre_pet + ' ' + pub.descripcion + ' ' + pub.nombre_colonia)
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());
    const matchesEstado = !selectedEstado.value || pub.estado === selectedEstado.value;
    const matchesEspecie = !selectedEspecie.value || pub.especie === selectedEspecie.value;
    const matchesTipo = !selectedTipo.value || pub.tipo === selectedTipo.value;
    return matchesSearch && matchesEstado && matchesEspecie && matchesTipo;
  });
});

const irDetallesPubli = (idPubli) => {
  router.push({ path: '/masinfopubli', query: { id_publi: idPubli } });
};

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  router.push('/');
};

const clasePorTipo = (tipo) => {
  if (!tipo) return 'badge-default';
  const tipoLower = tipo.toLowerCase();


  if (tipoLower.includes('adopci')) {
    return 'badge-adopcion';
  }

  else if (tipoLower.includes('busqueda') || tipoLower.includes('búsqueda') || tipoLower.includes('perdid') || tipoLower.includes('extraviad')) {
    return 'badge-busqueda';
  }

  return 'badge-default';
};
</script>

<style scoped src="../ScreenDashboard/ScreenDashboard.css"></style>