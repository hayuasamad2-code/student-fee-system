const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret, verifyToken } = require('../middleware/auth');

// LOGIN
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username=?", [username], async (err, result) => {
        if(err) return res.status(500).send(err);
        if(result.length === 0) return res.status(400).send({ message: "User not found" });

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(400).send({ message: "Incorrect password" });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '1h' });
        res.send({ token });
    });
});

// GET PROFILE
router.get('/me', verifyToken, (req, res) => {
    db.query("SELECT id, name, username, role FROM users WHERE id=?", [req.user.id], (err, result) => {
        if(err) return res.status(500).send(err);
        res.send(result[0]);
    });
});

module.exports = router;
