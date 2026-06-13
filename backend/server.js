const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const signRoutes = require("./routes/signRoutes");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://document-signature-app-rouge.vercel.app"
  ],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/sign", signRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});