const User = require("../models/User");

// Debe usarse siempre después de `protect`, que deja `req.user.id`.
const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Acceso restringido a administradores" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = admin;
