<template>
  <div class="mi-negocio-container">
    <h2>Mi Negocio</h2>

    <form @submit.prevent="guardarNegocio" class="negocio-form">
      <div class="form-field">
        <label>Nombre del establecimiento:</label>
        <input v-model="negocio.nombre_establecimiento" type="text" required />
      </div>

      <div class="form-field">
        <label>Descripción:</label>
        <textarea v-model="negocio.descripcion" required></textarea>
      </div>

      <div class="form-field">
        <label>Colonia:</label>
        <select v-model="negocio.id_colonia" required>
          <option v-for="col in colonias" :key="col.id_colonia" :value="col.id_colonia">
            {{ col.nombre }}
          </option>
        </select>
      </div>

      <div class="form-field">
        <label>Correo de contacto:</label>
        <input v-model="negocio.correo_negocio" type="email" required />
      </div>

      <div class="form-field">
        <label>Teléfono:</label>
        <input v-model="negocio.telefono_local" type="text" required />
      </div>

      <div class="form-field">
        <label>Foto de Negocio:</label>
        <input type="file" @change="subirLogo" />
        <img v-if="negocio.imagen_logo" :src="getImageUrl(negocio.imagen_logo)" class="preview-logo" />
      </div>

      <button type="submit" class="btn-save">Guardar cambios</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const negocio = ref({
  nombre_establecimiento: '',
  descripcion: '',
  id_colonia: null,
  correo_negocio: '',
  telefono_local: '',
  imagen_logo: ''
});

const colonias = ref([]);
const idVet = sessionStorage.getItem('id_vet'); // guardado al hacer login

const cargarNegocio = async () => {
  try {
    //  Usa el endpoint correcto (singular)
    const res = await fetch(`http://localhost:4000/api/veterinaria/${idVet}`);
    if (res.ok) negocio.value = await res.json();

    const resColonias = await fetch("http://localhost:4000/api/colonias");
    colonias.value = await resColonias.json();
  } catch (err) {
    console.error("Error cargando negocio:", err);
  }
};

const guardarNegocio = async () => {
  try {
    await fetch(`http://localhost:4000/api/veterinarias/${idVet}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(negocio.value)
    });
    alert("Negocio actualizado correctamente");
  } catch (err) {
    console.error("Error al guardar negocio:", err);
  }
};

const subirLogo = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('logo', file);

  try {
    const res = await fetch(`http://localhost:4000/api/veterinarias/${idVet}/logo`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    negocio.value.imagen_logo = data.imagen_logo; // ruta devuelta por el backend (/uploads/archivo.jpg)
  } catch (err) {
    console.error("Error al subir logo:", err);
  }
};

const getImageUrl = (ruta) => {
  if (!ruta) return '';
  return `http://localhost:4000${ruta}`; 
};



onMounted(cargarNegocio);
</script>


<style scoped src="./ScreenMiNegocio.css"></style>
