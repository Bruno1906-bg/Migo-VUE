const API_URL = 'http://localhost:4000/api';

/**
 * Función para registrar una nueva publicación en la base de datos.
 * @param {Object} datos - Objeto con los datos del formulario (tipo, nombre_pet, etc.).
 */
export const registrarPublicacion = async (datos) => {
    const formData = new FormData();
    
    for (const key in datos) {
        if (datos[key] !== null) {
            formData.append(key, datos[key]);
        }
    }

    try {
        const response = await fetch(`${API_URL}/publicaciones`, {
            method: 'POST',
            body: formData, 
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error al guardar la publicación');
        }

        return result; 
    } catch (error) {
        console.error("Error en registrarPublicacion:", error);
        throw error; 
    }
};

/**
 * FUNCION PARA COLONIAS EN EL SELECTOR
 */
export const obtenerColonias = async () => {
    const res = await fetch('http://localhost:4000/api/colonias/colonias');
    return await res.json();
};

//**FUNCION PARA OBTENER ESPECIES EN EL SELECTOR */
export const obtenerEspecies = async () => {
    const res = await fetch('http://localhost:4000/api/especies/especies');
    return await res.json();
};

//**FUNCION PARA OBTENER TIPOS DE PUBLICACIONES EN EL SELECTOR */
export const obtenerTipopubli = async () => {
    const res = await fetch('http://localhost:4000/api/tipos_publi/tipos_publi');
    return await res.json();
};