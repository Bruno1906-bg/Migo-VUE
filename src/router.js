//**CREACION DE RUTAS*/
import { createRouter, createWebHistory } from 'vue-router'
//**SCREEN LANDING PAGE */
import ScreenLandingPage from './components/ScreenLandingPage/ScreenLandingPage.vue'

//**SCREEN PANEL PRINCIPAL */
import ScreenDashboard from './components/ScreenDashboard/ScreenDashboard.vue'

//**SCREEN CREAR PUBLICACION */
import ScreenCrearPublicacion from './components/ScreenCrearPublicacion/ScreenCrearPublicacion.vue'

//**SCREEN LOGIN */
import ScreenLogin from './components/ScreenLogin/ScreenLogin.vue'

//**SCREEN CREACION DE LA CUENTA */
import ScreenCrearCuenta from './components/ScreenCrearCuenta/ScreenCrearCuenta.vue'

//**SCREEN PANEL DE VETERINARIOS*/
import ScreenVeterinarios from './components/ScreenVeterinarios/ScreenVeterinarios.vue'

//**SCREEN MI PERFIL */
import ScreenMiperfil from './components/ScreenMiperfil/ScreenMiperfil.vue'

//**SCREEN PANEL DE OTROS SERVICIOS */
import ScreenServicios from './components/ScreenServicios/ScreenServicios.vue'

//**SCREEN VENTANA AJUSTES */
import ScreenAjustes from './components/ScreenAjustes/ScreenAjustes.vue'


//**NAVEGACION DE LA PAGINA WEB */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ScreenLandingPage },
    {path: '/login', component: ScreenLogin},
    {path: '/crearcuenta', component: ScreenCrearCuenta},
    { path: '/dashboard', component: ScreenDashboard },
    {path: '/crearpublicacion', component: ScreenCrearPublicacion},
    {path: '/veterinarios', component: ScreenVeterinarios},
    {path: '/perfil', component: ScreenMiperfil},
    {path: '/servicios', component:  ScreenServicios},
    {path: '/ajustes', component: ScreenAjustes}
  ]
});

export default router;