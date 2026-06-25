<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item">° Publicaciones</router-link>
        <router-link to="/perfil" class="menu-item active">° Mi Perfil</router-link>
        <router-link to="/veterinarios" class="menu-item">° Veterinarios</router-link>
        <router-link to="/servicios" class="menu-item">° Otros servicios</router-link>
        <router-link to="/ajustes" class="menu-item">° Ajustes</router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <!-- Contenido principal -->
    <div class="main-content">
      <main class="feed-section">
        <h2 class="feed-title">Mi Perfil</h2>

        <div v-if="usuario" class="perfil-container">
          <!-- Avatar ilustrado -->
          <div class="perfil-avatar" v-html="avatarSvg"></div>

          <!-- Información editable -->
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
              <p>{{ new Date(usuario.fecha_registro).toLocaleDateString() }}</p>
            </div>
          </div>

          <!-- Botón guardar -->
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
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

const router = useRouter();

// Inicializar usuario como objeto vacío para evitar errores de null
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
const editableFields = ref({
  nombre: false,
  apellido: false,
  correo: false,
  telefono: false,
  direccion: false,
  colonia: false
});

const avatarSvg = ref('');
const idUsuario = sessionStorage.getItem('id_usuario');

const toggleEdit = (field) => {
  editableFields.value[field] = !editableFields.value[field];
};

const guardarPerfil = async () => {
  try {
    await fetch(`http://localhost:4000/api/usuarios/${idUsuario}`, {
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
    // Perfil
    const response = await fetch(`http://localhost:4000/api/usuarios/${idUsuario}`);
    usuario.value = await response.json();

    // Colonias desde la base de datos
    const resColonias = await fetch("http://localhost:4000/api/colonias");
    colonias.value = await resColonias.json();

    // Generar avatar ilustrado con DiceBear
    avatarSvg.value = createAvatar(adventurer, {
      seed: usuario.value.nombre || 'Usuario',
      size: 90,
      backgroundColor: ['14a098']
    }).toString();
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
});
</script>

<style scoped src="./ScreenMiperfil.css"></style>
