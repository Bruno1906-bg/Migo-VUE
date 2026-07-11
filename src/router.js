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

//**RUTAS ADMIN */
import ScreenDashboardAdmin from './componentsAdmin/ScreenDashboardAdmin/ScreenDashboardAdmin.vue'
import ScreenAdminPublicaciones from './componentsAdmin/ScreenAdminPublicaciones/ScreenAdminPublicaciones.vue'
import ScreenAdminUsuarios from './componentsAdmin/ScreenAdminUsuarios/ScreenAdminUsuarios.vue'

const roleHomeRoutes = {
  usuario: '/dashboard',
  veterinario: '/dashboardvet',
  administrador: '/dashboardadmin'
};

const loginRoutesByRole = {
  usuario: '/login',
  veterinario: '/loginvet',
  administrador: '/login'
};

const getSessionUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('migo_user') || 'null');
  } catch (error) {
    return null;
  }
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/dashboardvet', component: ScreenDashboardVet,
      meta: { roles: ['veterinario'] },
      children: [
        { path: '', component: ScreenMiNegocio },
        { path: 'resenas', component: ScreenResenasVet },
        { path: 'minegocio', component: ScreenMiNegocio },
        { path: 'ajustes-vet', component: ScreenAjustesVet }
      ]
    },
    {
      path:'/dashboardadmin', component: ScreenDashboardAdmin,
      meta: { roles: ['administrador'] },
      children: [
        { path: '', component: ScreenAdminPublicaciones },
        { path: 'administracionpublicaciones', component: ScreenAdminPublicaciones},
        { path: 'usuarios', component: ScreenAdminUsuarios}
      ]
    },
    
    { path: '/', component: ScreenLandingPage },
    { path: '/login', component: ScreenLogin },
    { path: '/crearcuenta', component: ScreenCrearCuenta },
    { path: '/dashboard', component: ScreenDashboard, meta: { roles: ['usuario'] } },
    { path: '/masinfopubli', component: ScreenMoreInfoPubli, meta: { roles: ['usuario'] } },
    { path: '/crearpublicacion', component: ScreenCrearPublicacion, meta: { roles: ['usuario'] } },
    { path: '/veterinarios', component: ScreenVeterinarios, meta: { roles: ['usuario'] } },
    { path: '/perfil', component: ScreenMiperfil, meta: { roles: ['usuario'] } },
    { path: '/ajustes', component: ScreenAjustes, meta: { roles: ['usuario'] } },
    { path: '/loginvet', component: ScreenLoginVet },
    { path: '/crearcuentavet', component: ScreenCrearCuentaVet },
    { path: '/masinfo', component: ScreenMoreInfo, meta: { roles: ['usuario'] } }
  ]
});

router.beforeEach((to) => {
  const requiredRoles = to.matched.reduce((roles, record) => {
    if (Array.isArray(record.meta?.roles)) {
      roles.push(...record.meta.roles);
    }
    return roles;
  }, []);

  if (requiredRoles.length === 0) {
    return true;
  }

  const currentUser = getSessionUser();

  if (!currentUser?.rol) {
    return loginRoutesByRole[requiredRoles[0]] || '/login';
  }

  if (!requiredRoles.includes(currentUser.rol)) {
    return roleHomeRoutes[currentUser.rol] || '/';
  }

  return true;
});

export default router;