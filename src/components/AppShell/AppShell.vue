<template>
  <div class="app-shell">
    <div class="app-shell__overlay" :class="{ active: menuOpen }" @click="menuOpen = false"></div>

    <aside class="app-shell__sidebar" :class="{ open: menuOpen }">
      <div class="app-shell__sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>

      <nav class="app-shell__sidebar-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="app-shell__menu-item"
          :class="{ active: activeMenu === item.key }"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="app-shell__sidebar-footer">
        <button class="app-shell__logout" type="button" @click="handleLogout">
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <div class="app-shell__content">
      <header
        class="app-shell__topbar"
        :class="[
          { 'app-shell__topbar--hidden': !topBarVisible, 'app-shell__topbar--desktop-hidden': !showDesktopTopBar },
          topBarClass
        ]"
      >
        <button class="app-shell__hamburger" type="button" @click="toggleMenu" aria-label="Abrir menú">
          <span></span><span></span><span></span>
        </button>

        <div class="app-shell__topbar-slot">
          <slot name="header" />
        </div>
      </header>

      <main :class="['app-shell__main', mainClass]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useScrollHeader } from '../../composables/useScrollHeader';

const props = defineProps({
  activeMenu: {
    type: String,
    default: 'dashboard'
  },
  hideTopBarOnScroll: {
    type: Boolean,
    default: false
  },
  showDesktopTopBar: {
    type: Boolean,
    default: true
  },
  topBarClass: {
    type: [String, Array, Object],
    default: ''
  },
  mainClass: {
    type: [String, Array, Object],
    default: ''
  },
  logoutTo: {
    type: String,
    default: '/'
  }
});

const emit = defineEmits(['logout']);
const router = useRouter();
const menuOpen = ref(false);
const savedBodyOverflow = ref('');
const menuItems = [
  { key: 'dashboard', to: '/dashboard', label: '° Publicaciones' },
  { key: 'perfil', to: '/perfil', label: '° Mi Perfil' },
  { key: 'veterinarios', to: '/veterinarios', label: '° Veterinarios' },
  { key: 'ajustes', to: '/ajustes', label: '° Ajustes' }
];

const { isVisible } = useScrollHeader();
const topBarVisible = computed(() => (props.hideTopBarOnScroll ? isVisible.value : true));

const updateBodyScroll = (isOpen) => {
  if (typeof document === 'undefined') return;

  if (isOpen) {
    savedBodyOverflow.value = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = savedBodyOverflow.value;
  }
};

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = savedBodyOverflow.value;
});

const handleLogout = () => {
  updateBodyScroll(false);
  emit('logout');
  menuOpen.value = false;
  router.push(props.logoutTo);
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
  updateBodyScroll(menuOpen.value);
};
</script>

<style scoped src="./AppShell.css"></style>