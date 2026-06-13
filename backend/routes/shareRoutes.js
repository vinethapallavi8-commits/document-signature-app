const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const protect = require("../middleware/authMiddleware");
const Document = require("../models/Document");

// POST /api/share/:id - Generate share token
router.post("/:id", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const shareToken = crypto.randomBytes(32).toString("hex");
    const shareTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    document.shareToken = shareToken;
    document.shareTokenExpiry = shareTokenExpiry;
    await document.save();

    const shareLink = `${req.headers.origin}/public-sign/${shareToken}`;

    res.json({
      message: "Share link generated successfully",
      shareLink,
      expiresAt: shareTokenExpiry
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/share/:token - Get document by share token
router.get("/token/:token", async (req, res) => {
  try {
    const document = await Document.findOne({
      shareToken: req.params.token,
      shareTokenExpiry: { $gt: new Date() }
    });

    if (!document) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    res.json({
      _id: document._id,
      originalName: document.originalName,
      filename: document.filename,
      status: document.status
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/share/sign/:token - Sign document via share token
router.post("/sign/:token", async (req, res) => {
  try {
    const document = await Document.findOne({
      shareToken: req.params.token,
      shareTokenExpiry: { $gt: new Date() }
    });

    if (!document) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    if (document.status === "signed") {
      return res.status(400).json({ message: "Document already signed" });
    }

    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    document.status = "signed";
    document.signedAt = new Date();
    document.signature = req.body.signature;
    document.auditTrail.push({
      action: "signed via share link",
      timestamp: new Date(),
      ipAddress
    });

    await document.save();

    res.json({ message: "Document signed successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;