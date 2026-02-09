const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET all payments
router.get('/', verifyToken, (req,res)=>{
    db.query(
        `SELECT p.id, u.name AS studentName, p.month, p.amount, p.status, p.date 
         FROM payments p JOIN users u ON p.student_id = u.id`,
        (err,result)=>{
            if(err) return res.status(500).send(err);
            res.send(result);
        }
    );
});

module.exports = router;
