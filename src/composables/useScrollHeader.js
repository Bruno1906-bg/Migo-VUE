import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useScrollHeader({ mobileBreakpoint = 768, threshold = 8 } = {}) {
  const isVisible = ref(true);

  let lastScrollY = 0;
  let ticking = false;

  const updateVisibility = () => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;

    if (window.innerWidth > mobileBreakpoint) {
      isVisible.value = true;
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY <= 0) {
      isVisible.value = true;
      lastScrollY = 0;
      return;
    }

    const delta = currentScrollY - lastScrollY;
    if (Math.abs(delta) < threshold) {
      return;
    }

    isVisible.value = delta < 0;
    lastScrollY = currentScrollY;
  };

  const onScroll = () => {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(() => {
      updateVisibility();
      ticking = false;
    });
  };

  const onResize = () => {
    if (window.innerWidth > mobileBreakpoint) {
      isVisible.value = true;
    }
    updateVisibility();
  };

  onMounted(() => {
    lastScrollY = window.scrollY || 0;
    updateVisibility();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  });

  return { isVisible };
}