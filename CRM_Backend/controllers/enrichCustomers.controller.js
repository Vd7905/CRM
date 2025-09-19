import axios from "axios";

// Helper for days between dates
function daysBetween(date1, date2) {
  return Math.floor(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
}

// POST /api/customers/enrich
export const enrichCustomers = async (req, res) => {
  try {
    const { segmentId } = req.body;

    if (!segmentId) {
      return res.status(400).json({ message: "segmentId is required" });
    }

    // Step 1: Fetch customers from segment
    const segmentResponse = await axios.get(
      `http://localhost:8000/api/user/get-all-customers/${segmentId}`,
      {
        headers: {
          Authorization: `Bearer ${req.headers.authorization?.split(" ")[1]}`,
        },
      }
    );
    const customers = segmentResponse.data.data || [];
    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers in this segment" });
    }

    const today = new Date();

    // Step 2: Prepare payload for churn prediction (all schema fields)
    const churnPayload = customers.map((c) => {
      const lastPurchase = c.last_purchase ? new Date(c.last_purchase) : null;
      const firstPurchase = c.first_purchase ? new Date(c.first_purchase) : null;
      const recency = lastPurchase ? daysBetween(today, lastPurchase) : 0;
      const tenure = firstPurchase ? daysBetween(today, firstPurchase) : 0;
      return {
        customer_id: c._id || c.customer_id || null,
        age: c.demographics?.age ?? null,
        gender: c.demographics?.gender ?? null,
        occupation: c.demographics?.occupation ?? null,
        total_spent: Number(c.total_spent) || 0,
        order_count: Number(c.order_count) || 0,
        average_order_value: Number(c.average_order_value) || 0,
        recency,
        tenure,
        last_purchase_days: c.last_purchase_days ? Number(c.last_purchase_days) : 0,
        tags: Array.isArray(c.tags) ? c.tags.join(",") : (c.tags || ""),
        churn_probability: null, // Not known yet
      };
    });

    // Step 3: Call FastAPI churn endpoint
    const churnResponse = await axios.post(
      "http://127.0.0.1:8001/predict-churn",
      churnPayload
    );

    // Attach churn predictions to customers
    const customersWithChurn = customers.map((c, index) => ({
      ...c,
      churn_probability: churnResponse.data[index]?.churn_probability || 0,
      predicted_churn: churnResponse.data[index]?.predicted_class || null,
    }));

    // Step 4: Prepare payload for recommendation (all schema fields)
    // ...existing code...
    const recommendPayload = customersWithChurn.map((c) => ({
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
    // ...existing code...
    // Step 5: Call FastAPI recommendation endpoint
    const recommendResponse = await axios.post(
      "http://127.0.0.1:8001/recommend",
      recommendPayload
    );

    // Merge recommendations with customer data
    const enrichedCustomers = customersWithChurn.map((c, index) => ({
      ...c,
      recommendations: recommendResponse.data[index]?.recommendations || [],
      cluster_id: recommendResponse.data[index]?.cluster_id || null,
    }));

    // Step 6: Return final enriched customer list
    res.json(enrichedCustomers);
  } catch (error) {
    console.error("❌ Error enriching customers:");
    if (error.response) {
      console.error("Response:", error.response.data);
    } else {
      console.error(error.message);
    }
    res.status(500).json({ error: "Failed to enrich customers" });
  }
};