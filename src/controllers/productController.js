const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "luxsteps" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// Extrae el public_id ("luxsteps/abc123") de una URL de Cloudinary para poder borrarla.
const publicIdFromUrl = (url) => {
  const match = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/.exec(url || "");
  return match ? match[1] : null;
};

const destroyFromCloudinary = async (url) => {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Borrado best-effort: si falla, la imagen queda huérfana pero no rompemos la petición.
  }
};

// Normaliza el campo `size` que puede llegar como array, string suelta o "38, 39, 40".
const parseSizes = (size) => {
  if (size === undefined) return undefined;
  const values = Array.isArray(size) ? size : String(size).split(",");
  return values
    .map((value) => Number(String(value).trim()))
    .filter((value) => !Number.isNaN(value));
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, size, category } = req.body;
    let images = [];

    if (req.files && req.files.length > 0) {
      images = await Promise.all(req.files.map((file) => uploadToCloudinary(file.buffer)));
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      size: parseSizes(size) ?? [],
      category,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const { name, description, price, stock, size, category } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category !== undefined) product.category = category;

    const sizes = parseSizes(size);
    if (sizes !== undefined) product.size = sizes;

    // Solo tocamos las imágenes si el cliente pide sincronizarlas (formulario de edición).
    if (req.body.syncImages) {
      const keptRaw = req.body.existingImages;
      const kept = keptRaw
        ? (Array.isArray(keptRaw) ? keptRaw : [keptRaw]).filter(Boolean)
        : [];

      let uploaded = [];
      if (req.files && req.files.length > 0) {
        uploaded = await Promise.all(req.files.map((file) => uploadToCloudinary(file.buffer)));
      }

      const removed = product.images.filter((url) => !kept.includes(url));
      await Promise.all(removed.map(destroyFromCloudinary));

      product.images = [...kept, ...uploaded];
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    await Promise.all((product.images || []).map(destroyFromCloudinary));

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
