//**CREACION DE RUTAS */
import { createRouter, createWebHistory } from 'vue-router'
import ScreenLandingPage from './components/ScreenLandingPage/ScreenLandingPage.vue'
import ScreenDashboard from './components/ScreenDashboard/ScreenDashboard.vue'
import ScreenLogin from './components/ScreenLogin/ScreenLogin.vue'
import ScreenCrearCuenta from './components/ScreenCrearCuenta/ScreenCrearCuenta.vue'
import ScreenCrearPublicacion from './components/ScreenCrearPublicacion/ScreenCrearPublicacion.vue'
import ScreenVeterinarios from './components/ScreenVeterinarios/ScreenVeterinarios.vue'


//**NAVEGACION DE LA PAGINA WEB */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ScreenLandingPage },
    {path: '/login', component: ScreenLogin},
    {path: '/crearcuenta', component: ScreenCrearCuenta},
    { path: '/dashboard', component: ScreenDashboard },
    {path: '/crearpublicacion', component: ScreenCrearPublicacion},
    {path: '/veterinarios', component: ScreenVeterinarios}
  ]
});

export default router;