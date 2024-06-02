const jwt = require('jsonwebtoken');
const secretKey = 'secret_key';


let loggedOutTokens = [];
function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (loggedOutTokens.includes(token)) {
    return res.status(401).json({ error: 'Token is logged out' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }

    req.user = decoded;
    req.token = token; // Attach token to req object for easier access
    next();
  });
}

module.exports = authenticate;