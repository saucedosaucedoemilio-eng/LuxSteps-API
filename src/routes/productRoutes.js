const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const protect = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, admin, upload.array("images", 5), createProduct);
router.put("/:id", protect, admin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
