<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <header>
        <h2>Nueva Publicación</h2>
        <router-link to="/dashboard" class="close-btn">✕</router-link>
      </header>

      <form @submit.prevent="handlePublicar">
        <div class="form-grid">
          <div class="col-inputs">
            <div class="field">
              <label>¿Qué sucede?</label>
              <select v-model="form.id_tipo" required>
                <option value="" disabled>Selecciona una opción</option>
                <option v-for="t in tipos" :key="t.id_tipo" :value="t.id_tipo">{{ t.nombre }}</option>
              </select>
            </div>

            <div class="field">
              <label>Nombre de la mascota</label>
              <input v-model="form.nombre_pet" type="text" placeholder="Ej. Firulais" required>
            </div>

            <div class="field">
              <label>Especie</label>
              <select v-model="form.id_especie" required>
                <option value="" disabled>Selecciona una especie</option>
                <option v-for="e in especies" :key="e.id_especie" :value="e.id_especie">{{ e.nombre }}</option>
              </select>
            </div>

            <div class="field autocomplete">
              <label for="colonia">Colonia</label>
              <input
                id="colonia"
                type="text"
                v-model="coloniaInput"
                placeholder="Escribe tu colonia..."
                @input="filtrarColonias"
                required
              />
              <ul v-if="showSuggestions" class="suggestions">
                <li
                  v-for="c in filteredColonias"
                  :key="c.id_colonia"
                  @click="seleccionarColonia(c)"
                >
                  {{ c.nombre }}
                </li>
              </ul>
            </div>

            <div class="field">
              <label>Descripción</label>
              <textarea v-model="form.descripcion" required></textarea>
            </div>
          </div>

          <div class="col-photo">
            <div class="upload-area" @click="$refs.fotoInput.click()">
              <input
                type="file"
                ref="fotoInput"
                @change="handleFileChange"
                hidden
                accept="image/*"
              >
              <div v-if="previewUrl" class="preview-container">
                <img :src="previewUrl" alt="Vista previa" class="preview-image" />
              </div>
              <p v-else>{{ fileName || 'Subir foto' }}</p>
            </div>
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="cargando">
          {{ cargando ? 'Publicando...' : 'Publicar Reporte' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
// URL de producción para Railway
const API_URL = 'https://migobackenddeploy-production.up.railway.app/api';

const fotoInput = ref(null);
const fileName = ref('');
const previewUrl = ref(null);
const colonias = ref([]);
const filteredColonias = ref([]);
const coloniaInput = ref('');
const showSuggestions = ref(false);
const especies = ref([]);
const tipos = ref([]);
const cargando = ref(false);

const form = reactive({
  id_usuario: sessionStorage.getItem('id_usuario') ? parseInt(sessionStorage.getItem('id_usuario')) : null,
  id_tipo: '',
  nombre_pet: '',
  id_especie: '',
  id_colonia: '',
  descripcion: '',
  id_estado: 1,
  foto: null
});

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.foto = file;
    fileName.value = file.name;
    previewUrl.value = URL.createObjectURL(file);
  }
};

onMounted(async () => {
  try {
    const [resC, resE, resT] = await Promise.all([
      fetch(`${API_URL}/colonias`),
      fetch(`${API_URL}/especies`),
      fetch(`${API_URL}/tipos_publi`)
    ]);

    colonias.value = await resC.json();
    especies.value = await resE.json();
    tipos.value = await resT.json();

  } catch (err) {
    console.error("Error al cargar catálogos", err);
  }
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const filtrarColonias = () => {
  const query = coloniaInput.value.toLowerCase();
  filteredColonias.value = colonias.value.filter(c =>
    c.nombre.toLowerCase().includes(query)
  );
  showSuggestions.value = filteredColonias.value.length > 0;
};

const seleccionarColonia = (colonia) => {
  form.id_colonia = colonia.id_colonia;
  coloniaInput.value = colonia.nombre;
  showSuggestions.value = false;
};

const handleClickOutside = (event) => {
  const input = document.getElementById('colonia');
  if (input && !input.contains(event.target)) {
    showSuggestions.value = false;
  }
};

const handlePublicar = async () => {
  if (cargando.value) return; 
  cargando.value = true;

  if (!form.id_usuario) {
    alert("Sesión no detectada.");
    router.push('/login');
    cargando.value = false;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/publicaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: form.id_usuario,
        id_colonia: form.id_colonia,
        id_especie: form.id_especie,
        id_tipo: form.id_tipo,
        id_estado: form.id_estado,
        nombre_pet: form.nombre_pet,
        descripcion: form.descripcion
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear publicación');

    if (form.foto) {
      const formData = new FormData();
      formData.append('foto', form.foto);

      const fotoResponse = await fetch(`${API_URL}/fotos/${data.id_publi}`, {
        method: 'POST',
        body: formData
      });

      if (!fotoResponse.ok) throw new Error('Error al subir foto');
    }

    alert("¡Publicación realizada con éxito!");
    router.push('/dashboard');
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped src="./ScreenCrearPublicacion.css"></style>