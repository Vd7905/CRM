// models/Customer.js
import mongoose from "mongoose";
import { Segment } from "./segment.model.js";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: "India" },
  },
  demographics: {
    age: Number,
    gender: String,
    occupation: String,
  },
  stats: {
    total_spent: { type: Number, default: 0 },
    first_purchase: Date,
    last_purchase: Date,
    order_count: { type: Number, default: 0 },
    average_order_value: Number,
  },
  segments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Segment" }],
  tags: [String],
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
  is_active: { type: Boolean, default: true },
});

// Update timestamps on save
customerSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export const Customer = mongoose.model("Customer", customerSchema);