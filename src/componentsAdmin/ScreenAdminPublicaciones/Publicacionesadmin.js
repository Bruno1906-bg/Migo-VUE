const API_BASE_URL = 'http://localhost:4000/api';

export const obtenerPublicaciones = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/publicaciones`);
        if (!response.ok) throw new Error('Error al obtener datos');
        return await response.json();
    } catch (error) {
        console.error("Error en AdminDashboardService:", error);
        return [];
    }
};

export const eliminarPublicacionAdmin = async (idPubli, idAdmin) => {
    const response = await fetch(`${API_BASE_URL}/admin/publicaciones/${idPubli}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_admin: idAdmin })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar publicación');
    return data;
};

export const reportarUsuario = async (idUsuarioReportado, idAdmin, motivo, nombrePublicacion) => {
    const response = await fetch(`${API_BASE_URL}/admin/reportar-usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_usuario_reportado: idUsuarioReportado,
            id_admin: idAdmin,
            motivo,
            nombre_publicacion: nombrePublicacion
        })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Error al reportar usuario');
    return data;
};