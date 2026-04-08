const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Luôn đọc đúng file .env trong thư mục backend
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tạo folder uploads
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Public folder ảnh
app.use("/uploads", express.static(uploadPath));

// Model
const Product = require("./models/Product");

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "BAPhone backend is running" });
});

// Admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// GET products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (err) {
    console.log("GET /api/products error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST product
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ error: "Thiếu tên hoặc giá sản phẩm" });
    }

    let priceInput = String(req.body.price).replace(/,/g, "").trim().toLowerCase();

    if (priceInput.includes("triệu")) {
      priceInput = parseFloat(priceInput) * 1000000;
    } else if (priceInput.includes("k")) {
      priceInput = parseFloat(priceInput) * 1000;
    } else {
      priceInput = Number(priceInput);
    }

    if (isNaN(priceInput)) {
      return res.status(400).json({ error: "Giá sản phẩm không hợp lệ" });
    }

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : "https://via.placeholder.com/300";

    const product = new Product({
      name: req.body.name,
      price: priceInput,
      image: imageUrl,
      description: req.body.description || "",
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.log("POST /api/products error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa" });
  } catch (err) {
    console.log("DELETE /api/products/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build
const frontendBuildPath = path.join(__dirname, "..", "frontend-react", "build");
const frontendIndexPath = path.join(frontendBuildPath, "index.html");

if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/uploads") ||
      req.path === "/admin"
    ) {
      return next();
    }

    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.send("BAPhone backend is running");
  });
}

// Start server chỉ sau khi MongoDB kết nối thành công
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Thiếu MONGO_URI. Hãy thêm vào Replit Secrets hoặc backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("MongoDB error:", err);
    process.exit(1);
  }
}

startServer();