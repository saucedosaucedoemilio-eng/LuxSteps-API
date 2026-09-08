/**
 * Da (o quita) rol de administrador a un usuario ya registrado.
 *
 *   node scripts/make-admin.js <email>            -> lo hace admin
 *   node scripts/make-admin.js <email> user       -> lo vuelve usuario normal
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const User = require("../src/models/User");

async function main() {
  const [email, role = "admin"] = process.argv.slice(2);
  if (!email || !["admin", "user"].includes(role)) {
    console.error("Uso: node scripts/make-admin.js <email> [admin|user]");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error("No hay ningún usuario con ese email:", email);
    process.exit(1);
  }

  user.role = role;
  await user.save();
  console.log(`${user.email}  ->  role: ${user.role}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
