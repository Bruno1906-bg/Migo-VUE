const API_BASE_URL = 'http://localhost:4000/api';

/**
 * FUNCION PARA LAS PETICIONES DEL BACKEND
 */
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

/**
 * INICIO DE SESION
 */
export const loginUsuario = async (correo, contrasena) => {
    return await fetchJson(`${API_BASE_URL}/login/login`, {
        method: 'POST',
        body: JSON.stringify({ correo, contrasena }),
    });
};

/**
 * REGISTRO DE USUARIO
 */
export const registrarUsuario = async (datos) => {
    return await fetchJson(`${API_BASE_URL}/usuarios/usuarios`, {
        method: 'POST',
        body: JSON.stringify(datos),
    });
};

/**
 * COLONIAS DEL FORMULARIO
 */
export const obtenerColonias = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/colonias/colonias`);
        return await response.json();
    } catch (error) {
        console.error("No se pudieron obtener las colonias: ", error);
        return [];
    }
};