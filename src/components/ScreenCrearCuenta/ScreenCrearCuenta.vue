<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="register-header">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo" class="register-logo">
        <h2>Crear Cuenta</h2>
        <p>¡Regístrate aquí!</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form" novalidate>
        <div class="form-grid">
          <div class="input-group">
            <label for="nombre">Nombres</label>
            <input v-model="form.nombre" type="text" id="nombre" placeholder="Ingrese sus nombres" required>
          </div>

          <div class="input-group">
            <label for="apellido">Apellidos</label>
            <input v-model="form.apellido" type="text" id="apellido" placeholder="Ingrese sus apellidos" required>
          </div>

          <div class="input-group">
            <label for="telefono">Teléfono</label>
            <input v-model="form.telefono" type="tel" id="telefono" placeholder="Ingrese su número de teléfono">
          </div>

          <div class="input-group full-width">
            <label for="direccion">Dirección</label>
            <input v-model="form.direccion" type="text" id="direccion" placeholder="Ingrese su dirección">
          </div>

          <div class="input-group full-width">
            <label for="colonia">Colonia</label>
            <select v-model="form.id_colonia" id="colonia" required>
              <option value="" disabled selected>Selecciona una colonia</option>
              <option v-for="c in colonias" :key="c.id_colonia" :value="c.id_colonia">
                {{ c.nombre_colonia }}
              </option>
            </select>
          </div>

          <div class="input-group full-width">
            <label for="correo">Correo Electrónico</label>
            <input v-model="form.correo" type="email" id="correo" required placeholder="Ingrese su correo electrónico">
          </div>

          <div class="input-group full-width">
            <label for="contrasena">Contraseña</label>
            <input v-model="form.contrasena" type="password" id="contrasena" minlength="8" required placeholder="Ingrese su contraseña">
          </div>
        </div>
        
        <button type="submit" class="btn-register">Registrarse</button>
      </form>

      <div v-if="message" class="form-message" :class="messageType">{{ message }}</div>

      <div class="register-footer">
        <p>¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
        <router-link to="/" class="btn-back">Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 
import { registrarUsuario, obtenerColonias } from './CrearCuenta'; 

const router = useRouter(); 
const form = reactive({
  nombre: '', apellido: '', telefono: '', direccion: '', correo: '', contrasena: '', id_colonia: ''
});

const colonias = ref([]);
const message = ref('');
const messageType = ref('');

onMounted(async () => {
  try {
    colonias.value = await obtenerColonias();
  } catch (e) {
    console.error("Error al cargar colonias", e);
  }
});

const handleRegister = async () => {
  try {
    if (!form.id_colonia) {
      throw new Error("Por favor, selecciona una colonia.");
    }
    
    await registrarUsuario(form);
    
    message.value = "¡Registro exitoso! Redirigiendo al inicio de sesión...";
    messageType.value = "success";

    setTimeout(() => {
      router.push('/login'); 
    }, 2000);

  } catch (err) {
    message.value = err.message;
    messageType.value = "error";
  }
};
</script>

<style scoped src="./ScreenCrearCuenta.css"></style>