<template>
  <div class="detalle-vet-container-layout">
    <div class="sidebar-overlay" :class="{ active: menuAbierto }" @click="menuAbierto = false"></div>

    <aside class="sidebar" :class="{ open: menuAbierto }">
      <button class="close-sidebar" @click="menuAbierto = false">✕</button>
      <div class="sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item">° Publicaciones</router-link>
        <router-link to="/perfil" class="menu-item">° Mi Perfil</router-link>
        <router-link to="/veterinarios" class="menu-item active">° Veterinarios</router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <main class="main-content-detalle" v-if="vet">
      <div class="top-bar-mobile">
        <button class="btn-hamburger" @click="menuAbierto = !menuAbierto">
          <span></span><span></span><span></span>
        </button>
        <button @click="$router.back()" class="btn-volver">← Volver</button>
      </div>

      <div class="card-detalles">
        <img :src="getImageUrl(vet.imagen_logo)" class="logo-grande" alt="Logo">
        <h1>{{ vet.nombre_establecimiento }}</h1>
        <p class="desc">{{ vet.descripcion }}</p>
        
        <div class="info-grid">
          <p><strong>Ubicación:</strong> {{ vet.nombre_colonia }}</p>
          <p><strong>Email:</strong> {{ vet.correo_negocio }}</p>
          <p><strong>Teléfono:</strong> {{ vet.telefono_local }}</p>
          <p><strong>Sitio Web:</strong> <a :href="vet.sitio_web" target="_blank">{{ vet.sitio_web }}</a></p>
        </div>

        <div class="cards-info">
          <div class="card-info" v-if="vet.horarios?.length">
            <h3>Horarios de Atención</h3>
            <ul>
              <li v-for="h in vet.horarios" :key="h.id_dia">
                {{ h.dia }}: <span>{{ h.cerrado ? 'Cerrado' : `${h.hora_apertura} - ${h.hora_cierre}` }}</span>
              </li>
            </ul>
          </div>

          <div class="card-info" v-if="vet.servicios?.length">
            <h3>Servicios ofrecidos</h3>
            <ul>
              <li v-for="s in vet.servicios" :key="s.id_servicio">{{ s.nombre }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="seccion-resenas">
        <h3>Reseñas y Calificaciones</h3>
        <div class="form-resena">
          <select v-model="nuevaCalificacion" class="select-calificacion">
            <option v-for="n in 5" :key="n" :value="n">{{ n }} ⭐</option>
          </select>
          <textarea v-model="nuevaResena" placeholder="Escribe tu opinión..."></textarea>
          <button @click="enviarResena" class="btn-publicar">Publicar Reseña</button>
        </div>

        <div class="lista-resenas">
          <div v-for="r in resenas" :key="r.id_resena" class="resena-item">
            <div v-if="editingId === r.id_resena" class="edit-mode">
              <textarea v-model="editTexto"></textarea>
              <select v-model="editCalificacion">
                <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
              </select>
              <button @click="guardarEdicion(r.id_resena)">Guardar</button>
              <button @click="editingId = null">Cancelar</button>
            </div>

            <div v-else>
              <p>Usuario: <strong>{{ r.nombre_completo }}</strong></p>
              <p>{{ r.comentario }}</p>
              <small>Calificación: {{ r.calificacion }} ⭐</small>
              <div v-if="currentUser && currentUser.id_usuario === r.id_usuario" class="actions">
                <button @click="iniciarEdicion(r)" class="btn-edit">Editar</button>
                <button @click="eliminarResena(r.id_resena)" class="btn-delete">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const vet = ref(null);
const resenas = ref([]);
const nuevaResena = ref('');
const nuevaCalificacion = ref(5);
const editingId = ref(null);
const editTexto = ref('');
const editCalificacion = ref(5);
const menuAbierto = ref(false);
const currentUser = JSON.parse(sessionStorage.getItem('migo_user'));

const cargarDatosCompletos = async () => {
  const idVet = route.query.id_vet;
  if (!idVet) return;
  try {
const resVet = await fetch(`https://migobackenddeploy-production.up.railway.app/api/veterinaria/${idVet}/detallado`);
    vet.value = await resVet.json();
const resResenas = await fetch(`https://migobackenddeploy-production.up.railway.app/api/resenas/${idVet}`);
    resenas.value = await resResenas.json();
  } catch (err) { console.error(err); }
};

const getImageUrl = (ruta) => {
  if (!ruta) return '';
  return /^https?:\/\//i.test(ruta) ? ruta : `https://migobackenddeploy-production.up.railway.app${ruta}`;
};

const enviarResena = async () => {
  if (!currentUser) return alert("Inicia sesión");
  await fetch('https://migobackenddeploy-production.up.railway.app/api/resenas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_vet: route.query.id_vet, id_usuario: currentUser.id_usuario, comentario: nuevaResena.value, calificacion: nuevaCalificacion.value })
  });
  nuevaResena.value = '';
  cargarDatosCompletos();
};

const iniciarEdicion = (r) => {
  editingId.value = r.id_resena;
  editTexto.value = r.comentario;
  editCalificacion.value = r.calificacion;
};

const guardarEdicion = async (id) => {
  await fetch(`https://migobackenddeploy-production.up.railway.app/api/resenas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comentario: editTexto.value, calificacion: editCalificacion.value })
  });
  editingId.value = null;
  cargarDatosCompletos();
};

const eliminarResena = async (id) => {
  if (!confirm('¿Borrar reseña?')) return;
  await fetch(`https://migobackenddeploy-production.up.railway.app/api/resenas/${id}`, { method: 'DELETE' });
  cargarDatosCompletos();
};

const handleLogout = () => { sessionStorage.removeItem('migo_user'); router.push('/'); };

onMounted(cargarDatosCompletos);
</script>

<style scoped src="./ScreenMoreInfo.css"></style>