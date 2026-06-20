const API_BASE_URL = 'http://localhost:4000/api';

const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Error en la operación');
    }
    return result;
};


export const loginUsuario = async (correo, contrasena) => {
    try {
        return await fetchJson(`${API_BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({ correo, contrasena }),
        });
    } catch (error) {
        // Manejo de errores específicos
        if (error.message.includes("No tienes acceso")) {
            throw new Error("Este correo pertenece a un veterinario, no a un usuario.");
        }
        throw error;
    }
};



export const obtenerColonias = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/colonias`);
        if (!response.ok) throw new Error('Error al obtener colonias');
        return await response.json();
    } catch (error) {
        console.error("No se pudieron obtener las colonias: ", error);
        return [];
    }
};
