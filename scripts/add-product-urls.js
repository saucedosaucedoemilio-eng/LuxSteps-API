/**
 * Igual que add-product.js pero las imágenes son URLs remotas que sube
 * Cloudinary directamente (fetch desde sus servidores, evita el rate-limit
 * del proxy/IP local).
 *
 *   node scripts/add-product-urls.js <producto.json> <url1> [url2 ...]
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);

const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("../src/config/cloudinary");
const Product = require("../src/models/Product");

async function main() {
  const [jsonPath, ...urls] = process.argv.slice(2);
  if (!jsonPath || urls.length === 0) {
    console.error("Uso: node scripts/add-product-urls.js <producto.json> <url1> [url2 ...]");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  await mongoose.connect(process.env.MONGO_URI);

  const images = [];
  for (const u of urls) {
    const res = await cloudinary.uploader.upload(u, { folder: "luxsteps" });
    images.push(res.secure_url);
    console.log("subida:", u.slice(0, 70), "->", res.secure_url);
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
