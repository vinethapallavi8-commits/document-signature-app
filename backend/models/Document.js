const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "signed", "rejected"],
    default: "pending"
  },
  signedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  signedAt: { type: Date },
  signature: { type: String },
  auditTrail: [
    {
      action: { type: String },
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
      ipAddress: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);