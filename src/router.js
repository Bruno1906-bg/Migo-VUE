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
import ScreenAjustes from './components/ScreenAjustes/ScreenAjustes.vue'
import ScreenMoreInfo from './components/ScreenMoreInfo/ScreenMoreInfo.vue'
import ScreenMoreInfoPubli from './components/ScreenMoreInfoPubli/ScreenMoreInfoPubli.vue'

//**RUTAS VETERINARIA */
import ScreenLoginVet from './componentsVeterinaria/ScreenLoginVeterinaria/ScreenLoginVet.vue'
import ScreenDashboardVet from './componentsVeterinaria/ScreenDashboardVeterinaria/ScreenDashboardVet.vue'
import ScreenCrearCuentaVet from './componentsVeterinaria/ScreenCrearCuentaVet.vue/ScreenCrearCuentaVet.vue'
import ScreenResenasVet from './componentsVeterinaria/ScreenResenasVeterinaria/ScreenResenasVet.vue'
import ScreenMiNegocio from './componentsVeterinaria/ScreenMiNegocio/ScreenMiNegocio.vue'
import ScreenAjustesVet from './componentsVeterinaria/ScreenAjustesVet/ScreenAjustesVet.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/dashboardvet', component: ScreenDashboardVet,
      children: [
        { path: '', component: ScreenMiNegocio },
        { path: 'resenas', component: ScreenResenasVet },
        { path: 'minegocio', component: ScreenMiNegocio },
        { path: 'ajustes-vet', component: ScreenAjustesVet }

      ]
    },
    { path: '/', component: ScreenLandingPage },
    { path: '/login', component: ScreenLogin },
    { path: '/crearcuenta', component: ScreenCrearCuenta },
    { path: '/dashboard', component: ScreenDashboard },
    { path: '/masinfopubli', component: ScreenMoreInfoPubli },
    { path: '/crearpublicacion', component: ScreenCrearPublicacion },
    { path: '/veterinarios', component: ScreenVeterinarios },
    { path: '/perfil', component: ScreenMiperfil },
    { path: '/ajustes', component: ScreenAjustes },
    { path: '/loginvet', component: ScreenLoginVet },
    { path: '/crearcuentavet', component: ScreenCrearCuentaVet },
    { path: '/masinfo', component: ScreenMoreInfo }
  ]
});

export default router;