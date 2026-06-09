//**CREACION DE RUTAS */
import { createRouter, createWebHistory } from 'vue-router'
import ScreenLandingPage from './components/ScreenLandingPage/ScreenLandingPage.vue'
import ScreenDashboard from './components/ScreenDashboard/ScreenDashboard.vue'
import ScreenLogin from './components/ScreenLogin/ScreenLogin.vue'
import ScreenCrearCuenta from './components/ScreenCrearCuenta/ScreenCrearCuenta.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ScreenLandingPage },
    {path: '/login', component: ScreenLogin},
    {path: '/crearcuenta', component: ScreenCrearCuenta},
    { path: '/dashboard', component: ScreenDashboard }
  ]
});

export default router;