const User = require("../models/User");

// GET /api/users  (admin)
const getUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers };
