const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
    //extract token from req header and check if exists
    const token = req.headers['authorzation'];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    //check if valid token, if error give error, if valid, place decoded user into req.user
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });
        req.user = user;
        //continue routing
        next();
    })
}
const verifyBoardOwnership = (req, res, next) => {
    const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
    if (!board) {
        return res.status(404).json({ error: 'Board not found' });
    }
    if (board.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    req.board = board;
    next();
}
router.get('/', authenticateToken, (req, res) => {
    const boards = db.prepare('SELECT * FROM boards WHERE user_id = ?').all(req.user.id);
    res.json(boards)
});

router.post('/', authenticateToken, (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Board must have a title' });
    }

    const stmt = db.prepare('INSERT INTO boards (title, user_id) VALUES (?, ?)');
    const result = stmt.run(title, req.user.id);

    const newBoard = db.prepare('SELECT * FROM boards WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newBoard);

});

router.get('/:id/', authenticateToken, verifyBoardOwnership, (req, res) => {
    return res.json(board);
});

router.get('/:id/notes', authenticateToken, verifyBoardOwnership, (req, res) => {
    const notes = db.prepare('SELECT * FROM notes WHERE board_id = ?').all(req.params.id);
    return res.json(notes); 

});

router.post('/:id/notes', authenticateToken, verifyBoardOwnership, (req, res) => {
    const { title, content, attachment } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    const stmt = db.prepare('INSERT INTO notes (board_id, title, content, attachment, user_id) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(req.params.id, title, content, attachment, req.user.id);
    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newNote);
    
});

