const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    // extract username and check for duplicates or valid input
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existing) {
        return res.status(400).json({ error: 'Username already taken'});
    }

    //hashes password and stores that into db
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const result = stmt.run(username, hashedPassword);

    res.status(201).json({ message: 'User created successfuly'});
});

router.post('/login', async (req, res) => {
    // extracts user & password to check if req is valid
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    // takes user's row from db to extract hashed password
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    //check if username exists
    if (!user) {
        return res.status(401).json({error: 'Invalid username'});
    }
    // compares user's plaintext with hashed password
    const match = await bcrypt.compare(password, user.password);
    // make a token to authenticate user on frontend
    const token = jwt.sign({id: user.id, username: user.username }, process.env.JWT_SECRET);
    //sends reponse to frontend with users id,username, and token
    if (match) {
        return res.json({ token, user: { id: user.id, username: user.username } }); 
    }
    else {
        return res.status(401).json({error: 'Invalid username or password'});
    }
    });

module.exports = router;