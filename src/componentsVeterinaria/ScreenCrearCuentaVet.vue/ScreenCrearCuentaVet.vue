<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="register-header">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo" class="register-logo">
        <h2>Registro de Negocio</h2>
        <p>¡Registra tu Veterinaria en MIGO!</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form" novalidate>
        <div class="form-grid">
          <div class="input-group">
            <label for="nombre">Nombre del Responsable</label>
            <input v-model="form.nombre" type="text" id="nombre" placeholder="Nombre" required>
          </div>
          <div class="input-group">
            <label for="apellido">Apellidos</label>
            <input v-model="form.apellido" type="text" id="apellido" placeholder="Apellidos" required>
          </div>

          <div class="input-group full-width">
            <label for="est">Nombre de la Veterinaria</label>
            <input v-model="form.nombre_establecimiento" type="text" id="est" placeholder="Ej. Vet Salud Animal" required>
          </div>

          <div class="input-group full-width">
            <label for="direccion">Dirección</label>
            <input v-model="form.direccion" type="text" id="direccion" placeholder="Calle y número">
          </div>

          <div class="input-group full-width autocomplete">
            <label for="colonia">Colonia</label>
            <input id="colonia" type="text" v-model="coloniaInput" placeholder="Escribe tu colonia..." @input="filtrarColonias" required />
            <ul v-if="filteredColonias.length" class="suggestions">
              <li v-for="c in filteredColonias" :key="c.id_colonia" @click="seleccionarColonia(c)">
                {{ c.nombre }}
              </li>
            </ul>
          </div>

          <div class="input-group">
            <label for="correo">Correo Electrónico</label>
            <input v-model="form.correo" type="email" id="correo" required>
          </div>
          <div class="input-group">
            <label for="contrasena">Contraseña</label>
            <input v-model="form.contrasena" type="password" id="contrasena" minlength="8" required>
          </div>
        </div>

        <button type="submit" class="btn-register">Registrar Negocio</button>
      </form>

      <div v-if="message" class="form-message" :class="messageType">{{ message }}</div>

      <div class="register-footer">
        <p>¿Ya tienes cuenta? <router-link to="/loginvet">Inicia sesión aquí</router-link></p>
        <router-link to="/" class="btn-back">Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = reactive({
  nombre: '', apellido: '', correo: '', contrasena: '', 
  telefono: '', direccion: '', id_colonia: '', nombre_establecimiento: ''
});

const colonias = ref([]);
const filteredColonias = ref([]);
const coloniaInput = ref('');
const message = ref('');
const messageType = ref('');

onMounted(async () => {
  const res = await fetch('http://localhost:4000/api/colonias');
  colonias.value = await res.json();
});

const filtrarColonias = () => {
  const query = coloniaInput.value.toLowerCase();
  filteredColonias.value = colonias.value.filter(c => c.nombre.toLowerCase().includes(query));
};

const seleccionarColonia = (colonia) => {
  form.id_colonia = colonia.id_colonia;
  coloniaInput.value = colonia.nombre;
  filteredColonias.value = [];
};

const handleRegister = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/registro-vet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (!response.ok) throw new Error("Error al registrar el negocio");

    message.value = "¡Registro exitoso! Ahora inicia sesión.";
    messageType.value = "success";
    setTimeout(() => router.push('/loginvet'), 2000);
  } catch (err) {
    message.value = err.message;
    messageType.value = "error";
  }
};
</script>

<style scoped src="./ScreenCrearCuentaVet.css"></style>