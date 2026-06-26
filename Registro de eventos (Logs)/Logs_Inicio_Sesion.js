// Función para registrar logs de login fallido
function registrarLogLoginFallido(correo, detalle) {
    const sql = "INSERT INTO logs (correo, accion, detalle) VALUES (?, 'LOGIN_FALLIDO', ?)";
    db.query(sql, [correo, detalle], (err) => {
        if (err) console.error("Error guardando log:", err.message);
    });
}


//Integracion de endpoints

////Usuario////
app.post('/api/login', (req, res) => {
  const { correo, contrasena } = req.body;

  const sql = `
      SELECT id_usuario, nombre, rol 
      FROM usuarios 
      WHERE correo = ? AND contrasena = ?
  `;
  db.query(sql, [correo, contrasena], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error de servidor' });

    if (results.length > 0) {
      const usuario = results[0];
      if (usuario.rol !== 'usuario') {
        registrarLogLoginFallido(correo, "Intento de login como usuario sin rol válido");
        return res.status(403).json({ message: 'No tienes acceso como usuario' });
      }
      res.json(usuario);
    } else {
      registrarLogLoginFallido(correo, "Credenciales incorrectas en login de usuario");
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  });
});

////Veterinario////
app.post('/api/login-vet', (req, res) => {
  const { correo, contrasena } = req.body;

  const sql = `
      SELECT u.id_usuario, u.nombre, u.rol, v.id_vet 
      FROM usuarios u
      LEFT JOIN veterinarias v ON u.id_usuario = v.id_usuario
      WHERE u.correo = ? AND u.contrasena = ?
  `;
  db.query(sql, [correo, contrasena], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error de servidor' });

    if (results.length > 0) {
      const usuario = results[0];
      if (usuario.rol !== 'veterinario') {
        registrarLogLoginFallido(correo, "Intento de login como veterinario sin rol válido");
        return res.status(403).json({ message: 'No tienes acceso como veterinario' });
      }
      res.json({ success: true, usuario });
    } else {
      registrarLogLoginFallido(correo, "Credenciales inválidas en login de veterinario");
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  });
});
