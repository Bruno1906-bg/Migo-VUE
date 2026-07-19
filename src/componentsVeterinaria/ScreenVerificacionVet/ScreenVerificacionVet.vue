<template>
  <main class="vet-verification-page">
    <section class="vet-verification-hero">
      <div class="vet-verification-hero__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9.55 16.94 4.8 12.2l1.42-1.41 3.33 3.33 8.21-8.21 1.41 1.41z" />
        </svg>
      </div>
      <div class="vet-verification-hero__text">
        <h1>Verifica tu veterinaria</h1>
        <p>Proceso de verificación oficial MIGO</p>
      </div>
    </section>

    <section class="vet-verification-card" :class="cardStateClass">
      <template v-if="estadoVerificacion === 'aprobada'">
        <div class="vet-verification-state vet-verification-state--approved">
          <div class="vet-verification-state__badge">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9.55 16.94 4.8 12.2l1.42-1.41 3.33 3.33 8.21-8.21 1.41 1.41z" />
            </svg>
          </div>
          <h2>Tu veterinaria ya fue aprobada</h2>
          <p>Tu cuenta ya pasó la revisión del administrador. El botón del menú se mostrará en verde para confirmarlo.</p>
        </div>
      </template>

      <template v-else-if="estadoVerificacion === 'rechazada'">
        <div class="vet-verification-state vet-verification-state--rejected">
          <div class="vet-verification-state__badge vet-verification-state__badge--rejected">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9.55 16.94 4.8 12.2l1.42-1.41 3.33 3.33 8.21-8.21 1.41 1.41z" />
            </svg>
          </div>
          <h2>Solicitud rechazada</h2>
          <p v-if="motivoRechazo">{{ motivoRechazo }}</p>
          <p v-else>Tu solicitud de verificación fue rechazada. Sube de nuevo tu cédula o, si tienes dudas, contacta a los administradores.</p>
          <button type="button" class="vet-verification-link-button" @click="restablecerFormulario">
            Subir de nuevo tu cédula
          </button>
        </div>
      </template>

      <template v-else-if="estadoVerificacion === 'pendiente' || archivoEnviado">
        <div class="vet-verification-state vet-verification-state--pending">
          <div class="vet-verification-state__badge vet-verification-state__badge--pending">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9.55 16.94 4.8 12.2l1.42-1.41 3.33 3.33 8.21-8.21 1.41 1.41z" />
            </svg>
          </div>
          <h2>¡Documento enviado!</h2>
          <p>Tu cuenta será revisada por nuestros administradores.</p>
          <p>Te notificaremos cuando tu veterinaria sea verificada.</p>

          <div class="vet-verification-status-pill">
            <span class="vet-verification-status-pill__icon">✓</span>
            <span>En revisión · {{ archivoNombre }}</span>
          </div>

          <button type="button" class="vet-verification-link-button" @click="subirOtroDocumento">
            Subir otro documento
          </button>
        </div>
      </template>

      <template v-else>
        <div class="vet-verification-intro">
          <p class="vet-verification-intro__lead">
            Para verificar tu veterinaria, <strong>sube tu cédula profesional</strong> para que nuestros administradores puedan revisar y verificar tu cuenta.
          </p>

          <ul class="vet-verification-checklist">
            <li>El archivo debe ser legible y estar completo</li>
            <li>Formatos aceptados: PDF, JPG, PNG</li>
            <li>Tamaño máximo: 10 MB</li>
          </ul>
        </div>

        <div class="vet-verification-upload">
          <input
            ref="fileInput"
            class="vet-verification-upload__input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            @change="handleFileChange"
          >

          <button
            type="button"
            class="vet-verification-dropzone"
            @click="abrirSelectorArchivo"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <span class="vet-verification-dropzone__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 3a5 5 0 0 1 5 5v1h1a3 3 0 0 1 0 6h-1v2h1a4 4 0 0 1 0 8H6a4 4 0 0 1 0-8h1v-2H6a3 3 0 0 1 0-6h1V8a5 5 0 0 1 5-5zm-1 7h2V8a1 1 0 0 0-2 0v2zm1 2a1 1 0 0 0-1 1v4h-1.2a.8.8 0 0 0-.6 1.3l2.2 2.7a.8.8 0 0 0 1.2 0l2.2-2.7a.8.8 0 0 0-.6-1.3H13v-4a1 1 0 0 0-1-1z" />
              </svg>
            </span>
            <strong>Arrastra tu archivo aquí</strong>
            <span>o haz clic para seleccionar</span>
            <span class="vet-verification-dropzone__cta">Subir cédula profesional</span>
          </button>

          <div v-if="archivoNombre" class="vet-verification-file-preview">
            <span class="vet-verification-file-preview__label">Archivo seleccionado</span>
            <strong>{{ archivoNombre }}</strong>
          </div>
        </div>

        <button
          type="button"
          class="vet-verification-submit"
          :disabled="!archivoSeleccionado || cargando"
          @click="enviarDocumento"
        >
          {{ cargando ? 'Enviando...' : 'Enviar para verificación' }}
        </button>
      </template>
    </section>

    <p v-if="mensaje" class="vet-verification-message" :class="mensajeTipo">
      {{ mensaje }}
    </p>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app';
const idVet = sessionStorage.getItem('id_vet');

const fileInput = ref(null);
const archivoSeleccionado = ref(null);
const archivoNombre = ref('');
const archivoEnviado = ref(false);
const cargando = ref(false);
const mensaje = ref('');
const mensajeTipo = ref('info');
const estadoVerificacion = ref('sin_solicitud');
const motivoRechazo = ref('');

const cardStateClass = computed(() => `vet-verification-card--${estadoVerificacion.value}`);

const normalizarEstado = (estado) => {
  const estadosValidos = ['sin_solicitud', 'pendiente', 'aprobada', 'rechazada'];
  return estadosValidos.includes(estado) ? estado : 'sin_solicitud';
};

const mostrarMensaje = (texto, tipo = 'info') => {
  mensaje.value = texto;
  mensajeTipo.value = tipo;
};

const restablecerFormulario = () => {
  archivoSeleccionado.value = null;
  archivoNombre.value = '';
  archivoEnviado.value = false;
  estadoVerificacion.value = 'sin_solicitud';
  motivoRechazo.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const abrirSelectorArchivo = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const subirOtroDocumento = async () => {
  restablecerFormulario();
  await new Promise(resolve => requestAnimationFrame(() => resolve()));
  abrirSelectorArchivo();
};

const validarArchivo = (file) => {
  if (!file) return 'Selecciona un archivo primero.';

  const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!tiposPermitidos.includes(file.type)) {
    return 'Formato no permitido. Usa PDF, JPG o PNG.';
  }

  const tamanioMaximo = 10 * 1024 * 1024;
  if (file.size > tamanioMaximo) {
    return 'El archivo no debe superar 10 MB.';
  }

  return '';
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0] || null;
  const error = validarArchivo(file);

  if (error) {
    mostrarMensaje(error, 'error');
    return;
  }

  archivoSeleccionado.value = file;
  archivoNombre.value = file?.name || '';
  archivoEnviado.value = false;
  mensaje.value = '';
};

const handleDrop = (event) => {
  const file = event.dataTransfer?.files?.[0] || null;
  const error = validarArchivo(file);

  if (error) {
    mostrarMensaje(error, 'error');
    return;
  }

  archivoSeleccionado.value = file;
  archivoNombre.value = file?.name || '';
  archivoEnviado.value = false;
  mensaje.value = '';
};

const cargarEstado = async () => {
  if (!idVet) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/veterinaria/${idVet}`);
    if (!response.ok) return;

    const data = await response.json();
    estadoVerificacion.value = normalizarEstado(data.estado_verificacion);
    motivoRechazo.value = data.documento_verificacion_rechazo || '';
    archivoNombre.value = data.documento_verificacion_nombre || archivoNombre.value || '';
    archivoEnviado.value = estadoVerificacion.value === 'pendiente';

    const sessionUser = JSON.parse(sessionStorage.getItem('migo_user') || 'null');
    if (sessionUser) {
      sessionUser.estado_verificacion = estadoVerificacion.value;
      sessionUser.documento_verificacion_nombre = data.documento_verificacion_nombre || null;
      sessionStorage.setItem('migo_user', JSON.stringify(sessionUser));
    }
  } catch (error) {
    mostrarMensaje('No se pudo cargar el estado de verificación.', 'error');
  }
};

const enviarDocumento = async () => {
  if (!archivoSeleccionado.value) {
    mostrarMensaje('Selecciona un archivo antes de enviar.', 'error');
    return;
  }

  const error = validarArchivo(archivoSeleccionado.value);
  if (error) {
    mostrarMensaje(error, 'error');
    return;
  }

  cargando.value = true;
  try {
    const formData = new FormData();
    formData.append('documento', archivoSeleccionado.value);

    const response = await fetch(`${API_BASE_URL}/api/veterinarias/${idVet}/verificacion`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.error || 'No se pudo enviar el documento');
    }

    estadoVerificacion.value = 'pendiente';
    archivoEnviado.value = true;
    archivoNombre.value = data.documento_verificacion_nombre || archivoSeleccionado.value.name;
    motivoRechazo.value = '';
    archivoSeleccionado.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }

    const sessionUser = JSON.parse(sessionStorage.getItem('migo_user') || 'null');
    if (sessionUser) {
      sessionUser.estado_verificacion = 'pendiente';
      sessionUser.documento_verificacion_nombre = archivoNombre.value;
      sessionStorage.setItem('migo_user', JSON.stringify(sessionUser));
    }

    mostrarMensaje('Documento enviado correctamente. Queda en revisión.', 'success');
  } catch (error) {
    mostrarMensaje(error.message || 'No se pudo enviar el documento.', 'error');
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarEstado();
});
</script>

<style scoped src="./ScreenVerificacionVet.css"></style>
