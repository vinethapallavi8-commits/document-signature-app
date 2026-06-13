const express = require("express");
const router = express.Router();
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const protect = require("../middleware/authMiddleware");
const Document = require("../models/Document");

// GET /api/pdf/:id/download - Generate and download signed PDF
router.get("/:id/download", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.status !== "signed") {
      return res.status(400).json({ message: "Document is not signed yet" });
    }

    // Read the original PDF
    const pdfPath = path.join(__dirname, "..", document.path);
    const pdfBytes = fs.readFileSync(pdfPath);

    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Embed signature image
    if (document.signature) {
      const base64Data = document.signature.replace(/^data:image\/png;base64,/, "");
      const signatureBytes = Buffer.from(base64Data, "base64");
      const signatureImage = await pdfDoc.embedPng(signatureBytes);

      const sigWidth = 200;
      const sigHeight = 80;

      firstPage.drawImage(signatureImage, {
        x: width - sigWidth - 50,
        y: 50,
        width: sigWidth,
        height: sigHeight,
      });

      // Add signed text
      firstPage.drawText(`Signed digitally`, {
        x: width - sigWidth - 50,
        y: 40,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });

      firstPage.drawText(`Date: ${new Date(document.signedAt).toLocaleDateString()}`, {
        x: width - sigWidth - 50,
        y: 28,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Save signed PDF
    const signedPdfBytes = await pdfDoc.save();
    const signedFileName = `signed-${document.filename}`;
    const signedPath = path.join(__dirname, "..", "uploads", signedFileName);
    fs.writeFileSync(signedPath, signedPdfBytes);

    // Send file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${signedFileName}`);
    res.send(Buffer.from(signedPdfBytes));

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;