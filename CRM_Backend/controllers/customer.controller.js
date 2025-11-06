import mongoose from "mongoose";
import { Customer } from "../models/customer.model.js";
import fs from "fs";
import csv from "csv-parser";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);


// Helper function for error handling
const handleError = (res, error, message = "An error occurred") => {
  console.error(error);
  res.status(500).json({
    success: false,
    message,
    error: error.message,
  });
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
  if (!req.file) throw new ApiError(400, "CSV file is required");

  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized: User not found");


  const customers = [];

  // -------------------------------
  // Helper: Auto-assign tags
  // -------------------------------
  const assignTags = (totalSpent, orderCount, lastPurchase) => {
    const tags = [];

    if (totalSpent >= 10000) tags.push("Premium");
    else if (totalSpent >= 2000) tags.push("Regular");
    else tags.push("New");

    if (orderCount >= 10) tags.push("Loyal");

    if (lastPurchase) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (new Date(lastPurchase) < sixMonthsAgo) tags.push("Inactive");
    }

    return tags;
  };

  // -------------------------------
  // Parse CSV File
  // -------------------------------
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      let lastPurchase = null;

      if (row.last_purchase && row.last_purchase.trim() !== "") {
        //  Handle Indian date formats safely
        const parsed = dayjs(
          row.last_purchase.trim(),
          ["DD-MM-YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"],
          true
        );
        if (parsed.isValid()) {
          lastPurchase = parsed.toDate();
        } else {
          console.warn(
            `⚠️ Invalid date for ${row.email || row.name}: "${row.last_purchase}" — setting to null`
          );
          lastPurchase = null;
        }
      }

      const totalSpent = Number(row.total_spent) || 0;
      const orderCount = Number(row.order_count) || 0;
      const tags = assignTags(totalSpent, orderCount, lastPurchase);

      customers.push({
        name: row.name,
        email: row.email?.trim(),
        phone: row.phone,
        address: {
          city: row.city,
          state: row.state,
          country: row.country,
        },
        stats: {
          total_spent: totalSpent,
          order_count: orderCount,
          last_purchase: lastPurchase,
        },
        tags,
        is_active: row.is_active === "true" || row.is_active === "1",
        uploaded_by: userId,
      });
    })
    .on("end", async () => {
      try {
      

        const inserted = [];
        const updated = [];
        const duplicates = [];

        // -------------------------------
        // Upsert Logic (per user, with logging)
        // -------------------------------
        for (const c of customers) {
        

          const existing = await Customer.findOne({
            email: c.email,
            uploaded_by: userId,
          });

          if (existing) {
           
            duplicates.push({
              email: c.email,
              name: c.name,
              reason: "Already exists (updated instead)",
            });

            await Customer.updateOne(
              { email: c.email, uploaded_by: userId },
              { $set: c }
            );

            updated.push(c);
          } else {
           
            const newCustomer = await Customer.create(c);
            inserted.push(newCustomer);
          }
        }

        const finalCount = await Customer.countDocuments({ uploaded_by: userId });
      

        fs.unlinkSync(req.file.path);

        res.status(201).json({
          success: true,
          message: "✅ Customers processed successfully (Indian date fix applied)",
          data: {
            insertedCount: inserted.length,
            updatedCount: updated.length,
            duplicateCount: duplicates.length,
            inserted,
            updated,
            duplicates,
          },
        });
      } catch (err) {
        console.error("❌ Insert error:", err);
        fs.unlinkSync(req.file.path);
        throw new ApiError(500, "Failed to insert or update customers");
      }
    })
    .on("error", (err) => {
      console.error("❌ CSV parse error:", err);
      throw new ApiError(500, "Error parsing CSV file");
    });
});



