<template>
  <div class="admin-usuarios-section">
    <h2 class="feed-title">Gestión de Usuarios</h2>

    <div v-if="cargando" class="feed-title">Cargando usuarios...</div>

    <div v-else class="usuarios-table-container">
      <table class="usuarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Telefono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usuarios" :key="user.id_usuario">
            <td>{{ user.id_usuario }}</td>
            <td>{{ user.nombre }}</td>
            <td>{{ user.correo }}</td>
            <td>{{ user.telefono }}</td>
            <td>{{ user.rol }}</td>
            <td>
              <button @click="eliminarUsuario(user.id_usuario)" class="btn-eliminar">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { obtenerUsuarios, eliminarUsuarioAdmin } from './Usuariosadmin'; 

const usuarios = ref([]);
const cargando = ref(true);
const idAdminActual = sessionStorage.getItem('id_admin');

const cargarUsuarios = async () => {
  try {
    usuarios.value = await obtenerUsuarios();
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
  } finally {
    cargando.value = false;
  }
}; 

const eliminarUsuario = async (id) => {
  if (!confirm('¿Estás seguro de eliminar a este usuario?')) return;
  try {
    await eliminarUsuarioAdmin(id); 
    alert('Usuario y toda su información eliminada correctamente');
    await cargarUsuarios();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

onMounted(cargarUsuarios);
</script>
<style scoped src="./ScreenAdminUsuarios.css"></style>