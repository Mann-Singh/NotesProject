require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); //loads express.js framework for building web applications
const cors = require('cors'); //Lets react app talk to server
const Database = require('better-sqlite3'); // Initialize the database connection

const app = express(); //Creates new Express application instance
const PORT = process.env.PORT || 5000; //Checks for PORT in .env if not found defaults to 5000

//middlware- bridge between applications, manages flow between front and back end
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests and puts the parsed data in req.body

//database
const db = new Database('database.db'); // Connects to SQLite database file named 'database.db'

db.prepare(`
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run(); // Creates notes db, cols: id, title, content, created_at

//test route
app.get('/', (req, res) => {
    res.send('API is running');
}); // confrims server is running by sending 'API is running' when root URL is accessed

//restructure here ---------------------------------------------------------------------------------------------
app.post('/auth/signup')

app.post('/auth/login')

app.get('/boards')

app.post('/boards')

app.get('/boards/:id')

app.get('/boards/:id/notes')

app.post('/boards/:id/notes')

//restructured above -------------------------------------------------------------------------------------------------

//gets all notes
app.get('/notes', (req, res) => {
    const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
    res.json(notes);
}); // Retrieves all notes from the database, ordered by creation date, and sends them as JSON response

//create note
app.post('/notes', (req, res) => {
    const { title, content } = req.body; // Extracts title and content from the request body
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const stmt = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)');
    const result = stmt.run(title, content);

    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newNote);
}); // Inserts a new note into the database with the provided title and content, and returns an error if either is missing
app.listen(PORT, () => {
    console.log (`Server is running on port ${PORT}`);
});