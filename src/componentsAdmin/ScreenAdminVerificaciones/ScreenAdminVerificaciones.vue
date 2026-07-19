<template>
  <div class="vet-verifications-page">
    <header class="vet-verifications-header">
      <div>
        <h2>Verificaciones pendientes</h2>
        <p>{{ pendingCount }} pendientes</p>
      </div>
      <span class="vet-verifications-header__pill" :class="{ 'is-empty': pendingCount === 0 }">
        {{ pendingCount }} {{ pendingCount === 1 ? 'pendiente' : 'pendientes' }}
      </span>
    </header>

    <div v-if="cargando" class="vet-verifications-loading">Cargando verificaciones...</div>

    <div v-else class="vet-verifications-grid">
      <button
        v-for="vet in veterinarias"
        :key="vet.id_vet"
        type="button"
        class="vet-verification-card"
        @click="abrirDetalle(vet)"
      >
        <div class="vet-verification-card__top">
          <div class="vet-verification-card__icon">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 3h10l4 4v14H5V3zm9 1.5V8h3.5L14 4.5zM7 12h10v1.7H7V12zm0 3.5h10v1.7H7v-1.7z" />
            </svg>
          </div>
          <span class="vet-verification-status" :class="estadoClass(vet.estado_verificacion)">
            <span class="vet-verification-status__icon">{{ estadoIcon(vet.estado_verificacion) }}</span>
            {{ estadoLabel(vet.estado_verificacion) }}
          </span>
        </div>

        <div class="vet-verification-card__body">
          <h3>{{ vet.nombre_establecimiento }}</h3>
          <p>{{ vet.correo_negocio }}</p>
          <div class="vet-verification-card__file">
            <span>📎</span>
            <span>{{ nombreDocumento(vet.documento_verificacion_nombre) }}</span>
          </div>
        </div>
      </button>
    </div>

    <p v-if="!cargando && veterinarias.length === 0" class="vet-verifications-empty">
      No se han encontrado veterinarias para verificar.
    </p>

    <div v-if="modalAbierto" class="vet-verification-modal__overlay" @click.self="cerrarDetalle">
      <section class="vet-verification-modal">
        <header class="vet-verification-modal__header">
          <div class="vet-verification-modal__header-main">
            <div class="vet-verification-modal__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 3h10l4 4v14H5V3zm9 1.5V8h3.5L14 4.5zM7 12h10v1.7H7V12zm0 3.5h10v1.7H7v-1.7z" />
              </svg>
            </div>
            <div>
              <h3>{{ veterinariaDetalle?.nombre_establecimiento }}</h3>
              <p :class="['vet-verification-modal__status-text', estadoClass(veterinariaDetalle?.estado_verificacion)]">
                {{ modalStatusText }}
              </p>
            </div>
          </div>
          <button type="button" class="vet-verification-modal__close" @click="cerrarDetalle">×</button>
        </header>

        <div class="vet-verification-modal__body">
          <section class="vet-verification-info-card">
            <h4>Datos del negocio</h4>
            <div class="vet-verification-info-grid">
              <span>Correo</span><strong>{{ veterinariaDetalle?.correo_negocio || '—' }}</strong>
              <span>Teléfono</span><strong>{{ veterinariaDetalle?.telefono_local || '—' }}</strong>
              <span>Colonia</span><strong>{{ veterinariaDetalle?.nombre_colonia || '—' }}</strong>
              <span>Descripción</span><strong>{{ veterinariaDetalle?.descripcion || '—' }}</strong>
              <span>Servicios</span>
              <strong class="vet-verification-services">
                <template v-if="(veterinariaDetalle?.servicios || []).length">
                  <span v-for="servicio in veterinariaDetalle.servicios" :key="servicio.id_servicio">{{ servicio.nombre }}</span>
                </template>
                <template v-else>—</template>
              </strong>
            </div>
          </section>

          <section class="vet-verification-document-card">
            <h4>Documento enviado</h4>
            <div class="vet-verification-document-box">
              <div class="vet-verification-document-box__icon" :class="documentoTipoClase">
                <svg v-if="esPdfDocumento" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 2h8l4 4v16H6V2zm8 1.5V7h3.5L14 3.5zM8 11h8v1.5H8V11zm0 3h8v1.5H8V14zm0 3h6v1.5H8V17z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M4 4h16v16H4V4zm3.2 10.4 2.4-3 2.1 2.7 3-4 3.3 4.3V18H7.2v-3.6zM9.5 9A1.5 1.5 0 1 1 6.5 9a1.5 1.5 0 0 1 3 0z" />
                </svg>
              </div>
              <strong>{{ nombreDocumento(veterinariaDetalle?.documento_verificacion_nombre) }}</strong>
              <p>Cédula profesional</p>
              <button
                type="button"
                class="vet-verification-document-box__button"
                :disabled="!tieneDocumento"
                @click="verDocumento"
              >
                Ver documento
              </button>
            </div>
          </section>

          <section v-if="veterinariaDetalle?.estado_verificacion === 'rechazada' && veterinariaDetalle?.documento_verificacion_rechazo" class="vet-verification-reason">
            <strong>Motivo de rechazo</strong>
            <p>{{ veterinariaDetalle.documento_verificacion_rechazo }}</p>
          </section>
        </div>

        <div v-if="veterinariaDetalle?.estado_verificacion === 'pendiente'" class="vet-verification-modal__actions">
          <button type="button" class="btn-rechazar" :disabled="guardandoEstado" @click="rechazar">
            {{ guardandoEstado ? 'Procesando...' : '✕ Rechazar' }}
          </button>
          <button type="button" class="btn-verificar" :disabled="guardandoEstado" @click="aprobar">
            {{ guardandoEstado ? 'Procesando...' : '✓ Verificar' }}
          </button>
        </div>

        <div v-else class="vet-verification-modal__status-banner" :class="estadoClass(veterinariaDetalle?.estado_verificacion)">
          <span>{{ estadoBannerText }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';
const veterinarias = ref([]);
const cargando = ref(true);
const modalAbierto = ref(false);
const veterinariaDetalle = ref(null);
const guardandoEstado = ref(false);
let intervaloRecarga = null;

const estadoLabelMap = {
  pendiente: '⏳ Pendiente',
  aprobada: 'Verificado',
  rechazada: 'Rechazado',
  sin_solicitud: '• Sin revisión'
};

const estadoBannerMap = {
  pendiente: '⏳ Esta veterinaria está pendiente de revisión',
  aprobada: '✓ Esta veterinaria fue verificada',
  rechazada: '✕ Esta veterinaria fue rechazada',
  sin_solicitud: '• Sin solicitud de verificación'
};

const normalizarEstado = (estado) => {
  const estadosValidos = ['pendiente', 'aprobada', 'rechazada', 'sin_solicitud'];
  return estadosValidos.includes(estado) ? estado : 'sin_solicitud';
};

const estadoLabel = (estado) => estadoLabelMap[normalizarEstado(estado)] || estadoLabelMap.sin_solicitud;
const estadoBannerText = computed(() => estadoBannerMap[normalizarEstado(veterinariaDetalle.value?.estado_verificacion)]);
const modalStatusText = computed(() => estadoLabel(veterinariaDetalle.value?.estado_verificacion));
const pendingCount = computed(() => veterinarias.value.filter(v => normalizarEstado(v.estado_verificacion) === 'pendiente').length);

const estadoClass = (estado) => `is-${normalizarEstado(estado)}`;
const estadoIcon = (estado) => {
  const valor = normalizarEstado(estado);
  if (valor === 'aprobada') return '✓';
  if (valor === 'rechazada') return '✕';
  if (valor === 'pendiente') return '⏳';
  return '•';
};

const normalizarNombreArchivo = (texto) => {
  if (!texto) return '';
  const valor = String(texto);

  if (!/[ÃÂâ�]/.test(valor)) {
    return valor;
  }

  try {
    const bytes = Uint8Array.from(valor, caracter => caracter.charCodeAt(0));
    const reparado = new TextDecoder('utf-8').decode(bytes);
    return reparado || valor;
  } catch (error) {
    return valor;
  }
};

const nombreDocumento = (texto) => normalizarNombreArchivo(texto) || 'Documento no disponible';

const documentoTipoClase = computed(() => {
  const nombre = veterinariaDetalle.value?.documento_verificacion_nombre || '';
  const tipo = veterinariaDetalle.value?.documento_verificacion_tipo || '';
  const esPdf = /\.pdf$/i.test(nombre) || /pdf/i.test(tipo);
  return esPdf ? 'is-pdf' : 'is-image';
});

const esPdfDocumento = computed(() => documentoTipoClase.value === 'is-pdf');
const tieneDocumento = computed(() => Boolean(veterinariaDetalle.value?.documento_verificacion_nombre));

const cargarVeterinarias = async () => {
  cargando.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/veterinarias`);
    if (!response.ok) throw new Error('No se pudieron cargar las veterinarias');
    veterinarias.value = await response.json();
  } catch (error) {
    veterinarias.value = [];
  } finally {
    cargando.value = false;
  }
};

const cargarDetalle = async (idVet) => {
  const response = await fetch(`${API_BASE_URL}/api/veterinaria/${idVet}/detallado`);
  if (!response.ok) throw new Error('No se pudo cargar el detalle');
  veterinariaDetalle.value = await response.json();
};

const abrirDetalle = async (vet) => {
  veterinariaDetalle.value = vet;
  modalAbierto.value = true;
  try {
    await cargarDetalle(vet.id_vet);
  } catch (error) {
    console.error(error);
  }
};

const cerrarDetalle = () => {
  modalAbierto.value = false;
  veterinariaDetalle.value = null;
};

const verDocumento = () => {
  if (!veterinariaDetalle.value?.id_vet || !tieneDocumento.value) return;
  const url = `${API_BASE_URL}/api/veterinarias/${veterinariaDetalle.value.id_vet}/verificacion/documento?inline=1`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const sincronizarSesionVetan = (estado, motivoRechazo = null) => {
  const sessionUser = JSON.parse(sessionStorage.getItem('migo_user') || 'null');
  if (!sessionUser) return;
  sessionUser.estado_verificacion = estado;
  sessionUser.documento_verificacion_rechazo = motivoRechazo;
  sessionStorage.setItem('migo_user', JSON.stringify(sessionUser));
};

const emitirActualizacion = () => {
  window.dispatchEvent(new CustomEvent('migo-verification-updated'));
};

const actualizarEstado = async (estado, motivoRechazo = '') => {
  if (!veterinariaDetalle.value?.id_vet) return;
  guardandoEstado.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/veterinarias/${veterinariaDetalle.value.id_vet}/verificacion`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_verificacion: estado, motivo_rechazo: motivoRechazo })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.error || 'No se pudo actualizar la verificación');
    }

    veterinariaDetalle.value.estado_verificacion = estado;
    veterinariaDetalle.value.documento_verificacion_rechazo = data.documento_verificacion_rechazo || motivoRechazo || null;
    sincronizarSesionVetan(estado, data.documento_verificacion_rechazo || motivoRechazo || null);
    emitirActualizacion();
    await cargarVeterinarias();
    await cargarDetalle(veterinariaDetalle.value.id_vet);
  } finally {
    guardandoEstado.value = false;
  }
};

const aprobar = async () => {
  await actualizarEstado('aprobada');
};

const rechazar = async () => {
  const motivo = window.prompt('Escribe el motivo del rechazo (opcional)') || '';
  await actualizarEstado('rechazada', motivo);
};

onMounted(async () => {
  await cargarVeterinarias();
  intervaloRecarga = window.setInterval(cargarVeterinarias, 20000);
});

onBeforeUnmount(() => {
  if (intervaloRecarga) {
    window.clearInterval(intervaloRecarga);
  }
});
</script>

<style scoped src="./ScreenAdminVerificaciones.css"></style>
