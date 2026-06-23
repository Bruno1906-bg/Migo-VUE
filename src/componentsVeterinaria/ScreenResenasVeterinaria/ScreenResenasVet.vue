<template>
  <div class="resenas-container">
    <h2>Reseñas y Calificaciones</h2>

    <div v-if="resenas.length === 0" class="no-resenas">
      No hay reseñas aún.
    </div>

    <div v-for="resena in resenas" :key="resena.id_resena" class="resena-card">
      <p><strong>{{ resena.nombre_completo }}</strong></p>
      <p>{{ resena.comentario }}</p>
      <p>Calificación: {{ resena.calificacion }} ⭐</p>
      <small>{{ new Date(resena.fecha_resena).toLocaleDateString() }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const idVet = sessionStorage.getItem('id_vet');
const resenas = ref([]);

onMounted(async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/resenas/${idVet}`);
    if (!response.ok) throw new Error("Error al obtener reseñas");
    resenas.value = await response.json();
  } catch (error) {
    console.error("Error cargando reseñas:", error);
  }
});
</script>

<style scoped src="./ScreenResenasVet.css"></style>
