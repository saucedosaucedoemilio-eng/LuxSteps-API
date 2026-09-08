/**
 * Renombra un producto por id.
 *
 *   node scripts/rename-product.js <id> "<nuevo nombre>"
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const Product = require("../src/models/Product");

async function main() {
  const [id, name] = process.argv.slice(2);
  if (!id || !name) {
    console.error('Uso: node scripts/rename-product.js <id> "<nuevo nombre>"');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const before = await Product.findById(id).select("name").lean();
  if (!before) {
    console.error("No existe el producto", id);
    process.exit(1);
  }
  await Product.updateOne({ _id: id }, { $set: { name } });
  console.log(`"${before.name}"  ->  "${name}"`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
