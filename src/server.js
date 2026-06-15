import express from 'express';
import mysql from 'mysql2';
import cors from 'cors'; 
import multer from 'multer';

//**CONEXION A LA BASE DE DATOS */
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'migo_db'
});

//**INICIO DE SESION DE USUARIO */
app.post('/api/login/login', (req, res) => {
    const { correo, contrasena } = req.body;
    const sql = 'SELECT id_usuario, nombre FROM usuarios WHERE correo = ? AND contrasena = ?';
    db.query(sql, [correo, contrasena], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error de servidor' });
        if (results.length > 0) res.json(results[0]);
        else res.status(401).json({ message: 'Credenciales incorrectas' });
    });
});

//**OBTENCION DE COLONIAS*/
app.get('/api/colonias/colonias', (req, res) => {
    db.query('SELECT * FROM colonias', (err, results) => { 
        if(err) return res.status(500).json({error: err.message});
        res.json(results); 
    });
});


//**OBTENCION DE ESPECIES */
app.get('/api/especies/especies', (req, res) => {
    db.query('SELECT * FROM especies', (err, results) => { 
        if(err) return res.status(500).json({error: err.message});
        res.json(results); 
    });
});

//**OBTENCION DE TIPOS DE PUBLICACIONES */
app.get('/api/tipos_publi/tipos_publi', (req, res) => {
    db.query('SELECT * FROM tipos_publi', (err, results) => { 
        if(err) return res.status(500).json({error: err.message});
        res.json(results); 
    });
});

//**OBTENER PUBLICACIONES (Para el Dashboard) */
app.get('/api/publicaciones/publicaciones', (req, res) => {
    const sql = 'SELECT * FROM publicaciones ORDER BY fecha_publi DESC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("--- ERROR FATAL EN SQL ---");
            console.error(err);
            return res.status(500).json({ message: 'Error en BD: ' + err.sqlMessage });
        }
        res.json(results);
    });
});

//**OBTENCIÓN DE PUBLICACIONES */
app.get('/api/publicacione2/publicaciones2', (req, res) => {
    const sql = `
        SELECT p.id, p.nombre, p.descripcion, p.imagen, 
               c.nombre_colonia, u.nombre
        FROM publicaciones2 p
        LEFT JOIN colonias c ON p.id_colonia = c.id_colonia
        LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener publicaciones:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

//**OBTENCION DE VETERINARIOS */
app.get('/api/veterinarios/veterinarios', (req, res) => {
    const sql = `
        SELECT v.id, v.nombre, v.descripcion, v.imagen, c.nombre_colonia
        FROM veterinarios v
        LEFT JOIN colonias c ON v.id_colonia = c.id_colonia
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


//**VERIFICACION DE CONEXION A LA DATABASE */
app.listen(4000, () => console.log('Conectado a la base de datos Migo  :)'));