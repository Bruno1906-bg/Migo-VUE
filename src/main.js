import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

//**RUTAS QUE EL APP SEGUIRA */
const app = createApp(App);
app.use(router); 
app.mount('#app');