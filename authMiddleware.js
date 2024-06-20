// const jwt = require('jsonwebtoken');
// const User = require('./model/user');

// const authMiddleware = async (req, res, next) => {
//     // Get token from session or request headers (you can modify as per your implementation)
//     const token = req.session.token || req.headers.authorization?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ message: 'Authorization token missing' });
//     }

//     try {
//         const decoded = jwt.verify(token, 'wajdi');
//         const user = await User.findById(decoded._id);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         req.user = user; // Attach user object to request for further use in routes
//         next();
//     } catch (err) {
//         return res.status(401).json({ message: 'Invalid token' });
//     }
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const User = require('./model/user');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).send('Authentication failed: authorization failed');
    }

    try {
        const tokenData = token.split(' ')[1];
        const decodedToken = jwt.verify(tokenData, process.env.JWT_SECRET || 'wajdi'); // Use environment variable for secret key

        const user = await User.findById(decodedToken._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach user object to request for further use in routes
        next();
    } catch (error) {
        return res.status(401).send('Authentication failed: invalid token');
    }
};

module.exports = authMiddleware;

