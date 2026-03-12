const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const payload = jwt.verify(token, JWT_SECRET);

  req.userId = payload.sub;
  req.userEmail = payload.email;

  next();
}

module.exports = requireAuth;

