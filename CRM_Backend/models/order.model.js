// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  payment_method: String,
  shipping_address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
});

// Middleware to update customer stats when order is created
orderSchema.post("save", async function (doc) {
  const Customer = mongoose.model("Customer");
  await Customer.updateOne(
    { _id: doc.customer_id },
    {
      $inc: {
        "stats.order_count": 1,
        "stats.total_spent": doc.total,
      },
      $set: { "stats.last_purchase": doc.created_at },
      $setOnInsert: { "stats.first_purchase": doc.created_at },
    }
  );

  // Recalculate average order value
  await Customer.aggregate([
    { $match: { _id: doc.customer_id } },
    {
      $set: {
        "stats.average_order_value": {
          $divide: ["$stats.total_spent", "$stats.order_count"],
        },
      },
    },
  ]);
});

export const Order = mongoose.model("Order", orderSchema);