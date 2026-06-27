<template>
  <div class="mi-negocio-container">
    <h2>Mi Negocio</h2>
    <div class="negocio-layout">
      <!-- Formulario principal -->
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
          <label>Teléfono de contacto:</label>
          <input v-model="negocio.telefono_local" type="text" required />
        </div>

        <div class="form-field">
          <label>Página Web:</label>
          <input v-model="negocio.sitio_web" type="url" placeholder="https://ejemplo.com" />
        </div>

        <div class="form-field">
          <label>Foto de Negocio:</label>
          <input type="file" @change="subirLogo" />
          <img v-if="negocio.imagen_logo" :src="getImageUrl(negocio.imagen_logo)" class="preview-logo" />
        </div>

        <button type="submit" class="btn-save">Guardar cambios</button>
      </form>

      <!-- Card de horarios -->
      <div class="horarios-card">
        <h3>Horarios de Atención</h3>
        <form @submit.prevent="guardarHorarios">
          <div v-for="dia in diasSemana" :key="dia.id_dia" class="horario-row">
            <label>{{ dia.nombre }}</label>
            <input type="time" v-model="horarios[dia.id_dia].hora_apertura" />
            <input type="time" v-model="horarios[dia.id_dia].hora_cierre" />
            <label>
              <input type="checkbox" v-model="horarios[dia.id_dia].cerrado" />
              Cerrado
            </label>
          </div>
          <button type="submit" class="btn-save">Guardar Horarios</button>
        </form>
      </div>
    </div>
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
  sitio_web: '',
  imagen_logo: ''
});

const colonias = ref([]);
const diasSemana = ref([]); 
const idVet = sessionStorage.getItem('id_vet');

const horarios = ref({});

const cargarNegocio = async () => {
  try {
    const res = await fetch(`http://localhost:4000/api/veterinaria/${idVet}`);
    if (res.ok) negocio.value = await res.json();

    const resColonias = await fetch("http://localhost:4000/api/colonias");
    colonias.value = await resColonias.json();

    // Cargar días de la semana desde la BD
    const resDias = await fetch("http://localhost:4000/api/dias-semana");
    if (resDias.ok) {
      diasSemana.value = await resDias.json();
      diasSemana.value.forEach(d => {
        horarios.value[d.id_dia] = {
          hora_apertura: '',
          hora_cierre: '',
          cerrado: false
        };
      });
    }

    // Cargar horarios existentes
    const resHorarios = await fetch(`http://localhost:4000/api/horarios/${idVet}`);
    if (resHorarios.ok) {
      const data = await resHorarios.json();
      data.forEach(h => {
        horarios.value[h.id_dia] = {
          hora_apertura: h.hora_apertura || '',
          hora_cierre: h.hora_cierre || '',
          cerrado: h.cerrado === 1
        };
      });
    }
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

const guardarHorarios = async () => {
  try {
    await fetch(`http://localhost:4000/api/horarios/${idVet}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(horarios.value)
    });
    alert("Horarios actualizados correctamente");
  } catch (err) {
    console.error("Error al guardar horarios:", err);
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
    negocio.value.imagen_logo = data.imagen_logo;
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
