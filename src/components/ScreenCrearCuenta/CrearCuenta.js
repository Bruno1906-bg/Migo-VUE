const API_BASE_URL = 'https://migobackenddeploy-production.up.railway.app/api';

/**
 * Función para obtener colonias desde la BD real
 */
export const obtenerColonias = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/colonias`);
        if (!response.ok) throw new Error('Error al cargar colonias');
        return await response.json();
    } catch (error) {
        console.error("Error al obtener colonias:", error);
        return [];
    }
};

/**
 * Función para registrar un usuario en la BD real
 */
export const registrarUsuario = async (datos) => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: datos.nombre,
            apellido: datos.apellido,
            correo: datos.correo,
            contrasena: datos.contrasena, 
            telefono: datos.telefono,
            direccion: datos.direccion,
            id_colonia: datos.id_colonia,
            rol: 'usuario'
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Error al registrar usuario');
    }
    return result;
};

/**
 * Función para autenticar al usuario contra la BD real
 */
export const loginUsuario = async (correo, contrasena) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Error en las credenciales');
    }
    return result; 
};
