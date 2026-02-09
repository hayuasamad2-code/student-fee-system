const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET messages
router.get('/', verifyToken, (req,res)=>{
    db.query(
        `SELECT m.id, u.name, m.message, m.created_at FROM messages m 
         JOIN users u ON m.user_id = u.id ORDER BY m.created_at ASC`,
        (err,result)=>{
            if(err) return res.status(500).send(err);
            res.send(result);
        }
    );
});

// POST message
router.post('/', verifyToken, (req,res)=>{
    const { message } = req.body;
    db.query("INSERT INTO messages (user_id, message) VALUES (?,?)", [req.user.id, message], (err,result)=>{
        if(err) return res.status(500).send(err);
        res.send({ message: "Message sent" });
    });
});

module.exports = router;
