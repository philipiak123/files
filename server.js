require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Konfiguracja bazy danych MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('Połączono z bazą danych MySQL');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'))); // Pliki statyczne

// Konfiguracja multer dla przesyłanych plików
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Endpoint GET - pobieranie danych z bazy danych
app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM data_table';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoint POST - dodawanie danych i przesyłanie plików
app.post('/api/data', upload.single('file'), (req, res) => {
  const { name, value } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;  // Ścieżka URL do pliku

  if (!name || !value) {
    return res.status(400).json({ error: 'Brak wymaganych danych' });
  }

  const query = 'INSERT INTO data_table (name, value, file_url) VALUES (?, ?, ?)';
  db.query(query, [name, value, filePath], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dane zapisane pomyślnie', id: results.insertId, fileUrl: filePath });
  });
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
