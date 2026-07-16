<template>
  <div class="mi-negocio-container">
    <h2>Mi Negocio</h2>

    <div class="negocio-layout">
      <form @submit.prevent="guardarNegocio()" class="negocio-form">
        <div class="form-field">
          <label>Nombre del establecimiento:</label>
          <input v-model="negocio.nombre_establecimiento" type="text" required />
        </div>

        <div class="form-field">
          <label>Descripción:</label>
          <textarea v-model="negocio.descripcion" required></textarea>
        </div>

        <div class="form-field autocomplete">
          <label>Colonia:</label>
          <input
            type="text"
            v-model="coloniaInput"
            placeholder="Escribe tu colonia..."
            @input="filtrarColonias"
            required
          />
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

          <div class="form-field">
            <label>Agregar nuevo servicio:</label>
            <input v-model="nuevoServicio" type="text" placeholder="Ej. Consulta general" />
            <button @click.prevent="agregarServicio" class="btn-save">Agregar</button>
          </div>

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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue';

const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';
const API_URL = `${API_BASE_URL}/api`;

const coloniaInput = ref('');
const filteredColonias = ref([]);
const mostrarModalUbicacion = ref(false);
const savedBodyOverflow = ref('');
const mapContainer = ref(null);
const mapa = ref(null);
const marcadorActual = ref(null);
const marcadorSeleccionado = ref(null);
const ubicacionTemporal = ref({ latitud: null, longitud: null });
const cargandoMapa = ref(false);
const errorMapa = ref('');
const mapaIntentoInicial = ref(false);

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
let googleMapsLoaderPromise = null;
let mapClickListener = null;

function cargarGoogleMapsApi() {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!googleMapsLoaderPromise) {
    googleMapsLoaderPromise = new Promise((resolve, reject) => {
      if (!googleMapsApiKey) {
        reject(new Error('Falta configurar VITE_GOOGLE_MAPS_API_KEY'));
        return;
      }

      const script = document.createElement('script');
      const params = new URLSearchParams({ key: googleMapsApiKey, v: 'weekly', loading: 'async' });
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
      document.head.appendChild(script);
    });
  }

  return googleMapsLoaderPromise;
}

function filtrarColonias() {
  const query = coloniaInput.value.toLowerCase();
  filteredColonias.value = colonias.value.filter(c => c.nombre.toLowerCase().includes(query));
}

function seleccionarColonia(colonia) {
  negocio.value.id_colonia = colonia.id_colonia;
  coloniaInput.value = colonia.nombre;
  filteredColonias.value = [];
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

const tieneUbicacionGuardada = computed(() => negocio.value.latitud !== null && negocio.value.longitud !== null);
const coordenadasTextoTemporal = computed(() => {
  if (ubicacionTemporal.value.latitud === null || ubicacionTemporal.value.longitud === null) {
    return 'Aún no seleccionada';
  }

  return `${ubicacionTemporal.value.latitud.toFixed(5)}, ${ubicacionTemporal.value.longitud.toFixed(5)}`;
});

function actualizarTextoCoordenadas() {
  if (negocio.value.latitud !== null && negocio.value.longitud !== null) {
    coordenadasTexto.value = `${Number(negocio.value.latitud).toFixed(5)}, ${Number(negocio.value.longitud).toFixed(5)}`;
  } else {
    coordenadasTexto.value = '';
  }
}

function crearIconoUbicacionActual() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <defs>
        <filter id="u-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#1f7ae0" flood-opacity="0.35"/>
        </filter>
      </defs>
      <g filter="url(#u-shadow)">
        <circle cx="23" cy="23" r="10" fill="#ffffff"/>
        <circle cx="23" cy="23" r="7" fill="#1f7ae0"/>
        <circle cx="23" cy="23" r="16" fill="none" stroke="#1f7ae0" stroke-width="4" opacity="0.35"/>
      </g>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(46, 46),
    anchor: new google.maps.Point(23, 23)
  };
}

function crearIconoSeleccionado() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54">
      <defs>
        <filter id="s-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#13a57d" flood-opacity="0.35"/>
        </filter>
      </defs>
      <g filter="url(#s-shadow)">
        <path d="M27 5c8.8 0 16 7.2 16 16 0 11.5-13.3 25.2-15.7 27.6a.4.4 0 0 1-.6 0C24.3 46.2 11 32.5 11 21c0-8.8 7.2-16 16-16Z" fill="#13a57d"/>
        <circle cx="27" cy="21" r="5.5" fill="#fff"/>
      </g>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(54, 54),
    anchor: new google.maps.Point(27, 54)
  };
}

function limpiarMapa() {
  if (mapClickListener) {
    google.maps.event.removeListener(mapClickListener);
    mapClickListener = null;
  }

  if (marcadorActual.value) {
    marcadorActual.value.setMap(null);
    marcadorActual.value = null;
  }

  if (marcadorSeleccionado.value) {
    marcadorSeleccionado.value.setMap(null);
    marcadorSeleccionado.value = null;
  }

  if (mapa.value) {
    google.maps.event.clearInstanceListeners(mapa.value);
  }
}

function actualizarUbicacionActualEnMapa(latitud, longitud) {
  if (!mapa.value) return;

  const posicion = { lat: latitud, lng: longitud };

  if (!marcadorActual.value) {
    marcadorActual.value = new google.maps.Marker({
      map: mapa.value,
      position: posicion,
      title: 'Ubicación actual',
      icon: crearIconoUbicacionActual(),
      zIndex: 900
    });
  } else {
    marcadorActual.value.setPosition(posicion);
  }
}

function destruirMapa() {
  limpiarMapa();
  mapa.value = null;
}

function reajustarMapaVisible(centro) {
  if (!mapa.value) return;

  const aplicarAjuste = () => {
    if (!mapa.value) return;
    google.maps.event.trigger(mapa.value, 'resize');
    mapa.value.setCenter({ lat: centro.latitud, lng: centro.longitud });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      aplicarAjuste();
      window.setTimeout(aplicarAjuste, 120);
    });
  });
}

function establecerUbicacion(latitud, longitud) {
  ubicacionTemporal.value = { latitud, longitud };

  if (mapa.value) {
    const posicion = { lat: latitud, lng: longitud };

    if (!marcadorSeleccionado.value) {
      marcadorSeleccionado.value = new google.maps.Marker({
        map: mapa.value,
        position: posicion,
        icon: crearIconoSeleccionado(),
        title: 'Ubicación seleccionada',
        zIndex: 1000
      });
    } else {
      marcadorSeleccionado.value.setPosition(posicion);
    }

    mapa.value.setCenter(posicion);
    mapa.value.setZoom(Math.max(mapa.value.getZoom(), 16));
  }
}

async function obtenerUbicacionActual() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      posicion => {
        resolve({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

async function cargarMapa() {
  await nextTick();
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  if (!mapContainer.value) {
    if (!mapaIntentoInicial.value) {
      mapaIntentoInicial.value = true;
      await nextTick();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }

    if (!mapContainer.value) return;
  }

  cargandoMapa.value = true;
  errorMapa.value = '';

  try {
    await cargarGoogleMapsApi();

    const ubicacionGuardada = negocio.value.latitud !== null && negocio.value.longitud !== null
      ? { latitud: Number(negocio.value.latitud), longitud: Number(negocio.value.longitud) }
      : null;
    const centro = ubicacionGuardada
      ? { ...ubicacionGuardada, zoom: 16 }
      : { latitud: 19.4326, longitud: -99.1332, zoom: 12 };

    if (!mapa.value) {
      mapa.value = new google.maps.Map(mapContainer.value, {
        center: { lat: centro.latitud, lng: centro.longitud },
        zoom: centro.zoom,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      });
    } else {
      mapa.value.setCenter({ lat: centro.latitud, lng: centro.longitud });
      mapa.value.setZoom(centro.zoom);
    }

    await nextTick();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    reajustarMapaVisible(centro);

    limpiarMapa();

    const initialPosition = { lat: centro.latitud, lng: centro.longitud };

    marcadorActual.value = new google.maps.Marker({
      map: mapa.value,
      position: initialPosition,
      title: 'Ubicación base',
      icon: crearIconoUbicacionActual(),
      zIndex: 900
    });

    const ubicacionInicialSeleccionada = ubicacionGuardada || { latitud: centro.latitud, longitud: centro.longitud };
    establecerUbicacion(ubicacionInicialSeleccionada.latitud, ubicacionInicialSeleccionada.longitud);

    obtenerUbicacionActual().then(ubicacionUsuario => {
      if (!ubicacionUsuario || !mapa.value) return;
      actualizarUbicacionActualEnMapa(ubicacionUsuario.latitud, ubicacionUsuario.longitud);
    });

    mapClickListener = mapa.value.addListener('click', event => {
      establecerUbicacion(event.latLng.lat(), event.latLng.lng());
    });
  } catch (err) {
    if (!mapaIntentoInicial.value) {
      mapaIntentoInicial.value = true;
      cargandoMapa.value = false;
      await new Promise(resolve => setTimeout(resolve, 0));
      return cargarMapa();
    }

    errorMapa.value = 'No se pudo cargar el mapa. Verifica la API key y que Maps JavaScript API esté habilitada.';
  } finally {
    cargandoMapa.value = false;
  }
}

function lockBodyScroll(isLocked) {
  if (typeof document === 'undefined') return;

  if (isLocked) {
    savedBodyOverflow.value = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = savedBodyOverflow.value;
  }
}

function abrirModalUbicacion() {
  ubicacionTemporal.value = {
    latitud: negocio.value.latitud !== null ? Number(negocio.value.latitud) : null,
    longitud: negocio.value.longitud !== null ? Number(negocio.value.longitud) : null
  };
  mostrarModalUbicacion.value = true;
}

function cerrarModalUbicacion() {
  mostrarModalUbicacion.value = false;
  mapaIntentoInicial.value = false;
}

async function centrarMiUbicacionActual() {
  const ubicacion = await obtenerUbicacionActual();
  if (!ubicacion) {
    return;
  }

  actualizarUbicacionActualEnMapa(ubicacion.latitud, ubicacion.longitud);
  mapa.value?.panTo({ lat: ubicacion.latitud, lng: ubicacion.longitud });
  mapa.value?.setZoom(16);
}

async function confirmarUbicacion() {
  if (ubicacionTemporal.value.latitud === null || ubicacionTemporal.value.longitud === null) {
    alert('Selecciona una ubicación en el mapa o usa tu ubicación actual');
    return;
  }

  negocio.value.latitud = Number(ubicacionTemporal.value.latitud);
  negocio.value.longitud = Number(ubicacionTemporal.value.longitud);
  actualizarTextoCoordenadas();

  try {
    const guardado = await guardarNegocio(false);
    if (guardado) {
      cerrarModalUbicacion();
    }
  } catch (err) {
    alert('No se pudo guardar la ubicación seleccionada');
  }
}

function normalizarNegocio(data) {
  return {
    ...negocio.value,
    ...data,
    latitud: data.latitud !== null && data.latitud !== undefined ? Number(data.latitud) : null,
    longitud: data.longitud !== null && data.longitud !== undefined ? Number(data.longitud) : null
  };
}

async function cargarNegocio() {
  try {
    const res = await fetch(`${API_URL}/veterinaria/${idVet}`);
    if (res.ok) {
      const data = await res.json();
      negocio.value = normalizarNegocio(data);
      actualizarTextoCoordenadas();
    }

    const resColonias = await fetch(`${API_URL}/colonias`);
    colonias.value = await resColonias.json();

    if (negocio.value.id_colonia) {
      const colonia = colonias.value.find(c => c.id_colonia === negocio.value.id_colonia);
      if (colonia) coloniaInput.value = colonia.nombre;
    }

    const resDias = await fetch(`${API_URL}/dias-semana`);
    if (resDias.ok) {
      diasSemana.value = await resDias.json();
      diasSemana.value.forEach(d => {
        horarios.value[d.id_dia] = { hora_apertura: '', hora_cierre: '', cerrado: false };
      });
    }

    const resHorarios = await fetch(`${API_URL}/horarios/${idVet}`);
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

    const resServicios = await fetch(`${API_URL}/servicios`);
    if (resServicios.ok) servicios.value = await resServicios.json();

    const resVetServicios = await fetch(`${API_URL}/vet-servicios/${idVet}`);
    if (resVetServicios.ok) {
      const data = await resVetServicios.json();
      serviciosSeleccionados.value = data.map(s => s.id_servicio);
    }
  } catch (err) {
  }
}

async function guardarNegocio(mostrarAlerta = true) {
  try {
    if (!negocio.value.id_colonia) {
      alert('Debes seleccionar una colonia válida de la lista');
      return false;
    }

    await fetch(`${API_URL}/veterinarias/${idVet}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(negocio.value)
    });

    if (mostrarAlerta) {
      alert('Negocio actualizado correctamente');
    }

    return true;
  } catch (err) {
    if (mostrarAlerta) {
      alert('No se pudo guardar el negocio');
    }
    throw err;
  }
}

async function guardarHorarios() {
  try {
    await fetch(`${API_URL}/horarios/${idVet}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(horarios.value)
    });
    alert('Horarios actualizados correctamente');
  } catch (err) {
  }
}

async function agregarServicio() {
  if (!nuevoServicio.value.trim()) return alert('Escribe un nombre para el servicio');

  try {
    const res = await fetch(`${API_URL}/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoServicio.value })
    });
    const data = await res.json();

    servicios.value.push({ id_servicio: data.id_servicio, nombre: nuevoServicio.value });
    nuevoServicio.value = '';
  } catch (err) {
  }
}

async function guardarServicios() {
  try {
    await fetch(`${API_URL}/vet-servicios/${idVet}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviciosSeleccionados.value)
    });
    alert('Servicios actualizados correctamente');
  } catch (err) {
  }
}

async function subirLogo(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('logo', file);

  try {
    const res = await fetch(`${API_URL}/veterinarias/${idVet}/logo`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    negocio.value.imagen_logo = data.imagen_logo;
  } catch (err) {
  }
}

function getImageUrl(ruta) {
  if (!ruta) return '';
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return ruta.startsWith('/') ? `${API_BASE_URL}${ruta}` : `${API_BASE_URL}/${ruta}`;
}

watch(mostrarModalUbicacion, async abierto => {
  lockBodyScroll(abierto);

  if (abierto) {
    await nextTick();
    await cargarMapa();
  } else {
    destruirMapa();
  }
});

onBeforeUnmount(() => {
  lockBodyScroll(false);
});

onMounted(async () => {
  await cargarNegocio();
});
</script>

<style scoped src="./ScreenMiNegocio.css"></style>
