const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Document = require("../models/Document");

router.post("/:id", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });
    if (document.status === "signed") return res.status(400).json({ message: "Document already signed" });

    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    document.status = "signed";
    document.signedBy = req.user.id;
    document.signedAt = new Date();
    document.signature = req.body.signature;
    document.auditTrail.push({
      action: "signed",
      performedBy: req.user.id,
      timestamp: new Date(),
      ipAddress
    });

    await document.save();
    res.json({ message: "Document signed successfully", document });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/:id/reject", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });
    if (document.status === "signed") return res.status(400).json({ message: "Cannot reject a signed document" });

    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    document.status = "rejected";
    document.auditTrail.push({
      action: "rejected",
      performedBy: req.user.id,
      timestamp: new Date(),
      ipAddress
    });

    await document.save();
    res.json({ message: "Document rejected", document });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id/audit", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("auditTrail.performedBy", "name email");
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.json({ auditTrail: document.auditTrail });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;