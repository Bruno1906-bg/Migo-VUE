export const obtenerUsuarios = async () => {
const response = await fetch('https://migobackenddeploy-production.up.railway.app/api/usuarios');
  return await response.json();
};

export const eliminarUsuarioAdmin = async (idUsuario) => {
const response = await fetch(`https://migobackenddeploy-production.up.railway.app/api/usuarios/${idUsuario}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'No se pudo eliminar el usuario');
  }
};