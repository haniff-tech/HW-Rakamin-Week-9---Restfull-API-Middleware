const verifyToken = require('../utils/auth')

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: 'Token diperlukan' });
    }

    const token = authorization.split(' ')[1];
    try {
        const data = verifyToken.verifyToken(token);
        req.user = data;
        next();
    } catch (error) {
        console.error("Error verifying token", error);
        return res.status(401).json({ message: 'Token salah' });
    }
};

module.exports = authMiddleware