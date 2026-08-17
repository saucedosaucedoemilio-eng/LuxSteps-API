const dns = require("dns");
const mongoose = require("mongoose");

// Algunas redes/routers no resuelven bien los registros SRV que usa
// mongodb+srv:// con el resolver DNS por defecto de Node en Windows.
// Forzar DNS públicos evita el error "querySrv ECONNREFUSED".
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
