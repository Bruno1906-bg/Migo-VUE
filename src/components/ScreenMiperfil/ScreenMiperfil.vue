<template>
  <div class="dashboard-layout">
    <div class="sidebar-overlay" :class="{ active: menuAbierto }" @click="menuAbierto = false"></div>

    <aside class="sidebar" :class="{ open: menuAbierto }">
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item">° Publicaciones</router-link>
        <router-link to="/perfil" class="menu-item active">° Mi Perfil</router-link>
        <router-link to="/veterinarios" class="menu-item">° Veterinarios</router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <div class="main-content">
      <div class="mobile-header">
        <button class="btn-hamburger" @click="menuAbierto = !menuAbierto">
          <span></span><span></span><span></span>
        </button>
      </div>

      <main class="feed-section">
        <h2 class="feed-title">Mi Perfil</h2>

        <div class="perfil-avatar-left">
           <Avatar :name="usuario?.nombre || 'U'" :size="150" :color="avatarColor" :rounded="true" :fontSize="60" />
        </div>

        <div v-if="usuario" class="perfil-container">
          <div class="perfil-info">
            <div class="perfil-field" v-for="(val, key) in editableFields" :key="key">
              <label>{{ key.charAt(0).toUpperCase() + key.slice(1) }}:</label>
              <template v-if="key !== 'colonia'">
                <input v-model="usuario[key]" type="text" :disabled="!editableFields[key]" />
              </template>
              <template v-else>
                <div class="autocomplete colonia-field">
                  <input
                    v-if="editableFields.colonia"
                    id="colonia-perfil"
                    type="text"
                    v-model="coloniaInput"
                    placeholder="Escribe tu colonia..."
                    @input="filtrarColonias"
                    required
                  />
                  <input v-else type="text" :value="coloniaInput" disabled />
                  <ul v-if="editableFields.colonia && showSuggestions" class="suggestions">
                    <li
                      v-for="col in filteredColonias"
                      :key="col.id_colonia"
                      @click="seleccionarColonia(col)"
                    >
                      {{ col.nombre }}
                    </li>
                  </ul>
                </div>
              </template>
              <span class="edit-icon" @click="toggleEdit(key)">✎</span>
            </div>
            
            <div class="perfil-field">
              <label>Registro:</label>
              <p>{{ new Date(usuario.fecha_registro).toLocaleDateString() }}</p>
            </div>
          </div>
          <button class="btn-save" @click="guardarPerfil">Guardar cambios</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from "vue3-avatar";

const router = useRouter();
const menuAbierto = ref(false);
const savedBodyOverflow = ref('');

const usuario = ref({
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  direccion: '',
  id_colonia: null,
  fecha_registro: ''
});

const colonias = ref([]);
const filteredColonias = ref([]);
const coloniaInput = ref('');
const showSuggestions = ref(false);
const avatarColor = ref('#14a098');
const editableFields = ref({
  nombre: false,
  apellido: false,
  correo: false,
  telefono: false,
  direccion: false,
  colonia: false
});

const idUsuario = sessionStorage.getItem('id_usuario');

function shadeColor(color, percent) {
  let f = parseInt(color.slice(1),16), 
      t = percent < 0 ? 0 : 255, 
      p = percent < 0 ? percent*-1 : percent, 
      R = f>>16, 
      G = f>>8&0x00FF, 
      B = f&0x0000FF;
  return "#" + (0x1000000 + 
    (Math.round((t-R)*p)+R)*0x10000 + 
    (Math.round((t-G)*p)+G)*0x100 + 
    (Math.round((t-B)*p)+B)).toString(16).slice(1);
}

const toggleEdit = (field) => {
  editableFields.value[field] = !editableFields.value[field];
  if (field === 'colonia' && editableFields.value.colonia) {
    showSuggestions.value = false;
  }
};

const filtrarColonias = () => {
  const query = coloniaInput.value.toLowerCase();
  filteredColonias.value = colonias.value.filter((colonia) =>
    colonia.nombre.toLowerCase().includes(query)
  );
  showSuggestions.value = filteredColonias.value.length > 0;
};

const seleccionarColonia = (colonia) => {
  usuario.value.id_colonia = colonia.id_colonia;
  coloniaInput.value = colonia.nombre;
  showSuggestions.value = false;
};

const handleClickOutside = (event) => {
  const input = document.getElementById('colonia-perfil');
  if (input && !input.contains(event.target)) {
    showSuggestions.value = false;
  }
};

watch(menuAbierto, (isOpen) => {
  if (typeof document === 'undefined') return;

  if (isOpen) {
    savedBodyOverflow.value = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = savedBodyOverflow.value;
  }
});

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = savedBodyOverflow.value;
  document.removeEventListener('click', handleClickOutside);
});

const guardarPerfil = async () => {
  try {
await fetch(`https://migobackenddeploy-production.up.railway.app/api/usuarios/${idUsuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario.value)
    });
    alert("Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al guardar perfil:", error);
  }
};

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  sessionStorage.removeItem('id_usuario');
  router.push('/');
};

onMounted(async () => {
  try {
const response = await fetch(`https://migobackenddeploy-production.up.railway.app/api/usuarios/${idUsuario}`);
    usuario.value = await response.json();

const resColonias = await fetch("https://migobackenddeploy-production.up.railway.app/api/colonias");
    colonias.value = await resColonias.json();
    const coloniaActual = colonias.value.find((colonia) => colonia.id_colonia === usuario.value.id_colonia);
    coloniaInput.value = usuario.value.nombre_colonia || usuario.value.colonia || coloniaActual?.nombre || '';

    const baseColors = ['#14a098', '#0f7d77', '#1abc9c', '#16a085'];
    const index = idUsuario % baseColors.length;
    const tone = (idUsuario % 3 - 1) * 0.2; // -0.2, 0, +0.2
    avatarColor.value = shadeColor(baseColors[index], tone);

     } catch (error) {
  }
  document.addEventListener('click', handleClickOutside);
});
</script>

<style scoped src="./ScreenMiperfil.css"></style>
