<template>
  <div class="veterinarios-container">
    <div class="sidebar-overlay" :class="{ active: menuAbierto }" @click="menuAbierto = false"></div>

    <aside class="sidebar" :class="{ open: menuAbierto }">
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

    <div class="main-content">
      <header class="top-bar">
        <button class="btn-hamburger" @click="menuAbierto = !menuAbierto">
          <span></span><span></span><span></span>
        </button>

        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Busca tu veterinaria ideal aquí..."
            class="search-input"
          >
        </div>

        <button class="btn-map" @click="abrirMapa">Mapa</button>
      </header>

      <main class="feed-section">
        <h2 class="feed-title">Encuentra tu veterinaria ideal aquí 🐶😽</h2>
        <p>{{ veterinariosDentroRadio.length }} veterinarias encontradas en un radio de {{ radioBusquedaKm }} km</p>

        <section class="radio-card">
          <div class="radio-card__header">
            <div>
              <p class="radio-card__eyebrow">Radio de búsqueda</p>
              <h3>{{ ubicacionActualTexto }}</h3>
            </div>
            <div class="radio-card__distance">{{ radioBusquedaKm }} <span>km</span></div>
          </div>

          <input
            class="radio-slider"
            type="range"
            min="1"
            max="25"
            step="1"
            v-model.number="radioBusquedaKm"
          />

          <div class="radio-card__scale">
            <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span>
          </div>
        </section>

        <div class="grid-veterinarios">
          <div
            v-for="vet in veterinariosFiltrados"
            :key="vet.id_vet"
            class="vet-card"
            :class="{ 'vet-card--highlight': vet.dentroRadio, 'vet-card--dimmed': !vet.dentroRadio }"
          >
            <img :src="getImageUrl(vet.imagen_logo)" :alt="vet.nombre_establecimiento" class="vet-image">
            <div class="vet-info">
              <h3>{{ vet.nombre_establecimiento }}</h3>
              <p>{{ vet.descripcion }}</p>
              <p><strong>Ubicación:</strong> {{ vet.nombre_colonia }}</p>
              <p v-if="vet.distanciaKm !== null" class="vet-distance">
                <strong>Distancia:</strong> {{ vet.distanciaKm.toFixed(1) }} km
              </p>
              <p><strong>Horario hoy:</strong> {{ obtenerHorarioHoy(vet.horarios) }}</p>
              <p><strong>Servicios:</strong> {{ obtenerServicios(vet.servicios) }}</p>
              <button class="btn-cita" @click="irCita(vet.id_vet)">Ver detalles</button>
            </div>
          </div>
        </div>

        <p v-if="veterinariosFiltrados.length === 0" class="sin-resultados">
          No se encontraron veterinarios..💩💩
        </p>
      </main>
    </div>

    <Teleport to="body">
      <div v-if="mostrarMapa" class="map-modal-backdrop" @click.self="cerrarMapa">
        <div class="map-modal">
          <div class="map-modal__header">
            <div>
              <h3>Mapa de veterinarias</h3>
              <p>Tu ubicación actual, todas las veterinarias y el radio seleccionado</p>
            </div>
            <button class="map-modal__close" @click="cerrarMapa">×</button>
          </div>

          <div class="map-modal__toolbar">
            <button class="btn-map btn-map--secondary" @click="centrarMapaUsuario">Centrar mi ubicación actual</button>
            <div class="map-modal__radius">Radio: {{ radioBusquedaKm }} km</div>
            <input
              class="map-modal__radius-slider"
              type="range"
              min="1"
              max="25"
              step="1"
              v-model.number="radioBusquedaKm"
            >
          </div>

          <div ref="mapContainer" class="map-container"></div>

          <div class="map-legend">
            <span><i class="legend-dot legend-dot--user"></i> Tu ubicación</span>
            <span><i class="legend-dot legend-dot--inside"></i> Dentro del radio</span>
            <span><i class="legend-dot legend-dot--outside"></i> Fuera del radio</span>
          </div>

          <p v-if="errorMapa" class="map-status map-status--error">{{ errorMapa }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';

const router = useRouter();
const searchQuery = ref('');
const veterinarios = ref([]);
const menuAbierto = ref(false);
const diaActual = new Date().getDay();
const radioBusquedaKm = ref(10);
const ubicacionActual = ref({ latitud: null, longitud: null, etiqueta: 'Ciudad de México · ubicación actual' });
const ubicacionCargada = ref(false);
const mostrarMapa = ref(false);
const mapContainer = ref(null);
const googleMapsMap = ref(null);
const googleMarkers = ref(new Map());
const currentLocationMarker = ref(null);
const currentRadiusCircle = ref(null);
const cargandoMapa = ref(false);
const errorMapa = ref('');
const errorMapaDetalle = ref('');

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
let googleMapsLoaderPromise = null;
let previousGmAuthFailure = null;

function mostrarErrorMapa(contexto, error) {
  const detalle = error instanceof Error ? error.message : String(error ?? 'Error desconocido');
  errorMapa.value = contexto;
  errorMapaDetalle.value = detalle;
  console.error(contexto, error);
}

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

      const timeoutId = window.setTimeout(() => {
        reject(new Error('Google Maps tardó demasiado en responder'));
      }, 15000);

      previousGmAuthFailure = window.gm_authFailure;
      window.gm_authFailure = () => {
        window.clearTimeout(timeoutId);
        reject(new Error('Google Maps rechazó la clave. Revisa la API habilitada, las restricciones de referrer y la facturación.'));
      };

      const callbackName = '__migoGoogleMapsInit';
      window[callbackName] = () => {
        window.clearTimeout(timeoutId);
        resolve(window.google?.maps ?? null);
        delete window[callbackName];
      };

      const script = document.createElement('script');
      const params = new URLSearchParams({
        key: googleMapsApiKey,
        v: 'weekly',
        callback: callbackName
      });
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (!window.google?.maps) {
          reject(new Error('Google Maps cargó el script pero no expuso window.google.maps'));
        }
      };
      script.onerror = () => {
        window.clearTimeout(timeoutId);
        reject(new Error('No se pudo cargar el script de Google Maps'));
        delete window[callbackName];
      };
      document.head.appendChild(script);
    });
  }

  return googleMapsLoaderPromise;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const deltaLat = toRad(lat2 - lat1);
  const deltaLon = toRad(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function parseCoord(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getVetCoords(vet) {
  const latitud = parseCoord(vet.latitud);
  const longitud = parseCoord(vet.longitud);
  if (latitud === null || longitud === null) return null;
  return { latitud, longitud };
}

function getDistanceInfo(vet) {
  const coordsVet = getVetCoords(vet);
  if (!coordsVet || ubicacionActual.value.latitud === null || ubicacionActual.value.longitud === null) {
    return { distanciaKm: null, dentroRadio: true };
  }

  const distanciaKm = haversineKm(
    ubicacionActual.value.latitud,
    ubicacionActual.value.longitud,
    coordsVet.latitud,
    coordsVet.longitud
  );

  return {
    distanciaKm,
    dentroRadio: distanciaKm <= Number(radioBusquedaKm.value)
  };
}

function enrichVeterinario(vet) {
  const { distanciaKm, dentroRadio } = getDistanceInfo(vet);
  return {
    ...vet,
    distanciaKm,
    dentroRadio
  };
}

const veterinariosConDistancia = computed(() => veterinarios.value.map(enrichVeterinario));

const veterinariosDentroRadio = computed(() => {
  if (!ubicacionCargada.value) return veterinariosConDistancia.value;

  return veterinariosConDistancia.value
    .filter(vet => vet.dentroRadio)
    .sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0));
});

const veterinariosFiltrados = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return veterinariosDentroRadio.value;

  return veterinariosDentroRadio.value.filter(vet => {
    const busqueda = [vet.nombre_establecimiento, vet.descripcion, vet.nombre_colonia || '']
      .join(' ')
      .toLowerCase();
    return busqueda.includes(query);
  });
});

const ubicacionActualTexto = computed(() => {
  if (ubicacionActual.value.latitud !== null && ubicacionActual.value.longitud !== null) {
    return ubicacionActual.value.etiqueta;
  }

  return 'Ubicación no disponible';
});

const cargarVeterinarios = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/veterinarias/detallado`);
    if (!res.ok) throw new Error('Error al cargar veterinarias');
    veterinarios.value = await res.json();
  } catch (err) {
    console.error('Error al obtener veterinarios:', err);
  }
};

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

async function cargarUbicacionActual() {
  const ubicacion = await obtenerUbicacionActual();
  if (ubicacion) {
    ubicacionActual.value.latitud = ubicacion.latitud;
    ubicacionActual.value.longitud = ubicacion.longitud;
    ubicacionActual.value.etiqueta = 'Ubicación actual';
  }
  ubicacionCargada.value = true;
}

function obtenerIconoUsuario() {
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

function obtenerIconoVet(dentroRadio) {
  const fill = dentroRadio ? '#13a57d' : '#d05b5b';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      <defs>
        <filter id="v-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g filter="url(#v-shadow)">
        <path d="M21 3c7.2 0 13 5.8 13 13 0 8.3-9.7 18.4-12.1 20.8a1.3 1.3 0 0 1-1.8 0C17.7 34.4 8 24.3 8 16 8 8.8 13.8 3 21 3Z" fill="${fill}"/>
        <circle cx="21" cy="15" r="4.5" fill="#ffffff"/>
      </g>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(42, 42),
    anchor: new google.maps.Point(21, 42)
  };
}

function limpiarMapa() {
  googleMarkers.value.forEach(marker => marker.setMap(null));
  googleMarkers.value.clear();

  if (currentLocationMarker.value) {
    currentLocationMarker.value.setMap(null);
    currentLocationMarker.value = null;
  }

  if (currentRadiusCircle.value) {
    currentRadiusCircle.value.setMap(null);
    currentRadiusCircle.value = null;
  }
}

function destruirMapa() {
  limpiarMapa();
  googleMapsMap.value = null;
}

function obtenerCentroInicialMapa() {
  if (ubicacionActual.value.latitud !== null && ubicacionActual.value.longitud !== null) {
    return { latitud: ubicacionActual.value.latitud, longitud: ubicacionActual.value.longitud, zoom: 13 };
  }

  const respaldo = veterinarios.value.map(getVetCoords).find(Boolean);
  if (respaldo) {
    return { latitud: respaldo.latitud, longitud: respaldo.longitud, zoom: 12 };
  }

  return { latitud: 19.4326, longitud: -99.1332, zoom: 12 };
}

function actualizarMarcadoresMapa() {
  if (!googleMapsMap.value || ubicacionActual.value.latitud === null || ubicacionActual.value.longitud === null) {
    return;
  }

  const center = { lat: ubicacionActual.value.latitud, lng: ubicacionActual.value.longitud };

  if (!currentLocationMarker.value) {
    currentLocationMarker.value = new google.maps.Marker({
      map: googleMapsMap.value,
      position: center,
      title: 'Tu ubicación',
      icon: obtenerIconoUsuario(),
      zIndex: 1000
    });
  } else {
    currentLocationMarker.value.setPosition(center);
  }

  if (!currentRadiusCircle.value) {
    currentRadiusCircle.value = new google.maps.Circle({
      map: googleMapsMap.value,
      center,
      radius: Number(radioBusquedaKm.value) * 1000,
      strokeColor: '#1f7ae0',
      strokeOpacity: 0.45,
      strokeWeight: 2,
      fillColor: '#1f7ae0',
      fillOpacity: 0.12
    });
  } else {
    currentRadiusCircle.value.setCenter(center);
    currentRadiusCircle.value.setRadius(Number(radioBusquedaKm.value) * 1000);
  }

  veterinariosConDistancia.value.forEach(vet => {
    const coords = getVetCoords(vet);
    if (!coords) return;

    let marker = googleMarkers.value.get(vet.id_vet);
    const markerPosition = { lat: coords.latitud, lng: coords.longitud };

    if (!marker) {
      marker = new google.maps.Marker({
        position: markerPosition,
        map: googleMapsMap.value,
        icon: obtenerIconoVet(vet.dentroRadio),
        title: vet.nombre_establecimiento,
        zIndex: vet.dentroRadio ? 900 : 700
      });
      googleMarkers.value.set(vet.id_vet, marker);
    } else {
      marker.setPosition(markerPosition);
      marker.setIcon(obtenerIconoVet(vet.dentroRadio));
      marker.setZIndex(vet.dentroRadio ? 900 : 700);
    }
  });
}

async function cargarMapa() {
  await nextTick();
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  if (!mapContainer.value) {
    mostrarErrorMapa('No se pudo montar el contenedor del mapa.', new Error('mapContainer no está disponible'));
    return;
  }

  cargandoMapa.value = true;
  errorMapa.value = '';
  errorMapaDetalle.value = '';

  try {
    await cargarGoogleMapsApi();

    const centroInicial = obtenerCentroInicialMapa();

    if (!googleMapsMap.value) {
      googleMapsMap.value = new window.google.maps.Map(mapContainer.value, {
        center: { lat: centroInicial.latitud, lng: centroInicial.longitud },
        zoom: centroInicial.zoom,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      });
    } else {
      googleMapsMap.value.setCenter({ lat: centroInicial.latitud, lng: centroInicial.longitud });
      googleMapsMap.value.setZoom(centroInicial.zoom);
    }

    await nextTick();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    google.maps.event.trigger(googleMapsMap.value, 'resize');
    googleMapsMap.value.setCenter({ lat: centroInicial.latitud, lng: centroInicial.longitud });

    limpiarMapa();
    actualizarMarcadoresMapa();
  } catch (err) {
    mostrarErrorMapa('No se pudo cargar el mapa de veterinarias.', err);
  } finally {
    cargandoMapa.value = false;
  }
}

function abrirMapa() {
  mostrarMapa.value = true;
}

function cerrarMapa() {
  mostrarMapa.value = false;
  destruirMapa();
}

function centrarMapaUsuario() {
  if (!googleMapsMap.value || ubicacionActual.value.latitud === null || ubicacionActual.value.longitud === null) return;
  const center = { lat: ubicacionActual.value.latitud, lng: ubicacionActual.value.longitud };
  googleMapsMap.value.setCenter(center);
  googleMapsMap.value.setZoom(13);
}

const obtenerHorarioHoy = (horarios) => {
  if (!horarios || !horarios[diaActual]) return 'No disponible';
  const hoy = horarios[diaActual];
  return hoy.cerrado ? 'Cerrado' : `${hoy.hora_apertura} - ${hoy.hora_cierre}`;
};

const obtenerServicios = (servicios) => (!servicios || servicios.length === 0) ? 'No registrados' : servicios.map(s => s.nombre).join(', ');
const getImageUrl = (ruta) => {
  if (!ruta) return '';
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return ruta.startsWith('/') ? `${API_BASE_URL}${ruta}` : `${API_BASE_URL}/${ruta}`;
};
const handleLogout = () => { sessionStorage.removeItem('migo_user'); router.push('/'); };
const irCita = (idVet) => router.push({ path: '/masinfo', query: { id_vet: idVet } });

onMounted(async () => {
  await Promise.all([cargarVeterinarios(), cargarUbicacionActual()]);
});

onUnmounted(() => {
  if (previousGmAuthFailure !== null) {
    window.gm_authFailure = previousGmAuthFailure;
    previousGmAuthFailure = null;
  }
});

watch(mostrarMapa, async abierto => {
  if (abierto) {
    await cargarMapa();
  } else {
    destruirMapa();
  }
});

watch([radioBusquedaKm, veterinariosConDistancia], () => {
  if (mostrarMapa.value) {
    actualizarMarcadoresMapa();
  }
});
</script>

<style scoped src="./ScreenVeterinarios.css"></style>
