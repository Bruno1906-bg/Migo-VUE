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

          <!-- 🔹 Autocomplete de colonias -->
          <div class="input-group full-width autocomplete">
            <label for="colonia">Colonia</label>
            <input 
              id="colonia" 
              type="text" 
              v-model="coloniaInput" 
              placeholder="Escribe tu colonia..."
              @input="filtrarColonias" 
              required 
            />
            <ul v-if="filteredColonias.length" class="suggestions">
              <li 
                v-for="c in filteredColonias" 
                :key="c.id_colonia" 
                @click="seleccionarColonia(c)"
              >
                {{ c.nombre }}
              </li>
            </ul>
          </div>

          <div class="input-group full-width">
            <label for="correo">Correo Electrónico</label>
            <input v-model="form.correo" type="email" id="correo" required placeholder="Ingrese su correo electrónico">
          </div>

          <div class="input-group full-width">
            <label for="contrasena">Contraseña</label>
            <div class="password-field password-group">
              <input
                v-model="form.contrasena"
                :type="showPassword ? 'text' : 'password'"
                id="contrasena"
                minlength="8"
                required
                placeholder="Crea una contraseña (mínimo 8 caracteres)"
                autocomplete="new-password"
              >
              <button
                type="button"
                class="password-toggle"
                @click="togglePassword"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="showPassword"
                :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 5c5.5 0 9.7 3.2 11.5 7-.6 1.3-1.4 2.4-2.3 3.4l-2-2C20.2 11.7 18 10.2 12 10.2c-.8 0-1.5.1-2.2.2l-1.8-1.8C9.3 8.3 10.6 8 12 8a4 4 0 0 1 4 4c0 .5-.1 1-.3 1.4l-2.2-2.2a1.8 1.8 0 0 0-2.3-2.3L7.1 6.8A10.7 10.7 0 0 1 12 5Zm0 14c-5.5 0-9.7-3.2-11.5-7 .7-1.4 1.6-2.7 2.8-3.8l-2.1-2.1a1 1 0 0 1 1.4-1.4l18 18a1 1 0 1 1-1.4 1.4l-2.3-2.3A10.7 10.7 0 0 1 12 19Zm-3.9-7c0 2.2 1.8 3.9 3.9 3.9.4 0 .8-.1 1.2-.2l-5-5A4 4 0 0 0 8.1 12Zm3.9-4.2c-.4 0-.7 0-1.1.1l1.5 1.5A1.8 1.8 0 0 0 12 7.8c0 .1 0 .2 0 0Z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 5c5.5 0 9.7 3.2 11.5 7-.7 1.5-1.7 2.8-3 4 1 .7 1.7 1.3 2.1 1.7a1 1 0 0 1-1.4 1.4l-1.9-1.9A10.7 10.7 0 0 1 12 19C6.5 19 2.3 15.8.5 12c.5-1.1 1.3-2.2 2.2-3.2l-1.8-1.8a1 1 0 0 1 1.4-1.4l1.9 1.9A10.7 10.7 0 0 1 12 5Zm0 2C7.9 7 4.6 9.2 3 12c1.6 2.8 4.9 5 9 5 1.2 0 2.4-.2 3.5-.6l-1.2-1.2a4 4 0 0 1-5.5-5.5L7.1 7.3A8.8 8.8 0 0 0 12 7Zm0 4a1.9 1.9 0 0 0-1.4.6l2.8 2.8A1.9 1.9 0 0 0 12 11Zm0-2a4 4 0 0 1 4 4c0 .5-.1 1-.3 1.4l-1.6-1.6c0-.3.1-.5.1-.8a2.2 2.2 0 0 0-2.2-2.2c-.3 0-.5 0-.8.1L9.6 8.8c.7-.5 1.5-.8 2.4-.8Z" />
                </svg>
              </button>
            </div>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { registrarUsuario, obtenerColonias } from './CrearCuenta';

const router = useRouter();
const form = reactive({
  nombre: '', apellido: '', telefono: '', direccion: '', correo: '', contrasena: '', id_colonia: ''
});

const colonias = ref([]);
const filteredColonias = ref([]);
const coloniaInput = ref('');
const showPassword = ref(false);

const message = ref('');
const messageType = ref('');

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const cerrarSugerencias = (event) => {
  if (!event.target.closest('.autocomplete')) {
    filteredColonias.value = [];
  }
};

onMounted(async () => {
  try {
    const data = await obtenerColonias();

    const unique = [];
    const seen = new Set();
    for (const c of data) {
      if (!seen.has(c.nombre.toLowerCase())) {
        seen.add(c.nombre.toLowerCase());
        unique.push(c);
      }
    }
    colonias.value = unique;
  } catch (e) {
    console.error("Error al cargar colonias", e);
  }

  document.addEventListener('click', cerrarSugerencias);
});

const filtrarColonias = () => {
  const query = coloniaInput.value.toLowerCase();
  filteredColonias.value = colonias.value.filter(c =>
    c.nombre.toLowerCase().includes(query)
  );
};

const seleccionarColonia = (colonia) => {
  form.id_colonia = colonia.id_colonia;
  coloniaInput.value = colonia.nombre;
  filteredColonias.value = [];
};

const handleRegister = async () => {
  try {
    if (!form.id_colonia) {
      throw new Error("Por favor, selecciona una colonia.");
    }

    const result = await registrarUsuario(form);

    message.value = result.warning
      ? `${result.message} ${result.warning}`
      : (result.message || "¡Registro exitoso! Redirigiendo al inicio de sesión...");
    messageType.value = "success";

    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (err) {
    message.value = err.message;
    messageType.value = "error";
  }
};

onUnmounted(() => {
  document.removeEventListener('click', cerrarSugerencias);
});
</script>


<style scoped src="./ScreenCrearCuenta.css"></style>
