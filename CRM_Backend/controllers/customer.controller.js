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

// export const insertCustomers = asyncHandler(async (req, res) => {
//   if (!req.file) {
//     throw new ApiError(400, "CSV file is required");
//   }

//   const userId = req.user?._id;
//   if (!userId) {
//     throw new ApiError(401, "Unauthorized: User not found");
//   }

//   const customers = [];

//   // Read CSV
//   fs.createReadStream(req.file.path)
//     .pipe(csv())
//     .on("data", (row) => {
//       customers.push({
//         name: row.name,
//         email: row.email,
//         phone: row.phone,
//         address: {
//           city: row.city,
//           state: row.state,
//           country: row.country,
//         },
//         stats: {
//           total_spent: Number(row.total_spent) || 0,
//           order_count: Number(row.order_count) || 0,
//           last_purchase: row.last_purchase ? new Date(row.last_purchase) : null,
//         },
//         is_active: row.is_active === "true" || row.is_active === "1",
//         uploaded_by: userId,
//       });
//     })
//     .on("end", async () => {
//       try {
//         // Bulk insert: skips duplicates instead of crashing
//         const result = await Customer.insertMany(customers, {
//           ordered: false, // continue inserting even if duplicates found
//         });

//         // Identify duplicates by comparing emails
//         const insertedEmails = result.map((c) => c.email);
//         const duplicates = customers.filter((c) => !insertedEmails.includes(c.email));

//         // Remove temp CSV file
//         fs.unlinkSync(req.file.path);

//         res.status(201).json({
//           success: true,
//           message: "Customers processed",
//           data: {
//             inserted: result,
//             duplicates,
//           },
//         });
//       } catch (err) {
//         if (err.code === 11000 && err.writeErrors) {
//           // Partial duplicates
//           const insertedEmails = err.insertedDocs?.map((c) => c.email) || [];
//           const duplicates = customers.filter((c) => !insertedEmails.includes(c.email));

//           fs.unlinkSync(req.file.path);

//           res.status(201).json({
//             success: true,
//             message: "Customers processed with some duplicates",
//             data: {
//               inserted: err.insertedDocs || [],
//               duplicates,
//             },
//           });
//         } else {
//           console.error("Insert error:", err);
//           throw new ApiError(500, "Failed to insert customers");
//         }
//       }
//     })
//     .on("error", (err) => {
//       console.error("CSV parse error:", err);
//       throw new ApiError(500, "Error parsing CSV file");
//     });
// });

// export const insertCustomers = asyncHandler(async (req, res) => {
//   if (!req.file) throw new ApiError(400, "CSV file is required");

//   const userId = req.user?._id;
//   if (!userId) throw new ApiError(401, "Unauthorized: User not found");

//   const customers = [];

//   // Tag logic helper
//   const assignTags = (totalSpent, orderCount, lastPurchase) => {
//     const tags = [];

//     if (totalSpent >= 10000) tags.push("Premium");
//     else if (totalSpent >= 2000) tags.push("Regular");
//     else tags.push("New");

//     if (orderCount >= 10) tags.push("Loyal");

//     // If last purchase > 6 months ago
//     if (lastPurchase) {
//       const sixMonthsAgo = new Date();
//       sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
//       if (new Date(lastPurchase) < sixMonthsAgo) tags.push("Inactive");
//     }

//     return tags;
//   };

//   fs.createReadStream(req.file.path)
//     .pipe(csv())
//     .on("data", (row) => {
//       const totalSpent = Number(row.total_spent) || 0;
//       const orderCount = Number(row.order_count) || 0;
//       const lastPurchase = row.last_purchase ? new Date(row.last_purchase) : null;

//       const tags = assignTags(totalSpent, orderCount, lastPurchase);

//       customers.push({
//         name: row.name,
//         email: row.email,
//         phone: row.phone,
//         address: {
//           city: row.city,
//           state: row.state,
//           country: row.country,
//         },
//         stats: {
//           total_spent: totalSpent,
//           order_count: orderCount,
//           last_purchase: lastPurchase,
//         },
//         tags,
//         is_active: row.is_active === "true" || row.is_active === "1",
//         uploaded_by: userId,
//       });
//     })
//     .on("end", async () => {
//       try {
//         const result = await Customer.insertMany(customers, { ordered: false });
//         const insertedEmails = result.map((c) => c.email);
//         const duplicates = customers.filter(
//           (c) => !insertedEmails.includes(c.email)
//         );

//         fs.unlinkSync(req.file.path);

//         res.status(201).json({
//           success: true,
//           message: "Customers processed successfully with tags",
//           data: { inserted: result, duplicates },
//         });
//       } catch (err) {
//         if (err.code === 11000 && err.writeErrors) {
//           const insertedEmails = err.insertedDocs?.map((c) => c.email) || [];
//           const duplicates = customers.filter(
//             (c) => !insertedEmails.includes(c.email)
//           );

//           fs.unlinkSync(req.file.path);

//           res.status(201).json({
//             success: true,
//             message: "Customers processed with some duplicates",
//             data: {
//               inserted: err.insertedDocs || [],
//               duplicates,
//             },
//           });
//         } else {
//           console.error("Insert error:", err);
//           throw new ApiError(500, "Failed to insert customers");
//         }
//       }
//     })
//     .on("error", (err) => {
//       console.error("CSV parse error:", err);
//       throw new ApiError(500, "Error parsing CSV file");
//     });
// });


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

    // If last purchase > 6 months ago
    if (lastPurchase) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (new Date(lastPurchase) < sixMonthsAgo) tags.push("Inactive");
    }

    return tags;
  };

  // -------------------------------
  // Parse CSV and prepare customers
  // -------------------------------
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const totalSpent = Number(row.total_spent) || 0;
      const orderCount = Number(row.order_count) || 0;
      const lastPurchase = row.last_purchase ? new Date(row.last_purchase) : null;
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
        // Insert customers (duplicates within same user skipped)
        const result = await Customer.insertMany(customers, { ordered: false });

        // Identify duplicates (per user)
        const insertedKeys = result.map(
          (c) => `${c.email}_${c.uploaded_by.toString()}`
        );
        const duplicates = customers.filter(
          (c) => !insertedKeys.includes(`${c.email}_${userId}`)
        );

        // Remove temp CSV file
        fs.unlinkSync(req.file.path);

        res.status(201).json({
          success: true,
          message: "Customers processed successfully with tags",
          data: { inserted: result, duplicates },
        });
      } catch (err) {
        if (err.code === 11000 && err.writeErrors) {
          // Handle partial duplicates per user
          const insertedEmails = err.insertedDocs?.map(
            (c) => `${c.email}_${c.uploaded_by.toString()}`
          ) || [];

          const duplicates = customers.filter(
            (c) => !insertedEmails.includes(`${c.email}_${userId}`)
          );

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