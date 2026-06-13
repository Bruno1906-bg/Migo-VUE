import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import multer from 'multer';

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

//**INICIO DE SESION */
app.post('/api/login/login', (req, res) => {
    const { correo, contrasena } = req.body;
    const sql = 'SELECT id_usuario, nombre FROM usuarios WHERE correo = ? AND contrasena = ?';
    db.query(sql, [correo, contrasena], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error de servidor' });
        if (results.length > 0) res.json(results[0]);
        else res.status(401).json({ message: 'Credenciales incorrectas' });
    });
});

//**CATALOGOS */
app.get('/api/colonias/colonias', (req, res) => {
    db.query('SELECT * FROM colonias', (err, results) => { 
        if(err) return res.status(500).json({error: err.message});
        res.json(results); 
    });
});

app.get('/api/especies/especies', (req, res) => {
    db.query('SELECT * FROM especies', (err, results) => { 
        if(err) return res.status(500).json({error: err.message});
        res.json(results); 
    });
});

app.get('/api/tipos_publi/tipos_publi', (req, res) => {
    db.query('SELECT * FROM tipos_publi', (err, results) => { 
        if(err) return res.status(500).json({error: err.message});
        res.json(results); 
    });
});

//**OBTENER PUBLICACIONES (Para el Dashboard) */
app.get('/api/publicaciones/publicaciones', (req, res) => {
    // Consulta simplificada para descartar errores de JOIN
    const sql = 'SELECT * FROM publicaciones ORDER BY fecha_publi DESC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("--- ERROR FATAL EN SQL ---");
            console.error(err); // ESTO TE DIRÁ EXACTAMENTE QUÉ PASA
            return res.status(500).json({ message: 'Error en BD: ' + err.sqlMessage });
        }
        res.json(results);
    });
});

//**CREACION DE PUBLICACION CON FOTO */
app.post('/api/publicaciones/crear', upload.single('foto'), (req, res) => {
    const { id_usuario, id_colonia, id_especie, id_tipo, id_estado, nombre_pet, descripcion } = req.body;
    
    if (!id_usuario || !id_colonia || !id_especie || !id_tipo || !nombre_pet || !descripcion) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const sql = `INSERT INTO publicaciones (id_usuario, id_colonia, id_especie, id_tipo, id_estado, nombre_pet, descripcion, fecha_publi) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
    
    db.query(sql, [id_usuario, id_colonia, id_especie, id_tipo, id_estado, nombre_pet, descripcion], (err, result) => {
        if (err) {
            console.error("Error SQL:", err);
            return res.status(500).json({ message: 'Error en BD: ' + err.sqlMessage });
        }

        if (req.file) {
            db.query('INSERT INTO fotos_publi (id_publi, nombre_archivo) VALUES (?, ?)', 
                     [result.insertId, req.file.filename]);
        }

        res.status(201).json({ message: 'Publicación creada', id: result.insertId });
    });
});

app.listen(4000, () => console.log('Servidor Migo corriendo en puerto 4000'));