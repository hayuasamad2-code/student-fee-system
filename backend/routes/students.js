const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET all students
router.get('/', verifyToken, (req,res)=>{
    db.query("SELECT id, name, username, role FROM users WHERE role='student'", (err,result)=>{
        if(err) return res.status(500).send(err);
        res.send(result);
    });
});

// DELETE student
router.delete('/:id', verifyToken, (req,res)=>{
    const id = req.params.id;
    db.query("DELETE FROM users WHERE id=? AND role='student'", [id], (err,result)=>{
        if(err) return res.status(500).send(err);
        res.send({ message: "Deleted successfully" });
    });
});

module.exports = router;
