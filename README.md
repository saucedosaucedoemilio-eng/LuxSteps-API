# LuxSteps API

API backend para tienda de zapatos online, construida con Node.js, Express, MongoDB y Mongoose.

## Estructura del proyecto

```
LuxSteps-API/
├── src/
│   ├── config/
│   │   ├── db.js            -> Conexión a MongoDB
│   │   └── cloudinary.js    -> Configuración de Cloudinary
│   ├── controllers/
│   │   ├── authController.js       -> Registro, login, perfil
│   │   └── productController.js    -> CRUD de productos
│   ├── middlewares/
│   │   ├── authMiddleware.js       -> Verifica JWT
│   │   └── uploadMiddleware.js     -> Manejo de subida de archivos (Multer)
│   ├── models/
│   │   ├── User.js          -> Modelo de Usuario
│   │   └── Product.js       -> Modelo de Producto
│   ├── routes/
│   │   ├── authRoutes.js    -> Rutas de autenticación
│   │   └── productRoutes.js -> Rutas de productos
│   ├── app.js                -> Configuración de Express y middlewares
│   └── server.js             -> Conexión a la BD y arranque del servidor
├── .env               -> Variables de entorno (no subir a GitHub)
├── .gitignore          -> Archivos y carpetas que Git debe ignorar
├── package.json        -> Dependencias y scripts del proyecto
└── README.md            -> Documentación del proyecto
```

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/luxsteps
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Scripts

```bash
npm run dev    # Inicia el servidor en modo desarrollo (nodemon)
npm start      # Inicia el servidor en modo producción
```

## Endpoints principales

### Auth
- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Iniciar sesión
- `GET /api/auth/profile` — Obtener perfil (requiere token)

### Productos
- `GET /api/products` — Listar productos
- `GET /api/products/:id` — Obtener producto por ID
- `POST /api/products` — Crear producto (requiere token, soporta imágenes)
- `PUT /api/products/:id` — Actualizar producto (requiere token)
- `DELETE /api/products/:id` — Eliminar producto (requiere token)
