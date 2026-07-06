export const obtenerPublicaciones = async () => {
    try {
const response = await fetch('https://migobackenddeploy-production.up.railway.app/api/publicaciones');
        if (!response.ok) throw new Error('Error al obtener datos');
        return await response.json();
    } catch (error) {
        console.error("Error en DashboardService:", error);
        return [];
    }
};
