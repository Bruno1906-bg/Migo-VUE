<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
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
      <main class="feed-section">
        <h2 class="feed-title">Mi Perfil</h2>

        <div class="perfil-avatar-left">
          <Avatar 
            :name="usuario?.nombre || 'U'" 
            :size="150" 
            :color="avatarColor" 
            :rounded="true" 
            :fontSize="60" 
          />
        </div>

        <div v-if="usuario" class="perfil-container">
          <div class="perfil-info">
            <div class="perfil-field">
              <label>Nombre:</label>
              <input v-model="usuario.nombre" type="text" :disabled="!editableFields.nombre" />
              <span class="edit-icon" @click="toggleEdit('nombre')">⇲</span>
            </div>

            <div class="perfil-field">
              <label>Apellido:</label>
              <input v-model="usuario.apellido" type="text" :disabled="!editableFields.apellido" />
              <span class="edit-icon" @click="toggleEdit('apellido')">⇲</span>
            </div>

            <div class="perfil-field">
              <label>Correo:</label>
              <input v-model="usuario.correo" type="email" :disabled="!editableFields.correo" />
              <span class="edit-icon" @click="toggleEdit('correo')">⇲</span>
            </div>

            <div class="perfil-field">
              <label>Teléfono:</label>
              <input v-model="usuario.telefono" type="text" :disabled="!editableFields.telefono" />
              <span class="edit-icon" @click="toggleEdit('telefono')">⇲</span>
            </div>

            <div class="perfil-field">
              <label>Dirección:</label>
              <input v-model="usuario.direccion" type="text" :disabled="!editableFields.direccion" />
              <span class="edit-icon" @click="toggleEdit('direccion')">⇲</span>
            </div>

            <div class="perfil-field">
              <label>Colonia:</label>
              <select v-model="usuario.id_colonia" :disabled="!editableFields.colonia">
                <option v-for="col in colonias" :key="col.id_colonia" :value="col.id_colonia">
                  {{ col.nombre }}
                </option>
              </select>
              <span class="edit-icon" @click="toggleEdit('colonia')">⇲</span>
            </div>

            <div class="perfil-field">
              <label>Fecha de registro:</label>
              <p>{{ usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : 'N/A' }}</p>
            </div>
          </div>

          <button class="btn-save" @click="guardarPerfil">Guardar cambios</button>
        </div>

        <div v-else class="no-data">
          <p>Cargando perfil...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from "vue3-avatar";

const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';
const router = useRouter();

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
const avatarColor = ref('#14a098');
const editableFields = ref({
  nombre: false, apellido: false, correo: false, 
  telefono: false, direccion: false, colonia: false
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
};

const guardarPerfil = async () => {
  try {
    await fetch(`${API_BASE_URL}/api/usuarios/${idUsuario}`, {
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
  if (!idUsuario) return;
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${idUsuario}`);
    usuario.value = await response.json();

    const resColonias = await fetch(`${API_BASE_URL}/api/colonias`);
    colonias.value = await resColonias.json();

    const baseColors = ['#14a098', '#0f7d77', '#1abc9c', '#16a085'];
    const index = idUsuario % baseColors.length;
    const tone = (idUsuario % 3 - 1) * 0.2;
    avatarColor.value = shadeColor(baseColors[index], tone);
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
});
</script>

<style scoped src="./ScreenMiperfil.css"></style>