// models/Segment.js
import mongoose from "mongoose";

const buildSegmentQuery = (rules) => {
  const query = {};
  rules.rules.forEach((rule) => {
    // Example: Convert rules to MongoDB syntax
    if (rule.operator === ">") query[rule.field] = { $gt: rule.value };
    // Add other operators (==, <, contains, etc.)
  });
  return query;
};

const ruleSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    enum: [
      "total_spent",
      "order_count",
      "last_purchase",
      "tags",
      "city",
      "is_active",
    ],
  },
  operator: {
    type: String,
    required: true,
    enum: [
      ">",
      "<",
      "==",
      ">=",
      "<=",
      "!=",
      "contains",
      "not_contains",
      "exists",
      "not_exists",
    ],
  },
  value: mongoose.Schema.Types.Mixed,
  value_type: { type: String, enum: ["number", "string", "date", "boolean"] },
});

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  rules: {
    condition: { type: String, enum: ["AND", "OR"], default: "AND" },
    rules: [ruleSchema],
  },
  estimated_count: Number,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
  is_dynamic: { type: Boolean, default: true },
});

// Update count when segment is modified
segmentSchema.pre("save", async function (next) {
  if (this.isModified("rules")) {
    this.estimated_count = await this.constructor.getEstimatedCount(this.rules);
  }
  this.updated_at = Date.now();
  next();
});

// Static method to estimate segment size
segmentSchema.statics.getEstimatedCount = async function (rules) {
  const Customer = mongoose.model("Customer");
  const query = buildSegmentQuery(rules);
  return Customer.countDocuments(query);
};

export const Segment = mongoose.model("Segment", segmentSchema);