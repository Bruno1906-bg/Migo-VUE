<template>
  <div class="mi-negocio-container">
    <h2>Mi Negocio</h2>

    <div class="negocio-layout">
      <!-- Formulario principal -->
      <form @submit.prevent="guardarNegocio" class="negocio-form">
        <div class="form-field">
          <label>Nombre del establecimiento:</label>
          <input v-model="negocio.nombre_establecimiento" type="text" required />
        </div>

        <div class="form-field">
          <label>Descripción:</label>
          <textarea v-model="negocio.descripcion" required></textarea>
        </div>

        <!-- Autocomplete de colonias -->
        <div class="form-field autocomplete">
          <label>Colonia:</label>
          <input type="text" v-model="coloniaInput" placeholder="Escribe tu colonia..." @input="filtrarColonias"
            required />
          <ul v-if="filteredColonias.length" class="suggestions">
            <li v-for="c in filteredColonias" :key="c.id_colonia" @click="seleccionarColonia(c)">
              {{ c.nombre }}
            </li>
          </ul>
        </div>


        <div class="form-field">
          <label>Correo de contacto:</label>
          <input v-model="negocio.correo_negocio" type="email" required />
        </div>

        <div class="form-field">
          <label>Teléfono de contacto:</label>
          <input v-model="negocio.telefono_local" type="text" required />
        </div>

        <div class="form-field">
          <label>Página Web:</label>
          <input v-model="negocio.sitio_web" type="url" placeholder="https://ejemplo.com" />
        </div>

        <div class="form-field">
          <label>Foto de Negocio:</label>
          <input type="file" @change="subirLogo" />
          <img v-if="negocio.imagen_logo" :src="getImageUrl(negocio.imagen_logo)" class="preview-logo" />
        </div>

        <div class="form-field ubicacion-card-wrapper">
          <label>UBICACIÓN EXACTA</label>
          <div class="ubicacion-card" :class="{ 'ubicacion-card--saved': tieneUbicacionGuardada }">
            <div class="ubicacion-card__icon">
              <span v-if="tieneUbicacionGuardada">⌖</span>
              <span v-else>◎</span>
            </div>
            <div class="ubicacion-card__info">
              <strong>{{ tieneUbicacionGuardada ? 'Ubicación guardada' : 'Sin ubicación configurada' }}</strong>
              <span>{{ tieneUbicacionGuardada ? coordenadasTexto : 'Haz clic para seleccionar en el mapa' }}</span>
            </div>
            <button type="button" class="btn-secondary" @click="abrirModalUbicacion">
              {{ tieneUbicacionGuardada ? 'Cambiar' : 'Seleccionar' }}
            </button>
          </div>
          <p v-if="tieneUbicacionGuardada" class="ubicacion-estado">Tu ubicación es visible para los usuarios</p>
        </div>

        <button type="submit" class="btn-save">Guardar cambios</button>
      </form>

      <div class="cards-right">
        <!-- Card de horarios -->
        <div class="horarios-card">
          <h3>Horarios de Atención</h3>
          <form @submit.prevent="guardarHorarios">
            <div v-for="dia in diasSemana" :key="dia.id_dia" class="horario-row">
              <label>{{ dia.nombre }}</label>
              <input type="time" v-model="horarios[dia.id_dia].hora_apertura" />
              <input type="time" v-model="horarios[dia.id_dia].hora_cierre" />
              <label>
                <input type="checkbox" v-model="horarios[dia.id_dia].cerrado" />
                Cerrado
              </label>
            </div>
            <button type="submit" class="btn-save">Guardar Horarios</button>
          </form>
        </div>

        <div class="servicios-card">
          <h3>Servicios ofrecidos</h3>

          <!-- Input para agregar servicio nuevo -->
          <div class="form-field">
            <label>Agregar nuevo servicio:</label>
            <input v-model="nuevoServicio" type="text" placeholder="Ej. Consulta general" />
            <button @click.prevent="agregarServicio" class="btn-save">Agregar</button>
          </div>

          <!-- Lista de servicios -->
          <form @submit.prevent="guardarServicios">
            <div v-for="servicio in servicios" :key="servicio.id_servicio" class="servicio-row">
              <label>
                <input type="checkbox" v-model="serviciosSeleccionados" :value="servicio.id_servicio" />
                {{ servicio.nombre }}
              </label>
            </div>
            <button type="submit" class="btn-save">Guardar Servicios</button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="mostrarModalUbicacion" class="ubicacion-modal-backdrop" @click.self="cerrarModalUbicacion">
      <div class="ubicacion-modal">
        <div class="ubicacion-modal__header">
          <div>
            <h3>Ubicación de tu veterinaria</h3>
            <p>Haz clic directamente en el mapa o usa tu ubicación actual</p>
          </div>
          <button type="button" class="ubicacion-modal__close" @click="cerrarModalUbicacion">×</button>
        </div>

        <div class="ubicacion-buscador">
          <button type="button" class="btn-secondary btn-secondary--light ubicacion-centrar-btn" @click="centrarMiUbicacionActual">
            Mi ubicación actual
          </button>
        </div>

        <div class="ubicacion-map-wrapper">
          <div ref="mapContainer" class="ubicacion-map"></div>
          <div v-if="cargandoMapa" class="ubicacion-map__loading">Cargando mapa...</div>
          <div v-if="errorMapa" class="ubicacion-map__error">{{ errorMapa }}</div>
        </div>

        <div class="ubicacion-modal__footer">
          <div class="ubicacion-modal__coords">
            <span>Ubicación seleccionada:</span>
            <strong>{{ coordenadasTextoTemporal }}</strong>
          </div>
          <div class="ubicacion-modal__actions">
            <button type="button" class="btn-secondary btn-secondary--light" @click="cerrarModalUbicacion">
              Cancelar
            </button>
            <button type="button" class="btn-save" @click="confirmarUbicacion">
              Confirmar ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';

const coloniaInput = ref('')
const filteredColonias = ref([])
const mostrarModalUbicacion = ref(false)
const mapContainer = ref(null)
const mapa = ref(null)
const marcadorActual = ref(null)
const marcadorSeleccionado = ref(null)
const ubicacionTemporal = ref({ latitud: null, longitud: null })
const cargandoMapa = ref(false)
const errorMapa = ref('')

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
const googleMapsMapId = import.meta.env.VITE_GOOGLE_MAPS_ID ?? ''
let googleMapsLoaderPromise = null

function cargarGoogleMapsApi() {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps)
  }

  if (!googleMapsLoaderPromise) {
    googleMapsLoaderPromise = new Promise((resolve, reject) => {
      if (!googleMapsApiKey) {
        reject(new Error('Falta configurar VITE_GOOGLE_MAPS_API_KEY'))
        return
      }

      const script = document.createElement('script')
      const params = new URLSearchParams({
        key: googleMapsApiKey,
        v: 'weekly'
      })

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
      script.async = true
      script.defer = true
      script.onload = () => resolve(window.google.maps)
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps'))
      document.head.appendChild(script)
    })
  }

  return googleMapsLoaderPromise
}

const filtrarColonias = () => {
  const query = coloniaInput.value.toLowerCase()
  filteredColonias.value = colonias.value.filter(c =>
    c.nombre.toLowerCase().includes(query)
  )
}

const seleccionarColonia = (colonia) => {
  negocio.value.id_colonia = colonia.id_colonia
  coloniaInput.value = colonia.nombre
  filteredColonias.value = []
}

const negocio = ref({
  nombre_establecimiento: '',
  descripcion: '',
  id_colonia: null,
  correo_negocio: '',
  telefono_local: '',
  sitio_web: '',
  latitud: null,
  longitud: null,
  imagen_logo: ''
});

const colonias = ref([]);
const diasSemana = ref([]);
const horarios = ref({});
const servicios = ref([]);
const serviciosSeleccionados = ref([]);
const nuevoServicio = ref('');
const idVet = sessionStorage.getItem('id_vet');
const coordenadasTexto = ref('');

const tieneUbicacionGuardada = computed(() => negocio.value.latitud !== null && negocio.value.longitud !== null)
const coordenadasTextoTemporal = computed(() => {
  if (ubicacionTemporal.value.latitud === null || ubicacionTemporal.value.longitud === null) {
    return 'Aún no seleccionada'
  }

  return `${ubicacionTemporal.value.latitud.toFixed(5)}, ${ubicacionTemporal.value.longitud.toFixed(5)}`
})

function actualizarTextoCoordenadas() {
  if (negocio.value.latitud !== null && negocio.value.longitud !== null) {
    coordenadasTexto.value = `${Number(negocio.value.latitud).toFixed(5)}, ${Number(negocio.value.longitud).toFixed(5)}`
  } else {
    coordenadasTexto.value = ''
  }
}

function crearIconoHuella() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#0d6f68" flood-opacity="0.35"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M36 5c13.3 0 24 10.7 24 24 0 17.6-17.7 31.4-22.2 34.7-.9.7-2.1.7-3 0C30.3 60.4 12 46.6 12 29 12 15.7 22.7 5 36 5z" fill="#10a39a"/>
        <circle cx="27" cy="26" r="4.2" fill="#ffffff"/>
        <circle cx="36" cy="21" r="4.2" fill="#ffffff"/>
        <circle cx="45" cy="26" r="4.2" fill="#ffffff"/>
        <circle cx="31" cy="33" r="4" fill="#ffffff"/>
        <circle cx="41" cy="33" r="4" fill="#ffffff"/>
        <ellipse cx="36" cy="43" rx="12" ry="9" fill="#ffffff"/>
      </g>
    </svg>
  `

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(54, 54),
    anchor: new google.maps.Point(27, 54)
  }
}

function crearIconoUbicacionActual() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="10" fill="#ffffff" opacity="0.95"/>
      <circle cx="22" cy="22" r="7" fill="#1a73e8"/>
      <circle cx="22" cy="22" r="16" fill="none" stroke="#1a73e8" stroke-width="4" opacity="0.35"/>
    </svg>
  `

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(44, 44),
    anchor: new google.maps.Point(22, 22)
  }
}

function crearMarcadorUbicacionActual(latitud, longitud) {
  const posicion = { lat: latitud, lng: longitud }

  if (marcadorActual.value) {
    marcadorActual.value.setPosition(posicion)
    return marcadorActual.value
  }

  marcadorActual.value = new google.maps.Marker({
    position: posicion,
    map: mapa.value,
    icon: crearIconoUbicacionActual(),
    zIndex: 800,
    title: 'Tu ubicación actual'
  })

  return marcadorActual.value
}

function crearMarcadorSeleccionado(latitud, longitud) {
  const posicion = { lat: latitud, lng: longitud }

  if (marcadorSeleccionado.value) {
    marcadorSeleccionado.value.setPosition(posicion)
    return marcadorSeleccionado.value
  }

  marcadorSeleccionado.value = new google.maps.Marker({
    position: posicion,
    map: mapa.value,
    icon: crearIconoHuella(),
    zIndex: 999,
    title: 'Ubicación seleccionada'
  })

  return marcadorSeleccionado.value
}

function centrarMapaEnCoordenadas(latitud, longitud, zoom = 15) {
  if (!mapa.value) return

  const posicion = { lat: latitud, lng: longitud }
  mapa.value.setCenter(posicion)
  mapa.value.setZoom(zoom)
  crearMarcadorUbicacionActual(latitud, longitud)
}

function establecerUbicacion(latitud, longitud) {
  ubicacionTemporal.value = { latitud, longitud }
  if (mapa.value) {
    crearMarcadorSeleccionado(latitud, longitud)
    mapa.value.setCenter({ lat: latitud, lng: longitud })
    mapa.value.setZoom(Math.max(mapa.value.getZoom(), 16))
  }
}

async function cargarMapa() {
  await nextTick()

  if (!mapContainer.value || mapa.value) return

  cargandoMapa.value = true
  errorMapa.value = ''

  try {
    await cargarGoogleMapsApi()

    const posicionInicial = await obtenerCentroInicialMapa()
    const latInicial = posicionInicial.latitud
    const lngInicial = posicionInicial.longitud

    mapa.value = new google.maps.Map(mapContainer.value, {
      center: { lat: latInicial, lng: lngInicial },
      zoom: posicionInicial.zoom,
      mapId: googleMapsMapId || undefined,
      zoomControl: true,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      clickableIcons: false,
      gestureHandling: 'greedy'
    })

    mapa.value.addListener('click', event => {
      establecerUbicacion(event.latLng.lat(), event.latLng.lng())
    })

    crearMarcadorUbicacionActual(latInicial, lngInicial)

    if (negocio.value.latitud !== null && negocio.value.longitud !== null) {
      establecerUbicacion(Number(negocio.value.latitud), Number(negocio.value.longitud))
    } else {
      ubicacionTemporal.value = { latitud: latInicial, longitud: lngInicial }
    }
  } catch (err) {
    console.error('Error cargando Google Maps:', err)
    errorMapa.value = 'No se pudo cargar el mapa. Verifica la API key y que Maps JavaScript API esté habilitada.'
  } finally {
    cargandoMapa.value = false
  }
}

function obtenerGeolocalizacionUsuario() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      posicion => {
        resolve({
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude
        })
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    )
  })
}

async function obtenerCentroInicialMapa() {
  const ubicacionUsuario = await obtenerGeolocalizacionUsuario()
  if (ubicacionUsuario) {
    return {
      latitud: ubicacionUsuario.latitud,
      longitud: ubicacionUsuario.longitud,
      zoom: 16
    }
  }

  if (negocio.value.latitud !== null && negocio.value.longitud !== null) {
    return {
      latitud: Number(negocio.value.latitud),
      longitud: Number(negocio.value.longitud),
      zoom: 16
    }
  }

  return {
    latitud: 19.4326,
    longitud: -99.1332,
    zoom: 12
  }
}

function destruirMapa() {
  if (mapa.value) {
    google.maps.event.clearListeners(mapa.value, 'click')
    mapa.value = null
    marcadorActual.value = null
    marcadorSeleccionado.value = null
  }
}

function abrirModalUbicacion() {
  ubicacionTemporal.value = {
    latitud: negocio.value.latitud !== null ? Number(negocio.value.latitud) : null,
    longitud: negocio.value.longitud !== null ? Number(negocio.value.longitud) : null
  }
  mostrarModalUbicacion.value = true
}

function cerrarModalUbicacion() {
  mostrarModalUbicacion.value = false
  destruirMapa()
}

async function centrarMiUbicacionActual() {
  const ubicacionUsuario = await obtenerGeolocalizacionUsuario()

  if (!ubicacionUsuario) {
    alert('No se pudo obtener tu ubicación actual. Revisa los permisos del navegador.')
    return
  }

  establecerUbicacion(ubicacionUsuario.latitud, ubicacionUsuario.longitud)
  mapa.value?.setZoom(16)
}

async function actualizarNegocio(mostrarAlerta = true) {
  await fetch(`http://localhost:4000/api/veterinarias/${idVet}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(negocio.value)
  })

  if (mostrarAlerta) {
    alert('Negocio actualizado correctamente')
  }
}

async function confirmarUbicacion() {
  if (ubicacionTemporal.value.latitud === null || ubicacionTemporal.value.longitud === null) {
    alert('Selecciona una ubicación en el mapa o usa el buscador')
    return
  }

  negocio.value.latitud = Number(ubicacionTemporal.value.latitud)
  negocio.value.longitud = Number(ubicacionTemporal.value.longitud)
  actualizarTextoCoordenadas()
  await actualizarNegocio(true)
  cerrarModalUbicacion()
}

const cargarNegocio = async () => {
  try {
    const res = await fetch(`http://localhost:4000/api/veterinaria/${idVet}`);
    if (res.ok) {
      const data = await res.json();
      negocio.value = {
        ...negocio.value,
        ...data,
        latitud: data.latitud !== null && data.latitud !== undefined ? Number(data.latitud) : null,
        longitud: data.longitud !== null && data.longitud !== undefined ? Number(data.longitud) : null
      }
      actualizarTextoCoordenadas()
    }

    const resColonias = await fetch("http://localhost:4000/api/colonias");
    colonias.value = await resColonias.json();

    if (negocio.value.id_colonia) {
      const colonia = colonias.value.find(c => c.id_colonia === negocio.value.id_colonia)
      if (colonia) coloniaInput.value = colonia.nombre
    }

    const resDias = await fetch("http://localhost:4000/api/dias-semana");
    if (resDias.ok) {
      diasSemana.value = await resDias.json();
      diasSemana.value.forEach(d => {
        horarios.value[d.id_dia] = { hora_apertura: '', hora_cierre: '', cerrado: false };
      });
    }

    const resHorarios = await fetch(`http://localhost:4000/api/horarios/${idVet}`);
    if (resHorarios.ok) {
      const data = await resHorarios.json();
      data.forEach(h => {
        horarios.value[h.id_dia] = {
          hora_apertura: h.hora_apertura || '',
          hora_cierre: h.hora_cierre || '',
          cerrado: h.cerrado === 1
        };
      });
    }

    const resServicios = await fetch("http://localhost:4000/api/servicios");
    if (resServicios.ok) servicios.value = await resServicios.json();

    const resVetServicios = await fetch(`http://localhost:4000/api/vet-servicios/${idVet}`);
    if (resVetServicios.ok) {
      const data = await resVetServicios.json();
      serviciosSeleccionados.value = data.map(s => s.id_servicio);
    }
  } catch (err) {
    console.error("Error cargando negocio:", err);
  }
};

const guardarNegocio = async () => {
  try {
    if (!negocio.value.id_colonia) {
      alert("Debes seleccionar una colonia válida de la lista")
      return
    }

    await actualizarNegocio(true)
  } catch (err) {
    console.error("Error al guardar negocio:", err);
  }
};

const guardarHorarios = async () => {
  try {
    await fetch(`http://localhost:4000/api/horarios/${idVet}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(horarios.value)
    });
    alert("Horarios actualizados correctamente");
  } catch (err) {
    console.error("Error al guardar horarios:", err);
  }
};

const agregarServicio = async () => {
  if (!nuevoServicio.value.trim()) return alert("Escribe un nombre para el servicio");

  try {
    const res = await fetch("http://localhost:4000/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevoServicio.value })
    });
    const data = await res.json();

    servicios.value.push({ id_servicio: data.id_servicio, nombre: nuevoServicio.value });
    nuevoServicio.value = '';
  } catch (err) {
    console.error("Error al agregar servicio:", err);
  }
};

const guardarServicios = async () => {
  try {
    await fetch(`http://localhost:4000/api/vet-servicios/${idVet}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviciosSeleccionados.value)
    });
    alert("Servicios actualizados correctamente");
  } catch (err) {
    console.error("Error al guardar servicios:", err);
  }
};

const subirLogo = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('logo', file);

  try {
    const res = await fetch(`http://localhost:4000/api/veterinarias/${idVet}/logo`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    negocio.value.imagen_logo = data.imagen_logo;
  } catch (err) {
    console.error("Error al subir logo:", err);
  }
};

const getImageUrl = (ruta) => {
  if (!ruta) return '';
  return `http://localhost:4000${ruta}`;
};

watch(mostrarModalUbicacion, async abierto => {
  if (abierto) {
    await cargarMapa()
  } else {
    destruirMapa()
  }
})

onMounted(cargarNegocio);
</script>


<style scoped src="./ScreenMiNegocio.css"></style>
