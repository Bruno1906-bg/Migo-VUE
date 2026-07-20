<template>
  <AppShell active-menu="dashboard" :show-desktop-top-bar="false" :logout-to="'/'" :main-class="'detalle-publi-main'" :top-bar-class="'app-shell__topbar--detail'" @logout="handleLogout">
    <template #header>
      <button @click="$router.back()" class="btn-volver">← Volver</button>
    </template>

    <main class="main-content" v-if="pub">
      <button @click="$router.back()" class="btn-volver btn-volver--desktop">← Volver</button>

      <div class="card-detalles">
<img :src="getImageUrl(pub.ruta_imagen)" class="publi-grande" alt="Mascota">
        <h1>{{ pub.nombre_pet }}</h1>
        <p class="desc">{{ pub.descripcion }}</p>
        
        <div class="info-grid">
          <p><strong>Ubicación:</strong> {{ pub.nombre_colonia }}</p>
          <p><strong>Estado:</strong> {{ pub.estado }}</p>
          <p><strong>Especie:</strong> {{ pub.especie }}</p>
          <p><strong>Tipo:</strong> {{ pub.tipo }}</p>
          <p><strong>Publicado por:</strong> {{ pub.usuario }}</p>
        </div>

        <button @click="mostrarContacto = !mostrarContacto" class="btn-contacto">
          Contacto
        </button>

        <div v-if="mostrarContacto && usuarioPub" class="contact-card">
          <div class="contact-avatar">
            <Avatar :name="usuarioPub.nombre || 'U'" :size="80" :color="avatarColor" :rounded="true" />
          </div>
          <div class="contact-info">
            <p><strong>{{ usuarioPub.nombre }} {{ usuarioPub.apellido }}</strong></p>
            <p>{{ usuarioPub.correo }}</p>
            <p>{{ usuarioPub.telefono }}</p>
          </div>
        </div>
      </div>

      <div class="seccion-resenas">
        <h3>Comentarios</h3>
        <div class="form-resena">
          <textarea v-model="nuevoComentario" placeholder="Escribe un comentario..."></textarea>
          <button @click="enviarComentario" class="btn-comentar">Publicar Comentario</button>
        </div>

        <div class="lista-resenas">
          <div v-for="c in comentarios" :key="c.id_comentario" class="resena-item">
            <p><strong>{{ c.nombre_completo }}</strong></p>
            
            <div v-if="comentarioEnEdicion === c.id_comentario">
              <textarea v-model="textoEdicion" class="edit-textarea"></textarea>
              <div class="pub-actions">
                <button @click="guardarEdicion(c.id_comentario)" class="btn-comentar">Guardar</button>
                <button @click="comentarioEnEdicion = null" class="btn-delete-pub">Cancelar</button>
              </div>
            </div>
            
            <div v-else>
              <p>{{ c.comentario }}</p>
              <div v-if="currentUser && currentUser.id_usuario === c.id_usuario" class="pub-actions">
                <button @click="iniciarEdicion(c)" class="btn-edit-pub">Editar</button>
                <button @click="eliminarComentario(c.id_comentario)" class="btn-delete-pub">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </AppShell>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Avatar from "vue3-avatar";
import AppShell from '../AppShell/AppShell.vue';

const route = useRoute();
const router = useRouter();
const pub = ref(null);
const comentarios = ref([]);
const nuevoComentario = ref('');
const currentUser = JSON.parse(sessionStorage.getItem('migo_user'));

const comentarioEnEdicion = ref(null); 
const textoEdicion = ref('');
const mostrarContacto = ref(false);
const usuarioPub = ref(null);
const avatarColor = ref('#14a098');

const getImageUrl = (ruta) => {
  if (!ruta) return '';
  return /^https?:\/\//i.test(ruta) ? ruta : `http://localhost:4000${ruta}`;
};

const cargarDatos = async () => {
  const idBuscado = route.query.id_publi;
  const idLimpio = String(idBuscado).split(':')[0];
  try {
const res = await fetch('http://localhost:4000/api/publicaciones');
    const todasLasPubs = await res.json();
    pub.value = todasLasPubs.find(p => String(p.id_publi) === idLimpio);

    if (pub.value) {
const resUser = await fetch(`http://localhost:4000/api/usuarios/${pub.value.id_usuario}`);
      if (resUser.ok) usuarioPub.value = await resUser.json();
    }
    await cargarComentarios(idLimpio);
  } catch (err) { console.error("Error al cargar:", err); }
};

const cargarComentarios = async (id) => {
  try {
    const res = await fetch(`http://localhost:4000/api/comentarios/${id}`);
    if (res.ok) comentarios.value = await res.json();
  } catch (err) { console.error("Error cargando comentarios:", err); }
};

const enviarComentario = async () => {
  if (!nuevoComentario.value.trim()) return;
  const id = route.query.id_publi.split(':')[0];
  await fetch('http://localhost:4000/api/comentarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_publi: id, id_usuario: currentUser.id_usuario, comentario: nuevoComentario.value })
  });
  nuevoComentario.value = '';
  cargarComentarios(id);
};

const iniciarEdicion = (c) => {
  comentarioEnEdicion.value = c.id_comentario;
  textoEdicion.value = c.comentario;
};

const guardarEdicion = async (id) => {
  await fetch(`http://localhost:4000/api/comentarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      comentario: textoEdicion.value,
      id_usuario: currentUser.id_usuario 
    })
  });
  comentarioEnEdicion.value = null;
  cargarComentarios(route.query.id_publi.split(':')[0]);
};

const eliminarComentario = async (idComentario) => {
  if (!confirm('¿Eliminar comentario?')) return;
  const id = route.query.id_publi.split(':')[0];
  await fetch(`http://localhost:4000/api/comentarios/${idComentario}/${currentUser.id_usuario}`, { method: 'DELETE' });
  cargarComentarios(id);
};

const handleLogout = () => { sessionStorage.removeItem('migo_user'); router.push('/'); };

onMounted(cargarDatos);
</script>

<style scoped src="./ScreenMoreInfoPubli.css"></style>