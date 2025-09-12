import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    segment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      required: true,
    },
    template: {
      subject: { type: String, required: true },
      body: { type: String, required: true },
      variables: [String],
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "processing", "completed", "failed"],
      default: "draft",
    },
    scheduled_at: Date,
    started_at: Date,
    completed_at: Date,
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stats: {
      total_recipients: Number,
      sent: Number,
      failed: Number,
      delivery_rate: Number,
      open_rate: Number,
      click_rate: Number,
    },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
  },
  { timestamps: true }
);

// Add pre-save hook for status changes
campaignSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "processing") this.started_at = new Date();
    if (this.status === "completed") this.completed_at = new Date();
  }
  next();
});

export const Campaign = mongoose.model("Campaign", campaignSchema);