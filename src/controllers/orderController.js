const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const REQUIRED_SHIPPING = ["fullName", "address", "city", "postalCode", "country"];

// POST /api/orders  (usuario autenticado)
const createOrder = async (req, res) => {
  try {
    const { items, shipping } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    if (!shipping || REQUIRED_SHIPPING.some((field) => !shipping[field]?.trim())) {
      return res.status(400).json({ message: "Faltan datos de envío" });
    }

    // Resolver cada línea contra la BD: precio y stock los pone el servidor,
    // nunca el cliente.
    const resolved = [];
    for (const line of items) {
      const product = await Product.findById(line.product);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${line.product}` });
      }

      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: `Cantidad inválida para ${product.name}` });
      }
      if (product.stock < quantity) {
        return res.status(409).json({
          message: `Sin stock suficiente de ${product.name} (quedan ${product.stock})`,
        });
      }

      resolved.push({
        product,
        item: {
          product: product._id,
          name: product.name,
          price: product.price,
          size: line.size != null && line.size !== "" ? Number(line.size) : undefined,
          quantity,
          image: product.images?.[0],
        },
      });
    }

    // Descontar stock una vez validado todo.
    await Promise.all(
      resolved.map(({ product, item }) =>
        Product.updateOne({ _id: product._id }, { $inc: { stock: -item.quantity } })
      )
    );

    const orderItems = resolved.map((r) => r.item);
    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      shipping: {
        fullName: shipping.fullName.trim(),
        address: shipping.address.trim(),
        city: shipping.city.trim(),
        postalCode: shipping.postalCode.trim(),
        country: shipping.country.trim(),
        phone: shipping.phone?.trim(),
      },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/mis-pedidos  (usuario autenticado)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id  (dueño o admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    const ownerId = order.user?._id ? order.user._id.toString() : order.user.toString();
    if (ownerId !== req.user.id) {
      const requester = await User.findById(req.user.id).select("role");
      if (requester?.role !== "admin") {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders  (admin)
const getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find()
      .sort("-createdAt")
      .populate("user", "name email");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/orders/:id/estado  (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = Order.schema.path("status").enumValues;
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
