<template>
  <div class="app-shell">
    <div class="app-shell__overlay" :class="{ active: menuOpen }" @click="closeMenu"></div>

    <aside class="app-shell__sidebar" :class="{ open: menuOpen }">
      <div class="app-shell__sidebar-logo">
        <img src="../../assets/LogoMigo.jpeg" alt="MIGO Logo">
      </div>

      <nav class="app-shell__sidebar-menu">
        <router-link
          v-for="item in resolvedMenuItems"
          :key="item.to"
          :to="item.to"
          class="app-shell__menu-item"
          :class="[
            { active: activeMenu === item.key },
            item.variant ? `app-shell__menu-item--${item.variant}` : '',
            item.verificationState ? `app-shell__menu-item--verification-${item.verificationState}` : ''
          ]"
          @click="closeMenu"
        >
          <span v-if="item.icon === 'check'" class="app-shell__menu-item-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M9.55 16.94 4.8 12.2l1.42-1.41 3.33 3.33 8.21-8.21 1.41 1.41z" />
            </svg>
          </span>
          <span class="app-shell__menu-item-label">{{ item.label }}</span>
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
  },
  menuItems: {
    type: Array,
    default: null
  }
});

const emit = defineEmits(['logout']);
const router = useRouter();
const menuOpen = ref(false);
const savedBodyOverflow = ref('');
const defaultMenuItems = [
  { key: 'dashboard', to: '/dashboard', label: '° Publicaciones' },
  { key: 'perfil', to: '/perfil', label: '° Mi Perfil' },
  { key: 'veterinarios', to: '/veterinarios', label: '° Veterinarios' }
];

const resolvedMenuItems = computed(() => (
  Array.isArray(props.menuItems) && props.menuItems.length > 0 ? props.menuItems : defaultMenuItems
));

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
  closeMenu();
  emit('logout');
  router.push(props.logoutTo);
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
  updateBodyScroll(menuOpen.value);
};

const closeMenu = () => {
  menuOpen.value = false;
  updateBodyScroll(false);
};
</script>

<style scoped src="./AppShell.css"></style>