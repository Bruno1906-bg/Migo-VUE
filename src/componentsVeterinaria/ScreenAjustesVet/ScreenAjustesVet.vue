<template>
    <!-- Contenido principal -->
    <div class="main-content">
        <h2>Ajustes</h2>
        <!-- Card de datos -->
        <div v-if="usuario" class="perfil-container">
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
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from "vue3-avatar";

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
    nombre: false,
    apellido: false,
    correo: false,
    telefono: false,
    direccion: false,
    colonia: false
});

const idUsuario = sessionStorage.getItem('id_usuario');


const toggleEdit = (field) => {
    editableFields.value[field] = !editableFields.value[field];
};

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



    } catch (error) {
    }
});
</script>

<style scoped src="./ScreenAjustesVet.css"></style>
