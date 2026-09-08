const express = require("express");
const { getUsers } = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");

const router = express.Router();

router.get("/", protect, admin, getUsers);

module.exports = router;
