<template>
  <AppShell active-menu="perfil" :show-desktop-top-bar="false" :logout-to="'/'" :main-class="'perfil-main'" :top-bar-class="'app-shell__topbar--profile'" @logout="handleLogout">
      <template #header>
        <div class="perfil-mobile-title">Mi Perfil</div>
      </template>

      <main class="feed-section">
        <h2 class="feed-title">Mi Perfil</h2>

        <div class="perfil-avatar-left">
           <Avatar :name="usuario?.nombre || 'U'" :size="150" :color="avatarColor" :rounded="true" :fontSize="60" />
        </div>

        <div v-if="usuario" class="perfil-identity">
          <p class="perfil-identity__name">{{ nombreCompleto }}</p>
          <p class="perfil-identity__email">{{ usuario.correo }}</p>
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
        </div>

        <div class="perfil-actions" v-if="usuario">
          <button class="btn-save" @click="guardarPerfil">Guardar cambios</button>
        </div>
      </main>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from "vue3-avatar";
import AppShell from '../AppShell/AppShell.vue';

const router = useRouter();
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

const nombreCompleto = computed(() => {
  const nombre = usuario.value.nombre?.trim() || '';
  const apellido = usuario.value.apellido?.trim() || '';
  return `${nombre} ${apellido}`.trim() || 'Usuario';
});

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

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const guardarPerfil = async () => {
  try {
    const payload = {
      nombre: usuario.value.nombre,
      apellido: usuario.value.apellido,
      correo: usuario.value.correo,
      telefono: usuario.value.telefono,
      direccion: usuario.value.direccion,
      id_colonia: usuario.value.id_colonia
    };

    const response = await fetch(`${API_BASE_URL}/api/usuarios/${idUsuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const respuesta = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(respuesta?.error || respuesta?.message || 'No se pudo actualizar el perfil');
    }

    await cargarUsuario();
    editableFields.value = {
      nombre: false,
      apellido: false,
      correo: false,
      telefono: false,
      direccion: false,
      colonia: false
    };

    alert("Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al guardar perfil:", error);
    alert(error?.message || 'No se pudo guardar el perfil');
  }
};

const handleLogout = () => {
  sessionStorage.removeItem('migo_user');
  sessionStorage.removeItem('id_usuario');
  router.push('/');
};

const cargarUsuario = async () => {
  const response = await fetch(`${API_BASE_URL}/api/usuarios/${idUsuario}`);
  if (!response.ok) {
    throw new Error('No se pudo cargar el perfil');
  }

  usuario.value = await response.json();

  sessionStorage.setItem('migo_user', JSON.stringify(usuario.value));

  const coloniaActual = colonias.value.find((colonia) => colonia.id_colonia === usuario.value.id_colonia);
  coloniaInput.value = usuario.value.nombre_colonia || usuario.value.colonia || coloniaActual?.nombre || '';
};

onMounted(async () => {
  try {
    const resColonias = await fetch(`${API_BASE_URL}/api/colonias`);
    colonias.value = await resColonias.json();

    await cargarUsuario();

    const baseColors = ['#14a098', '#0f7d77', '#1abc9c', '#16a085'];
    const index = Number(idUsuario) % baseColors.length;
    const tone = (Number(idUsuario) % 3 - 1) * 0.2;
    avatarColor.value = shadeColor(baseColors[index], tone);

  } catch (error) {
    console.error(error);
  }
  document.addEventListener('click', handleClickOutside);
});
</script>

<style scoped src="./ScreenMiperfil.css"></style>
