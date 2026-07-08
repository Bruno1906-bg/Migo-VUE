<template>
  <div class="veterinarios-container">
    <!-- Overlay móvil -->
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
        <!-- Botón Hamburguesa -->
        <button class="btn-hamburger" @click="menuAbierto = !menuAbierto">
          <span></span><span></span><span></span>
        </button>

        <div class="search-container">
          <input type="text" v-model="searchQuery" placeholder="Busca tu veterinaria ideal aquí..." class="search-input">
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
            v-model="radioBusquedaKm"
          />

          <div class="radio-card__scale">
            <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span>
          </div>
        </section>

        <div class="grid-veterinarios">
          <div v-for="vet in veterinariosFiltrados" :key="vet.id_vet" class="vet-card" :class="{ 'vet-card--highlight': vet.dentroRadio, 'vet-card--dimmed': !vet.dentroRadio }">
            <img :src="getImageUrl(vet.imagen_logo)" :alt="vet.nombre_establecimiento" class="vet-image">
            <div class="vet-info">
              <h3>{{ vet.nombre_establecimiento }}</h3>
              <p>{{ vet.descripcion }}</p>
              <p><strong>Ubicación:</strong> {{ vet.nombre_colonia }}</p>
              <p v-if="vet.distanciaKm !== null" class="vet-distance"><strong>Distancia:</strong> {{ vet.distanciaKm.toFixed(1) }} km</p>
              <p>{{ obtenerHorarioHoy(vet.horarios) }}</p>
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
              v-model="radioBusquedaKm"
            />
          </div>

          <div ref="mapContainer" class="map-container"></div>

          <div class="map-legend">
            <span><i class="legend-dot legend-dot--user"></i> Tu ubicación</span>
            <span><i class="legend-dot legend-dot--inside"></i> Dentro del radio</span>
            <span><i class="legend-dot legend-dot--outside"></i> Fuera del radio</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

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

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
const googleMapsMapId = import.meta.env.VITE_GOOGLE_MAPS_ID ?? '';
let googleMapsLoaderPromise = null;

function cargarGoogleMapsApi() {
  if (window.google?.maps) return Promise.resolve(window.google.maps);

  if (!googleMapsLoaderPromise) {
    googleMapsLoaderPromise = new Promise((resolve, reject) => {
      if (!googleMapsApiKey) {
        reject(new Error('Falta configurar VITE_GOOGLE_MAPS_API_KEY'));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
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

function obtenerPrimerCentroDisponible() {
  const conCoordenadas = veterinarios.value.find(vet => getVetCoords(vet));
  const coords = conCoordenadas ? getVetCoords(conCoordenadas) : null;

  if (coords) {
    return { latitud: coords.latitud, longitud: coords.longitud };
  }

  return { latitud: 19.4326, longitud: -99.1332 };
}

function obtenerCentroInicialMapa() {
  if (ubicacionActual.value.latitud !== null && ubicacionActual.value.longitud !== null) {
    return {
      latitud: ubicacionActual.value.latitud,
      longitud: ubicacionActual.value.longitud,
      zoom: 13
    };
  }

  const respaldo = obtenerPrimerCentroDisponible();
  return {
    latitud: respaldo.latitud,
    longitud: respaldo.longitud,
    zoom: 12
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

  return veterinariosConDistancia.value.filter(vet => vet.dentroRadio);
});

const cargarVeterinarios = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/veterinarias/detallado');
    if (!res.ok) throw new Error('Error al cargar veterinarias');
    veterinarios.value = await res.json();
  } catch (err) { console.error("Error al obtener veterinarios:", err); }
};

async function obtenerUbicacionActual() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      posicion => {
        resolve({
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude
        });
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
  const fill = dentroRadio ? '#14a098' : '#9aa5ad';
  const shadow = dentroRadio ? '0.35' : '0.18';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <defs>
        <filter id="v-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#0f4f4b" flood-opacity="${shadow}"/>
        </filter>
      </defs>
      <g filter="url(#v-shadow)">
        <path d="M23 5c8.8 0 16 7.2 16 16 0 11.6-13.1 20.8-15.2 22.2-.5.3-1.1.3-1.6 0C20.1 41.8 7 32.6 7 21c0-8.8 7.2-16 16-16z" fill="${fill}"/>
        <circle cx="16.5" cy="19" r="2.6" fill="#fff"/>
        <circle cx="23" cy="16.3" r="2.6" fill="#fff"/>
        <circle cx="29.5" cy="19" r="2.6" fill="#fff"/>
        <circle cx="18.6" cy="24" r="2.4" fill="#fff"/>
        <circle cx="27.4" cy="24" r="2.4" fill="#fff"/>
        <ellipse cx="23" cy="29.2" rx="7.2" ry="5.4" fill="#fff"/>
      </g>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 36)
  };
}

function limpiarMapa() {
  googleMarkers.value.forEach(marker => {
    marker.map = null;
  });
  googleMarkers.value.clear();
  if (currentLocationMarker.value) currentLocationMarker.value.map = null;
  if (currentRadiusCircle.value) currentRadiusCircle.value.setMap(null);
  currentLocationMarker.value = null;
  currentRadiusCircle.value = null;
}

function actualizarMarcadoresMapa() {
  if (!googleMapsMap.value || ubicacionActual.value.latitud === null || ubicacionActual.value.longitud === null) return;

  const center = { lat: ubicacionActual.value.latitud, lng: ubicacionActual.value.longitud };

  if (!currentLocationMarker.value) {
    currentLocationMarker.value = new google.maps.Marker({
      position: center,
      map: googleMapsMap.value,
      icon: obtenerIconoUsuario(),
      title: 'Tu ubicación actual'
    });
  } else {
    currentLocationMarker.value.setPosition(center);
  }

  if (!currentRadiusCircle.value) {
    currentRadiusCircle.value = new google.maps.Circle({
      strokeColor: '#14a098',
      strokeOpacity: 0.75,
      strokeWeight: 2,
      fillColor: '#14a098',
      fillOpacity: 0.08,
      map: googleMapsMap.value,
      center,
      radius: Number(radioBusquedaKm.value) * 1000
    });
  } else {
    currentRadiusCircle.value.setCenter(center);
    currentRadiusCircle.value.setRadius(Number(radioBusquedaKm.value) * 1000);
  }

  const vets = veterinariosConDistancia.value;
  vets.forEach(vet => {
    const coords = getVetCoords(vet);
    if (!coords) return;

    let marker = googleMarkers.value.get(vet.id_vet);
    if (!marker) {
      marker = new google.maps.Marker({
        position: { lat: coords.latitud, lng: coords.longitud },
        map: googleMapsMap.value,
        icon: obtenerIconoVet(vet.dentroRadio),
        title: vet.nombre_establecimiento,
        zIndex: vet.dentroRadio ? 900 : 700
      });

      googleMarkers.value.set(vet.id_vet, marker);
    } else {
      marker.setPosition({ lat: coords.latitud, lng: coords.longitud });
      marker.setIcon(obtenerIconoVet(vet.dentroRadio));
      marker.setZIndex(vet.dentroRadio ? 900 : 700);
    }
  });
}

async function inicializarMapa() {
  if (!mapContainer.value) return;

  cargandoMapa.value = true;
  errorMapa.value = '';

  try {
    await cargarGoogleMapsApi();

    limpiarMapa();

    const centroInicial = obtenerCentroInicialMapa();

    if (!googleMapsMap.value) {
      googleMapsMap.value = new google.maps.Map(mapContainer.value, {
        center: { lat: centroInicial.latitud, lng: centroInicial.longitud },
        zoom: centroInicial.zoom,
        mapId: googleMapsMapId || undefined,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy'
      });

      googleMapsMap.value.addListener('click', event => {
        googleMapsMap.value.setCenter(event.latLng);
        googleMapsMap.value.setZoom(Math.max(googleMapsMap.value.getZoom(), 13));
      });
    } else {
      googleMapsMap.value.setCenter({ lat: centroInicial.latitud, lng: centroInicial.longitud });
      googleMapsMap.value.setZoom(centroInicial.zoom);
    }

    actualizarMarcadoresMapa();
  } catch (err) {
    console.error('Error inicializando mapa:', err);
    errorMapa.value = 'No se pudo cargar el mapa. Revisa tu API key y permisos de Google Maps.';
  } finally {
    cargandoMapa.value = false;
  }
}

function abrirMapa() {
  mostrarMapa.value = true;
}

function cerrarMapa() {
  mostrarMapa.value = false;
  if (googleMapsMap.value) {
    limpiarMapa();
    googleMapsMap.value = null;
  }
}

function centrarMapaUsuario() {
  if (!googleMapsMap.value || ubicacionActual.value.latitud === null || ubicacionActual.value.longitud === null) return;
  const center = { lat: ubicacionActual.value.latitud, lng: ubicacionActual.value.longitud };
  googleMapsMap.value.setCenter(center);
  googleMapsMap.value.setZoom(13);
}

function actualizarAlturasMapa() {
  if (!googleMapsMap.value) return;
  window.google?.maps?.event?.trigger(googleMapsMap.value, 'resize');
  centrarMapaUsuario();
}

onMounted(async () => {
  await Promise.all([cargarVeterinarios(), cargarUbicacionActual()]);
});

watch([radioBusquedaKm, veterinariosConDistancia, mostrarMapa], async () => {
  if (mostrarMapa.value) {
    await nextTick();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    if (!googleMapsMap.value) {
      await inicializarMapa();
    } else {
      actualizarMarcadoresMapa();
      actualizarAlturasMapa();
    }
  }
});

const filteredVeterinarios = computed(() => {
  const base = veterinariosConDistancia.value;
  const filtradosPorRadio = ubicacionCargada.value ? base.filter(vet => vet.dentroRadio) : base;

  if (!searchQuery.value) return filtradosPorRadio;

  return filtradosPorRadio.filter(vet => {
    const busqueda = (vet.nombre_establecimiento + ' ' + vet.descripcion + ' ' + (vet.nombre_colonia || '')).toLowerCase();
    return busqueda.includes(searchQuery.value.toLowerCase());
  });
});

const veterinariosFiltrados = filteredVeterinarios;

const ubicacionActualTexto = computed(() => {
  if (ubicacionActual.value.latitud !== null && ubicacionActual.value.longitud !== null) {
    return ubicacionActual.value.etiqueta;
  }

  return 'No se pudo obtener la ubicación actual';
});

const obtenerIdDiaHoy = () => (diaActual === 0 ? 7 : diaActual);

const obtenerHorarioHoy = (horarios) => {
  if (!horarios) return 'No disponible';

  const idDiaHoy = obtenerIdDiaHoy();
  const hoy = Array.isArray(horarios)
    ? horarios.find(horario => Number(horario.id_dia) === idDiaHoy)
    : horarios[idDiaHoy] || horarios[diaActual];

  if (!hoy) return 'No disponible';

  if (hoy.cerrado || !hoy.hora_apertura || !hoy.hora_cierre) {
    return 'Cerrado hoy';
  }

  return `Abierto hoy · ${hoy.hora_apertura} - ${hoy.hora_cierre}`;
};

const obtenerServicios = (servicios) => (!servicios || servicios.length === 0) ? "No registrados" : servicios.map(s => s.nombre).join(", ");
const getImageUrl = (ruta) => ruta ? `http://localhost:4000${ruta}` : '';
const handleLogout = () => { sessionStorage.removeItem('migo_user'); router.push('/'); };
const irCita = (idVet) => router.push({path:'/masinfo', query: { id_vet: idVet }});
</script>

<style scoped src="./ScreenVeterinarios.css"></style>