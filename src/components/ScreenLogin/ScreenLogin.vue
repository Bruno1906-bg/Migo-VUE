<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import { loginUsuario } from './Login';

const router = useRouter(); 
const email = ref('');
const password = ref('');
const message = ref('');
const showPassword = ref(false);

const togglePassword = () => { showPassword.value = !showPassword.value; };

const handleLogin = async () => {
  try {
    message.value = "Conectando...";
    
    // 1. Llamada a tu función de login
    const respuesta = await loginUsuario(email.value, password.value);
    
    // 2. Guardado en sessionStorage para persistencia de sesión
    // Guardamos el objeto completo (si lo usas en otras partes)
    sessionStorage.setItem('migo_user', JSON.stringify(respuesta));
    
    // 3. Guardado específico del ID (ESTA LÍNEA ES LA QUE CORRIGE EL ERROR DE PUBLICACIÓN)
    // Asegúrate de que 'respuesta.id_usuario' coincida con el nombre que devuelve tu API
    sessionStorage.setItem('id_usuario', respuesta.id_usuario);
    
    // 4. Redirección
    router.push('/dashboard'); 
  } catch (error) {
    message.value = error.message || "Error al iniciar sesión";
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo" class="login-logo">
        <h2>¡Bienvenido de nuevo!</h2>
        <p>Ingresa tus datos para acceder a tu cuenta</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form" novalidate>
        <div class="input-group">
          <label for="email">Correo Electrónico</label>
          <input v-model="email" type="email" id="email" placeholder="Ingrese su correo electrónico." required>
        </div>

        <div class="input-group">
          <label for="password">Contraseña</label>
          <div class="password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" placeholder="Ingresa tu contraseña." minlength="8" required>
            <button type="button" class="password-toggle" @click="togglePassword" :aria-pressed="showPassword"></button>
          </div>
        </div>

        <button type="submit" class="btn-login">Iniciar Sesión</button>
      </form>

      <div v-if="message" class="form-message" role="alert">{{ message }}</div>

      <div class="login-footer">
        <p>¿No tienes una cuenta? <router-link to="/crearcuenta">Regístrate aquí</router-link></p>
        <router-link to="/" class="btn-back">Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped src="./ScreenLogin.css"></style>