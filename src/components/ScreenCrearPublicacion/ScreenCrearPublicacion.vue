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

            <div class="field">
              <label>Colonia</label>
              <select v-model="form.id_colonia" required>
                <option value="" disabled>Selecciona una colonia</option>
                <option v-for="c in colonias" :key="c.id_colonia" :value="c.id_colonia">{{ c.nombre_colonia }}</option>
              </select>
            </div>

            <div class="field">
              <label>Descripción</label>
              <textarea v-model="form.descripcion" required></textarea>
            </div>
          </div>

          <div class="col-photo">
            <div class="upload-area" @click="$refs.fotoInput.click()">
              <input type="file" ref="fotoInput" @change="handleFileChange" hidden accept="image/*">
              <p>{{ fileName || 'Subir foto' }}</p>
            </div>
          </div>
        </div>
        
        <button type="submit" class="btn-primary">Publicar Reporte</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const fotoInput = ref(null);
const fileName = ref('');
const colonias = ref([]);
const especies = ref([]);
const tipos = ref([]);

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
    }
};

onMounted(async () => {
    try {
        const [resC, resE, resT] = await Promise.all([
            fetch('http://localhost:4000/api/colonias/colonias'),
            fetch('http://localhost:4000/api/especies/especies'),
            fetch('http://localhost:4000/api/tipos_publi/tipos_publi')
        ]);
        colonias.value = await resC.json();
        especies.value = await resE.json();
        tipos.value = await resT.json();
    } catch (err) {
        console.error("Error al cargar catálogos", err);
    }
});

const handlePublicar = async () => {
    // 1. Validar sesión
    if (!form.id_usuario) {
        alert("Sesión no detectada. Por favor, inicia sesión de nuevo.");
        router.push('/login');
        return;
    }

    // 2. Crear FormData
    const formData = new FormData();
    formData.append('id_usuario', form.id_usuario);
    formData.append('id_colonia', form.id_colonia);
    formData.append('id_especie', form.id_especie);
    formData.append('id_tipo', form.id_tipo);
    formData.append('id_estado', form.id_estado);
    formData.append('nombre_pet', form.nombre_pet);
    formData.append('descripcion', form.descripcion);
    if (form.foto) formData.append('foto', form.foto);
    
    // 3. Enviar al servidor
    try {
        const response = await fetch('http://localhost:4000/api/publicaciones/crear', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert("¡Publicación realizada con éxito!");
            router.push('/dashboard');
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        console.error("Error completo:", err);
        alert("Error al conectar con el servidor.");
    }
};
</script>

<style scoped src="./ScreenCrearPublicacion.css"></style>