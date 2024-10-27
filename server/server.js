const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Import routes
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

// MongoDB connection
mongoose
  .connect("mongodb+srv://ahmad:ahmad@cluster0.ma8ta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dhhhkzrxj",
  api_key: "714275722838275",
  api_secret: "1c0aQswSLRUgg2TSQIJCrmIGys8", 
});
// Set up Multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).single('file'); // Ensure this matches the form field name from the frontend

// Image upload route
app.post('/api/admin/products/upload-image', (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "products" }, // Optional folder in Cloudinary
        (error, result) => {
          if (error) {
            return res.status(500).json({ success: false, message: 'Cloudinary upload error' });
          }
          return res.status(200).json({ success: true, result });
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error uploading to Cloudinary' });
    }
  });
});

// Use your routers
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/common/feature", commonFeatureRouter);

// Start server
app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
