// models/CommunicationLog.js
import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true,
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  channel: { type: String, enum: ["email", "sms", "push"], default: "email" },
  status: {
    type: String,
    enum: ["queued", "sent", "delivered", "opened", "clicked", "failed"],
    default: "queued",
  },
  failure_reason: String,
  message_id: String, // Vendor's message ID
  sent_at: Date,
  delivered_at: Date,
  opened_at: Date,
  clicked_at: Date,
  metadata: mongoose.Schema.Types.Mixed,
});

// Indexes for faster querying
logSchema.index({ campaign_id: 1 });
logSchema.index({ customer_id: 1 });
logSchema.index({ status: 1 });

export const CommunicationLog = mongoose.model("CommunicationLog", logSchema);