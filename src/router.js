//**CREACION DE RUTAS*/
//**RUTAS DE USUARIO */
import { createRouter, createWebHistory } from 'vue-router'
import ScreenLandingPage from './components/ScreenLandingPage/ScreenLandingPage.vue'
import ScreenDashboard from './components/ScreenDashboard/ScreenDashboard.vue'
import ScreenCrearPublicacion from './components/ScreenCrearPublicacion/ScreenCrearPublicacion.vue'
import ScreenLogin from './components/ScreenLogin/ScreenLogin.vue'
import ScreenCrearCuenta from './components/ScreenCrearCuenta/ScreenCrearCuenta.vue'
import ScreenVeterinarios from './components/ScreenVeterinarios/ScreenVeterinarios.vue'
import ScreenMiperfil from './components/ScreenMiperfil/ScreenMiperfil.vue'
import ScreenServicios from './components/ScreenServicios/ScreenServicios.vue'
import ScreenAjustes from './components/ScreenAjustes/ScreenAjustes.vue'
import ScreenDetalles from './components/ScreenDetalles/ScreenDetalles.vue'
import ScreenMoreInfo from './components/ScreenMoreInfo/ScreenMoreInfo.vue'
import ScreenMoreInfoPubli from './components/ScreenMoreInfoPubli/ScreenMoreInfoPubli.vue'

//**RUTAS VETERINARIA */
import ScreenLoginVet from './componentsVeterinaria/ScreenLoginVeterinaria/ScreenLoginVet.vue'
import ScreenDashboardVet from './componentsVeterinaria/ScreenDashboardVeterinaria/ScreenDashboardVet.vue'
import ScreenCrearCuentaVet from './componentsVeterinaria/ScreenCrearCuentaVet.vue/ScreenCrearCuentaVet.vue'
import ScreenResenasVet from './componentsVeterinaria/ScreenResenasVeterinaria/ScreenResenasVet.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/dashboardvet', component: ScreenDashboardVet,
    children: [
      {path: 'resenas', component: ScreenResenasVet}
    ]
  },     
    { path: '/', component: ScreenLandingPage },
    {path: '/login', component: ScreenLogin},
    {path: '/crearcuenta', component: ScreenCrearCuenta},
    { path: '/dashboard', component: ScreenDashboard },
    { path: '/masinfopubli', component: ScreenMoreInfoPubli },
    {path: '/crearpublicacion', component: ScreenCrearPublicacion},
    {path: '/veterinarios', component: ScreenVeterinarios},
    {path: '/detallesveterinaria', component: ScreenDetalles},
    {path: '/perfil', component: ScreenMiperfil},
    {path: '/servicios', component:  ScreenServicios},
    {path: '/ajustes', component: ScreenAjustes},
    {path: '/loginvet', component: ScreenLoginVet},
    {path: '/crearcuentavet', component: ScreenCrearCuentaVet},
    {path: '/masinfo', component: ScreenMoreInfo}
  ]
});

export default router;