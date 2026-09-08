/**
 * Alta de producto: sube imágenes a Cloudinary y crea el documento en Mongo.
 *
 *   node scripts/add-product.js <producto.json> <img1> [img2 ...]
 *
 * producto.json: { name, description, price, stock, size: [40,41], category }
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);

const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("../src/config/cloudinary");
const Product = require("../src/models/Product");

async function main() {
  const [jsonPath, ...imgPaths] = process.argv.slice(2);
  if (!jsonPath || imgPaths.length === 0) {
    console.error("Uso: node scripts/add-product.js <producto.json> <img1> [img2 ...]");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  await mongoose.connect(process.env.MONGO_URI);

  const images = [];
  for (const p of imgPaths) {
    const res = await cloudinary.uploader.upload(p, { folder: "luxsteps" });
    images.push(res.secure_url);
    console.log("subida:", path.basename(p), "->", res.secure_url);
  }

  const product = await Product.create({
    name: data.name,
    description: data.description,
    price: Number(data.price),
    stock: Number(data.stock ?? 0),
    size: Array.isArray(data.size) ? data.size.map(Number) : [],
    category: data.category,
    images,
  });

  console.log("creado:", product._id.toString(), "-", product.name);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
