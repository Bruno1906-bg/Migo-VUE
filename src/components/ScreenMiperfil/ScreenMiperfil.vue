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
      <button class="btn-hamburger" @click="menuAbierto = !menuAbierto">
        <span></span><span></span><span></span>
      </button>

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
              <select v-else v-model="usuario.id_colonia" :disabled="!editableFields.colonia">
                <option v-for="col in colonias" :key="col.id_colonia" :value="col.id_colonia">{{ col.nombre }}</option>
              </select>
              <span class="edit-icon" @click="toggleEdit(key)">✎</span>
            </div>
            
            <div class="perfil-field">
              <label>Registro:</label>
              <p>{{ usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : 'N/A' }}</p>
            </div>
          </div>
          <button class="btn-save" @click="guardarPerfil">Guardar cambios</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from "vue3-avatar";

const router = useRouter();
const menuAbierto = ref(false);
const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';

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
};

const guardarPerfil = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/usuarios/${idUsuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario.value)
    });
    if (!res.ok) throw new Error('Error al actualizar');
    alert("Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al guardar perfil:", error);
    alert("Error al guardar: " + error.message);
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
    const [resUser, resCol] = await Promise.all([
      fetch(`${API_BASE_URL}/api/usuarios/${idUsuario}`),
      fetch(`${API_BASE_URL}/api/colonias`)
    ]);
    
    usuario.value = await resUser.json();
    colonias.value = await resCol.json();

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