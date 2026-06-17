const API_URL = 'http://localhost:4000/api';

export const registrarPublicacion = async (datos) => {
    try {
        const response = await fetch(`${API_URL}/publicaciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_usuario: datos.id_usuario,
                id_colonia: datos.id_colonia,
                id_especie: datos.id_especie,
                id_tipo: datos.id_tipo,
                id_estado: datos.id_estado,
                nombre_pet: datos.nombre_pet,
                descripcion: datos.descripcion
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Error al guardar la publicación');
        }

        if (datos.foto) {
            const formData = new FormData();
            formData.append('foto', datos.foto);

            const fotoResponse = await fetch(`${API_URL}/fotos/${result.id}`, {
                method: 'POST',
                body: formData,
            });

            const fotoResult = await fotoResponse.json();
            if (!fotoResponse.ok) {
                throw new Error(fotoResult.message || 'Error al subir la foto');
            }

            result.foto = fotoResult.ruta_imagen;
        }

        return result;
    } catch (error) {
        console.error("Error en registrarPublicacion:", error);
        throw error;
    }
};

export const obtenerColonias = async () => {
    const res = await fetch(`${API_URL}/colonias`);
    return await res.json();
};


export const obtenerEspecies = async () => {
    const res = await fetch(`${API_URL}/especies`);
    return await res.json();
};


export const obtenerTipopubli = async () => {
    const res = await fetch(`${API_URL}/tipos_publi`);
    return await res.json();
};
