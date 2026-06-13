export const obtenerPublicaciones = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/publicaciones/publicaciones');
        if (!response.ok) throw new Error('Error al obtener datos');
        return await response.json();
    } catch (error) {
        console.error("Error en DashboardService:", error);
        return [];
    }
};