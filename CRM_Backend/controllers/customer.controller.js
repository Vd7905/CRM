import mongoose from "mongoose";
import { Customer } from "../models/customer.model.js";
import fs from "fs";
import csv from "csv-parser";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper function for error handling
const handleError = (res, error, message = "An error occurred") => {
  console.error(error);
  res.status(500).json({
    success: false,
    message,
    error: error.message,
  });
};

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required fields",
      });
    }

    const customer = new Customer(customerData);
    await customer.save();

    res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    handleError(res, error, "Failed to create customer");
  }
};

// Get all customers with pagination and filtering
export const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      sort = "-created_at",
      city = "",
      gender = "",
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter object dynamically
    const filter = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    // Add optional filters
    if (city) filter["address.city"] = { $regex: city, $options: "i" };
    if (gender) filter["demographics.gender"] = gender.toLowerCase();

    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("segments");

    const total = await Customer.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch customers");
  }
};

// Get single customer
export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findById(id).populate("segments");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch customer");
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // Prevent email updates if provided
    if (updateData.email) {
      delete updateData.email;
    }

    const customer = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
      message: "Customer updated successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to update customer");
  }
};

// Delete customer (soft delete)
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to deactivate customer");
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("segments");

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve customers",
    });
  }
};

export const insertCustomers = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "CSV file is required");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  const customers = [];

  // Read CSV
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      customers.push({
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: {
          city: row.city,
          state: row.state,
          country: row.country,
        },
        stats: {
          total_spent: Number(row.total_spent) || 0,
          order_count: Number(row.order_count) || 0,
          last_purchase: row.last_purchase ? new Date(row.last_purchase) : null,
        },
        is_active: row.is_active === "true" || row.is_active === "1",
        uploaded_by: userId,
      });
    })
    .on("end", async () => {
      try {
        // Bulk insert: skips duplicates instead of crashing
        const result = await Customer.insertMany(customers, {
          ordered: false, // continue inserting even if duplicates found
        });

        // Identify duplicates by comparing emails
        const insertedEmails = result.map((c) => c.email);
        const duplicates = customers.filter((c) => !insertedEmails.includes(c.email));

        // Remove temp CSV file
        fs.unlinkSync(req.file.path);

        res.status(201).json({
          success: true,
          message: "Customers processed",
          data: {
            inserted: result,
            duplicates,
          },
        });
      } catch (err) {
        if (err.code === 11000 && err.writeErrors) {
          // Partial duplicates
          const insertedEmails = err.insertedDocs?.map((c) => c.email) || [];
          const duplicates = customers.filter((c) => !insertedEmails.includes(c.email));

          fs.unlinkSync(req.file.path);

          res.status(201).json({
            success: true,
            message: "Customers processed with some duplicates",
            data: {
              inserted: err.insertedDocs || [],
              duplicates,
            },
          });
        } else {
          console.error("Insert error:", err);
          throw new ApiError(500, "Failed to insert customers");
        }
      }
    })
    .on("error", (err) => {
      console.error("CSV parse error:", err);
      throw new ApiError(500, "Error parsing CSV file");
    });
});
