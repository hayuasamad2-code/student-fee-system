const jwt = require('jsonwebtoken');

const secret = "your_jwt_secret_key";

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();
    } catch(err) {
        res.status(400).send({ message: "Invalid Token" });
    }
}

module.exports = { verifyToken, secret };
