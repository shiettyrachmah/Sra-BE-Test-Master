const jwt = require('jsonwebtoken');
const authToken = require("../config/auth");

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, akses ditolak.' });
  }

  jwt.verify(token, authToken.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid, akses ditolak.' });
    }

    req.user = user; // Menambahkan informasi pengguna ke request
    next();
  });
};

module.exports = {
    authenticateJWT: authenticateJWT
}