import axios from "axios";

// POST /api/recommend
export const recommendations = async (req, res) => {
  try {
     console.log("Received body:", req.body);
    let customers;
    if (Array.isArray(req.body)) {
      customers = req.body;
    } else if (req.body && Array.isArray(req.body.customers)) {
      customers = req.body.customers;
    } else {
      return res.status(400).json({ message: "No customer data provided" });
    }

    if (!customers || customers.length === 0) {
      return res.status(400).json({ message: "No customer data provided" });
    }

    // Prepare payload for FastAPI (match expected features)
    const payload = customers.map((c) => ({
      customer_id: c._id || c.customer_id || "string",
      age: Number(c.demographics?.age) || 0,
      gender: c.demographics?.gender || "string",
      occupation: c.demographics?.occupation || "string",
      total_spent: Number(c.total_spent) || 0,
      order_count: Number(c.order_count) || 0,
      average_order_value: Number(c.average_order_value) || 0,
      recency: Number(c.recency) || 0,
      tenure: Number(c.tenure) || 0,
      last_purchase_days: Number(c.last_purchase_days) || 0,
      tags: Array.isArray(c.tags) ? c.tags.join(",") : (c.tags || "string"),
      churn_probability: Number(c.churn_probability) || 0,
    }));

    // Call FastAPI recommendation endpoint
    const response = await axios.post(
      "http://127.0.0.1:8001/recommend",
      payload
    );

    // Combine recommendations with original customer data
    const results = customers.map((c, index) => ({
      ...c,
      recommendations: response.data[index]?.recommendations || [],
      cluster_id: response.data[index]?.cluster_id || null,
    }));

    res.json(results);
  } catch (error) {
    console.error("❌ Error fetching recommendations:");
    if (error.response) {
      console.error("Response:", error.response.data);
    } else {
      console.error(error.message);
    }
    res.status(500).json({ error: "Recommendation fetch failed" });
  }
};