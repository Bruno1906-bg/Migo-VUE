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

    const respuesta = await loginUsuario(email.value, password.value);
    sessionStorage.setItem('migo_user', JSON.stringify(respuesta));

    if (respuesta.rol === 'administrador') {
      sessionStorage.setItem('id_admin', respuesta.id_usuario);
      router.push('/dashboardadmin'); 
    } else {
      sessionStorage.setItem('id_usuario', respuesta.id_usuario);
      router.push('/dashboard');
    }
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
          <input v-model="email" type="email" id="email" name="username" placeholder="Ingrese su correo electrónico." autocomplete="username" required>
        </div>

        <div class="input-group">
          <label for="password">Contraseña</label>
          <div class="password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" placeholder="Ingresa tu contraseña (mínimo 8 caracteres)" minlength="8" required autocomplete="current-password">
            <button type="button" class="password-toggle" @click="togglePassword" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="showPassword" :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <svg v-if="showPassword" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 5c5.5 0 9.7 3.2 11.5 7-.6 1.3-1.4 2.4-2.3 3.4l-2-2C20.2 11.7 18 10.2 12 10.2c-.8 0-1.5.1-2.2.2l-1.8-1.8C9.3 8.3 10.6 8 12 8a4 4 0 0 1 4 4c0 .5-.1 1-.3 1.4l-2.2-2.2a1.8 1.8 0 0 0-2.3-2.3L7.1 6.8A10.7 10.7 0 0 1 12 5Zm0 14c-5.5 0-9.7-3.2-11.5-7 .7-1.4 1.6-2.7 2.8-3.8l-2.1-2.1a1 1 0 0 1 1.4-1.4l18 18a1 1 0 1 1-1.4 1.4l-2.3-2.3A10.7 10.7 0 0 1 12 19Zm-3.9-7c0 2.2 1.8 3.9 3.9 3.9.4 0 .8-.1 1.2-.2l-5-5A4 4 0 0 0 8.1 12Zm3.9-4.2c-.4 0-.7 0-1.1.1l1.5 1.5A1.8 1.8 0 0 0 12 7.8c0 .1 0 .2 0 0Z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 5c5.5 0 9.7 3.2 11.5 7-.7 1.5-1.7 2.8-3 4 1 .7 1.7 1.3 2.1 1.7a1 1 0 0 1-1.4 1.4l-1.9-1.9A10.7 10.7 0 0 1 12 19C6.5 19 2.3 15.8.5 12c.5-1.1 1.3-2.2 2.2-3.2l-1.8-1.8a1 1 0 0 1 1.4-1.4l1.9 1.9A10.7 10.7 0 0 1 12 5Zm0 2C7.9 7 4.6 9.2 3 12c1.6 2.8 4.9 5 9 5 1.2 0 2.4-.2 3.5-.6l-1.2-1.2a4 4 0 0 1-5.5-5.5L7.1 7.3A8.8 8.8 0 0 0 12 7Zm0 4a1.9 1.9 0 0 0-1.4.6l2.8 2.8A1.9 1.9 0 0 0 12 11Zm0-2a4 4 0 0 1 4 4c0 .5-.1 1-.3 1.4l-1.6-1.6c0-.3.1-.5.1-.8a2.2 2.2 0 0 0-2.2-2.2c-.3 0-.5 0-.8.1L9.6 8.8c.7-.5 1.5-.8 2.4-.8Z" />
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn-login">Iniciar Sesión</button>
      </form>

      <div v-if="message" class="form-message" role="alert">{{ message }}</div>

      <div class="login-footer">
        <p>¿No tienes una cuenta? <router-link to="/crearcuenta">Regístrate aquí</router-link></p>
        <p class="footer-2">¿Deseas iniciar como negocio? <router-link to="/loginvet">Iniciar como negocio</router-link></p>
        <router-link to="/" class="btn-back">Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped src="./ScreenLogin.css"></style>