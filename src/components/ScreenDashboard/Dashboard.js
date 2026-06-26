const API_URL = 'https://migobackenddeploy-production.up.railway.app/api';

export const obtenerPublicaciones = async () => {
    try {
        const response = await fetch(`${API_URL}/publicaciones`);
        if (!response.ok) throw new Error('Error al obtener datos');
        return await response.json();
    } catch (error) {
        console.error("Error en DashboardService:", error);
        return [];
    }
};