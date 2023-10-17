exampleMiddlewareFunction = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Tidak ada informasi peran pengguna, akses ditolak.' });
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengakses endpoint ini.' });
    }
  };
};

module.exports = {
  exampleMiddlewareFunction: exampleMiddlewareFunction
}