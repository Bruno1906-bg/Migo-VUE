<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const API_URL = 'https://migobackenddeploy-production.up.railway.app/api';

const fotoInput = ref(null);
const fileName = ref('');
const previewUrl = ref(null);
const colonias = ref([]);
const filteredColonias = ref([]);
const coloniaInput = ref('');
const showSuggestions = ref(false);
const especies = ref([]);
const tipos = ref([]);

const form = reactive({
  id_usuario: sessionStorage.getItem('id_usuario') ? parseInt(sessionStorage.getItem('id_usuario')) : null,
  id_tipo: '',
  nombre_pet: '',
  id_especie: '',
  id_colonia: '',
  descripcion: '',
  id_estado: 1,
  foto: null
});

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.foto = file;
    fileName.value = file.name;
    previewUrl.value = URL.createObjectURL(file);
  }
};

onMounted(async () => {
  try {
    const [resC, resE, resT] = await Promise.all([
      fetch(`${API_URL}/colonias`),
      fetch(`${API_URL}/especies`),
      fetch(`${API_URL}/tipos_publi`)
    ]);
    colonias.value = await resC.json();
    especies.value = await resE.json();
    tipos.value = await resT.json();
  } catch (err) {
    console.error("Error al cargar catálogos", err);
  }
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const filtrarColonias = () => {
  const query = coloniaInput.value.toLowerCase();
  filteredColonias.value = colonias.value.filter(c =>
    c.nombre.toLowerCase().includes(query)
  );
  showSuggestions.value = filteredColonias.value.length > 0;
};

const seleccionarColonia = (colonia) => {
  form.id_colonia = colonia.id_colonia;
  coloniaInput.value = colonia.nombre;
  showSuggestions.value = false;
};

const handleClickOutside = (event) => {
  const input = document.getElementById('colonia');
  if (input && !input.contains(event.target)) {
    showSuggestions.value = false;
  }
};

const handlePublicar = async () => {
  if (!form.id_usuario) {
    alert("Sesión no detectada.");
    router.push('/login');
    return;
  }

  // Crear FormData para enviar imagen y datos juntos
  const formData = new FormData();
  formData.append('id_usuario', form.id_usuario);
  formData.append('id_colonia', form.id_colonia);
  formData.append('id_especie', form.id_especie);
  formData.append('id_tipo', form.id_tipo);
  formData.append('id_estado', form.id_estado);
  formData.append('nombre_pet', form.nombre_pet);
  formData.append('descripcion', form.descripcion);
  if (form.foto) {
    formData.append('imagen', form.foto);
  }

  try {
    // Usamos el endpoint unificado que procesa todo
    const response = await fetch(`${API_URL}/publicaciones-con-foto`, {
      method: 'POST',
      body: formData 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear publicación');
    }

    alert("¡Publicación realizada con éxito!");
    router.push('/dashboard');
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
};
</script>