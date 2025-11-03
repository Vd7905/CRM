import axios from "axios";
import { Customer } from "../models/customer.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Helper: days between two dates
function daysBetween(date1, date2) {
  return Math.floor(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
}

// POST /api/customers/enrich-all
export const enrichAllCustomers = async (req, res) => {
  try {
    // ✅ Step 1: Get the user ID from authenticated request
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
    }

   // ✅ Fetch customers uploaded by this user
    const customers = await Customer.find({ uploaded_by: userId }).lean();
    //console.log(customers.length);
    if (!customers.length) {
      return res.status(200).json({ message: "No customers found for this user" });
    }

    const today = new Date();

    // Step 3: Prepare churn prediction payload
    const churnPayload = customers.map((c) => {
      const lastPurchase = c.stats?.last_purchase ? new Date(c.stats.last_purchase) : null;
      const firstPurchase = c.stats?.first_purchase ? new Date(c.stats.first_purchase) : null;
      const recency = lastPurchase ? daysBetween(today, lastPurchase) : 0;
      const tenure = firstPurchase ? daysBetween(today, firstPurchase) : 0;

      return {
        customer_id: c._id?.toString() || null,
        age: c.demographics?.age ?? null,
        gender: c.demographics?.gender ?? null,
        occupation: c.demographics?.occupation ?? null,
        total_spent: Number(c.stats?.total_spent) || 0,
        order_count: Number(c.stats?.order_count) || 0,
        average_order_value: Number(c.stats?.average_order_value) || 0,
        recency,
        tenure,
        last_purchase_days: recency,
        tags: Array.isArray(c.tags) ? c.tags.join(",") : (c.tags || ""),
        churn_probability: null,
      };
    });

  const isDocker = process.env.DOCKER_ENV === "true";

const ML_URL = process.env.ML_SERVICE_URL || "https://crm-ml-service.onrender.com";
console.log("🧠 ML Service URL →", ML_URL);


    // Step 4: Call FastAPI churn prediction endpoint
    const churnResponse = await axios.post(`${ML_URL}/predict-churn`, churnPayload);

    // Step 5: Merge churn predictions
    const customersWithChurn = customers.map((c, index) => ({
      ...c,
      churn_probability: churnResponse.data[index]?.churn_probability || 0,
      predicted_churn: churnResponse.data[index]?.predicted_class || null,
    }));

    // Step 6: Prepare recommendation payload
    const recommendPayload = customersWithChurn.map((c) => ({
      customer_id: c._id?.toString() || "string",
      age: Number(c.demographics?.age) || 0,
      gender: c.demographics?.gender || "string",
      occupation: c.demographics?.occupation || "string",
      total_spent: Number(c.stats?.total_spent) || 0,
      order_count: Number(c.stats?.order_count) || 0,
      average_order_value: Number(c.stats?.average_order_value) || 0,
      recency: Number(c.recency) || 0,
      tenure: Number(c.tenure) || 0,
      last_purchase_days: Number(c.last_purchase_days) || 0,
      tags: Array.isArray(c.tags) ? c.tags.join(",") : (c.tags || "string"),
      churn_probability: Number(c.churn_probability) || 0,
    }));

    // Step 7: Call FastAPI recommendation endpoint
    const recommendResponse = await axios.post(`${ML_URL}/recommend`, recommendPayload);

    // Step 8: Merge recommendations
    const enrichedCustomers = customersWithChurn.map((c, index) => ({
      ...c,
      recommendations: recommendResponse.data[index]?.recommendations || [],
      cluster_id: recommendResponse.data[index]?.cluster_id || null,
    }));

    // Step 9: Return enriched customers
    res.status(200).json({ success: true, data: enrichedCustomers });
  } catch (error) {
    console.error("❌ Error enriching all customers:", error.message);
    res.status(500).json({ success: false, error: "Failed to enrich all customers" });
  }
};
