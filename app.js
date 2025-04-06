// Importar las dependencias necesarias
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Configuración para permitir recibir datos en formato JSON
app.use(express.json());

// Conexión a la base de datos SQLite
function db_connection() {
  const db = new sqlite3.Database('students.sqlite', (err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err.message);
    } else {
      console.log('Conectado a la base de datos SQLite');
    }
  });
  return db;
}

// Crear la base de datos y la tabla si no existen
function createDatabase() {
  const db = db_connection();
  const createTableQuery = `CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INTEGER
  )`;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error al crear la tabla:', err.message);
    } else {
      console.log('Tabla "students" creada o ya existe.');
    }
  });
}

// Llamar a la función para crear la base de datos al iniciar la app
createDatabase();

// Ruta para obtener todos los estudiantes
app.get('/students', (req, res) => {
  const db = db_connection();
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Ruta para agregar un estudiante
app.post('/students', (req, res) => {
  const { firstname, lastname, gender, age } = req.body;
  const db = db_connection();
  const insertQuery = 'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)';

  db.run(insertQuery, [firstname, lastname, gender, age], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({
      id: this.lastID,
      firstname,
      lastname,
      gender,
      age
    });
  });
});

// Ruta para obtener un solo estudiante por ID
app.get('/students/:id', (req, res) => {
  const { id } = req.params;
  const db = db_connection();
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'Estudiante no encontrado' });
    }
  });
});

// Ruta para actualizar un estudiante por ID
app.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, gender, age } = req.body;
  const db = db_connection();
  const updateQuery = 'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?';

  db.run(updateQuery, [firstname, lastname, gender, age, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id,
      firstname,
      lastname,
      gender,
      age
    });
  });
});

// Ruta para eliminar un estudiante por ID
app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  const db = db_connection();
  const deleteQuery = 'DELETE FROM students WHERE id = ?';

  db.run(deleteQuery, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ message: `Estudiante con ID ${id} eliminado` });
  });
});

// Iniciar el servidor en el puerto 3000 (puedes cambiarlo si lo deseas)
app.listen(3000, () => {
  console.log('Servidor corriendo en http://0.0.0.0:3000');
});
