//**DEPENDENCIAS INSTALADAS PARA EL FUNCIONAMIENTO DE LA CONEXION */
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());


//**CONEXION A LA BASE DE DATOS  */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'migo_db'
});



//**INICIO DE SESION VALIDACION DE USUARIO Y CORREO */
app.post('/api/login/login', (req, res) => {
    const { correo, contrasena } = req.body;
    const sql = 'SELECT id_usuario, nombre FROM usuarios WHERE correo = ? AND contrasena = ?';
    
    db.query(sql, [correo, contrasena], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error de servidor :b' });
        if (results.length > 0) {
            res.json(results[0]); 
        } else {
            res.status(401).json({ message: 'Correo o contraseña incorrectos :b' });
        }
    });
});

//**REGISTRO DE USUARIOS */
app.post('/api/usuarios/usuarios', (req, res) => {
    const { nombre, apellido, correo, contrasena, telefono, direccion, id_colonia } = req.body;
    const sql = 'INSERT INTO usuarios (nombre, apellido, correo, contrasena, telefono, direccion, id_colonia, rol) VALUES (?, ?, ?, ?, ?, ?, ?, "usuario")';
    
    db.query(sql, [nombre, apellido, correo, contrasena, telefono, direccion, id_colonia], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error en el registro :b' + err.message });
        res.status(201).json({ message: 'Usuario registrado exitosamente :D' });
    });
});

//**OBTENCION DE COLONIAS DESDE LA BASE DE  DATOS */
app.get('/api/colonias/colonias', (req, res) => {
    db.query('SELECT * FROM colonias', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener colonias' });
        res.json(results);
    });
});


app.listen(4000, () => console.log('Se conecto de forma exitosa a la base de datos de Migo'));