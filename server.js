const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

// Inicjalizacja aplikacji
const app = express();
const PORT = process.env.PORT || 3000;

// Konfiguracja połączenia z bazą danych MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Połączenie z bazą danych
db.connect((err) => {
    if (err) {
        console.error('Could not connect to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Ustawienia multer do przesyłania plików
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Używamy timestamp jako unikalnego identyfikatora
    },
});

const upload = multer({ storage: storage });

// Endpoint do przesyłania plików
app.post('/upload', upload.single('file'), (req, res) => {
    const fileUrl = `https://${req.headers.host}/uploads/${req.file.filename}`;

    // Zapisz URL pliku w bazie danych
    const query = 'INSERT INTO your_table (file_url) VALUES (?)';
    db.query(query, [fileUrl], (err, results) => {
        if (err) {
            console.error('Database insert error:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).json({ fileUrl });
    });
});

// Statyczne serwowanie plików
app.use('/uploads', express.static('uploads'));

// Uruchom serwer
app.listen(PORT, () => {
    console.log(`Server is running on port ${POR
                                             T}`);
});
