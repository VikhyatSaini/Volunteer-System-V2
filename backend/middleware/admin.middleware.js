const isAdmin = (req, res, next) => {
  // We assume 'protect' middleware has already run and attached req.user
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' }); // 403 Forbidden
  }
};

module.exports = { isAdmin };