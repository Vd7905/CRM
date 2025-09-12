import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Customer } from "../models/customer.model.js";

// Helper function for error handling
const handleError = (res, error, message = "An error occurred") => {
  console.error(error);
  res.status(500).json({
    success: false,
    message,
    error: error.message,
  });
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // 1. Validate required fields (excluding order_id since we'll generate it)
    if (!orderData.customer_id || !orderData.items || !orderData.total) {
      return res.status(400).json({
        success: false,
        message: "Customer ID, items, and total are required fields",
      });
    }

    const cust = await Customer.findById(orderData.customer_id);
    if(!cust){
      return res.status(400).json({
        success: false,
        message: "Customer does not exist!!!",
      });
    }

    // 2. Generate order_id if not provided (FIXED)
    if (!orderData.order_id) {
      orderData.order_id = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      // Added random suffix to prevent collisions
    }

    // 3. Create and save order
    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      success: true,
      data: order,
      message: "Order created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Order ID already exists - please try again",
      });
    }
    if (error.name === "ValidationError") {
      // Handle specific Mongoose validation errors
      return res.status(400).json({
        success: false,
        message: "Validation failed: " + error.message,
        errors: error.errors,
      });
    }
    handleError(res, error, "Failed to create order");
  }
};

// Get all orders with pagination and filtering
const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer_id,
      status,
      sort = "-created_at",
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (customer_id) filter.customer_id = customer_id;
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("customer_id", "name email");

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch orders");
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id).populate(
      "customer_id",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch order");
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Prevent certain fields from being updated
    const restrictedFields = ["customer_id", "order_id", "created_at"];
    restrictedFields.forEach((field) => delete updateData[field]);

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: "Order updated successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to update order");
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update customer stats
    await Customer.findByIdAndUpdate(order.customer_id, {
      $inc: {
        "stats.order_count": -1,
        "stats.total_spent": -order.total,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to delete order");
  }
};

export { createOrder, getOrders, getOrder, updateOrder, deleteOrder };