export const loginVeterinario = async (correo, contrasena) => {
const response = await fetch('http://localhost:4000/api/login-vet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al iniciar sesión");
    return data.usuario;
};