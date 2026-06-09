const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const protect = require("../middleware/authMiddleware");
const Document = require("../models/Document");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// POST /api/upload
router.post("/", protect, upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const document = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      message: "File uploaded successfully",
      document
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/upload/documents
router.get("/documents", protect, async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;