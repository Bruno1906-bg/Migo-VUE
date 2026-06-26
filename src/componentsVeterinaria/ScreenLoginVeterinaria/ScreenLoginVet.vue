<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import { loginVeterinario } from './LoginVet'; // Importa la función que creamos

const router = useRouter(); 
const email = ref('');
const password = ref('');
const message = ref('');
const showPassword = ref(false);

const togglePassword = () => { showPassword.value = !showPassword.value; };

const handleLoginVet = async () => {
  try {
    message.value = "Validando credenciales...";
    
    // Llamada al backend de veterinarios
    const usuarioVet = await loginVeterinario(email.value, password.value);
    
    // Guardamos la sesión
    sessionStorage.setItem('migo_user', JSON.stringify(usuarioVet));
    sessionStorage.setItem('id_usuario', usuarioVet.id_usuario);
    sessionStorage.setItem('id_vet', usuarioVet.id_vet); 
    
    router.push('/dashboardvet'); 
  } catch (error) {
    message.value = error.message;
  }
};
</script>
 
<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo" class="login-logo">
        <h2>Panel Veterinario</h2>
        <p>Acceso exclusivo para negocios registrados</p>
      </div>

      <form @submit.prevent="handleLoginVet" class="login-form" novalidate>
        <div class="input-group">
          <label for="email">Correo del Negocio</label>
          <input v-model="email" type="email" id="email" placeholder="correo@veterinaria.com" required>
        </div>

        <div class="input-group">
          <label for="password">Contraseña</label>
          <div class="password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" placeholder="Tu contraseña" required>
            <button type="button" class="password-toggle" @click="togglePassword"></button>
          </div>
        </div>

        <button type="submit" class="btn-login">Ingresar al Panel</button>
      </form>

      <div v-if="message" class="form-message" role="alert">{{ message }}</div>

      <div class="login-footer">
        <p>¿No haz registrado tu negocio? <router-link to="/crearcuentavet">Regístralo aqui</router-link></p>
        <router-link to="/" class="btn-back">Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped src="./ScreenLoginVet.css"></style>