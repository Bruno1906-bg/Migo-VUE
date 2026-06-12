<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <header>
        <h2>Nueva Publicación</h2>
        <router-link to="/dashboard" class="close-btn">✕</router-link>
      </header>

      <form @submit.prevent="handlePublicar" novalidate>
        <div class="form-grid">
          <div class="col-inputs">
            <div class="field">
              <label for="tipo">¿Qué sucede?</label>
              <select v-model="form.id_tipo" id="tipo" required>
                <option value="" disabled>Selecciona una opción</option>
                <option v-for="t in tipos" :key="t.id_tipo" :value="t.id_tipo">
                    {{ t.nombre }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="nombre_pet">Nombre de la mascota</label>
              <input v-model="form.nombre_pet" type="text" id="nombre_pet" placeholder="Ej. Firulais" required>
            </div>

            <div class="field">
              <label for="especie">Especie</label>
              <select v-model="form.especie" id="especie" required>
                 <option value="" disabled>Selecciona una especie</option>
                     <option v-for="e in especies" :key="e.id_especie" :value="e.id_especie">
                        {{ e.nombre }}
                   </option>
                </select>
            </div>

            <div class="field">
              <label for="colonia">Colonia</label>
              <select v-model="form.id_colonia" id="colonia" required>
                <option value="" disabled>Selecciona una colonia</option>
                <option v-for="c in colonias" :key="c.id_colonia" :value="c.id_colonia">
                  {{ c.nombre_colonia }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="descripcion">Descripción</label>
              <textarea v-model="form.descripcion" id="descripcion" placeholder="Detalles importantes..." required></textarea>
            </div>
          </div>

          <div class="col-photo">
            <div class="upload-area" @click="$refs.fotoInput.click()">
              <input type="file" ref="fotoInput" @change="handleFileChange" hidden accept="image/*">
              <div class="upload-content">
                <span>＋</span>
                <p>{{ fileName || 'Subir foto' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <button type="submit" class="btn-primary">Publicar Reporte</button>
        <div v-if="message" class="form-message">{{ message }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { registrarPublicacion } from './CrearPublicacion';

const colonias = ref([]);
const especies = ref([]);
const tipos = ref([]);
const form = reactive({
    id_usuario: sessionStorage.getItem('id_usuario'), // Asegúrate de tener esto del login
    id_tipo: '',
    nombre_pet: '',
    especie: '',
    id_colonia: '',
    descripcion: '',
    foto: null
});

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
        console.error("Error al cargar catálogos:", err);
    }
});

const handlePublicar = async () => {
    try {
        const formData = new FormData();
        // Asegúrate de que estos nombres coincidan con el req.body del server.js
        formData.append('id_usuario', form.id_usuario);
        formData.append('id_colonia', form.id_colonia);
        formData.append('id_especie', form.especie); // <--- CAMBIO AQUÍ
        formData.append('id_tipo', form.id_tipo);
        formData.append('nombre_pet', form.nombre_pet);
        formData.append('descripcion', form.descripcion);
        if (form.foto) formData.append('foto', form.foto);
        
        const response = await fetch('http://localhost:4000/api/publicaciones', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error("Error al guardar en base de datos");
        alert("Publicado correctamente");
    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
};
</script>

<style scoped src="../ScreenCrearPublicacion/ScreenCrearPublicacion.css"></style>