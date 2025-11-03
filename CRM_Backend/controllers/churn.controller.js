import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


// 🔹 Helper function to calculate days between dates
const daysBetween = (date1, date2) => {
  if (!date1 || !date2) return 0;
  const diffTime = Math.abs(new Date(date1) - new Date(date2));
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert ms to days
};

// POST /api/churn/predict
export const predictChurn = async (req, res) => {
  try {
    const { segmentId } = req.body; // frontend sends segmentId
  // http://localhost:8000/api/user/get-all-customers
    // 1️⃣ Fetch customers from segment service
   const segmentResponse = await axios.get(
  `https://crm-crm-backend.onrender.com/api/user/get-all-customers/${segmentId}`,
  {
    headers: {
      Authorization: `Bearer ${req.headers.authorization?.split(" ")[1]}`,
    },
  }
);

    const customers = segmentResponse.data.data || [];
   // console.log("Vikas", segmentResponse.data);

    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers in this segment" });
    }

    const today = new Date();

    // 2️⃣ Prepare payload for FastAPI
    const payload = customers.map((c) => {
      const lastPurchase = c.last_purchase ? new Date(c.last_purchase) : null;
      const firstPurchase = c.first_purchase ? new Date(c.first_purchase) : null;

      const recency = lastPurchase ? daysBetween(today, lastPurchase) : 0; // days since last purchase
      const tenure = firstPurchase ? daysBetween(today, firstPurchase) : 0; // days since first purchase

      return {
        total_spent: Number(c.total_spent) || 0,
        order_count: Number(c.order_count) || 0,
        average_order_value: Number(c.average_order_value) || 0,
        recency,
        tenure,
      };
    });
    
const isDocker = process.env.DOCKER_ENV === "true";

const ML_URL = process.env.ML_SERVICE_URL || "https://crm-ml-service.onrender.com";
console.log("🧠 ML Service URL →", ML_URL);

console.log(`🧠 ML Service URL → ${ML_URL}`);


    // 3️⃣ Call FastAPI churn endpoint
    const response = await axios.post(`${ML_URL}/predict-churn`, payload);

    // 👀 Debug: log FastAPI response
    console.log("FastAPI response:", response.data);

    // 4️⃣ Combine predictions with original customer data
    const results = customers.map((c, index) => ({
      ...c,
      predicted_churn: response.data[index]?.predicted_class ?? null,
      churn_probability: response.data[index]?.churn_probability ?? null,
    }));

    // 5️⃣ Send back enriched customers
    res.json(results);
  } catch (error) {
    console.error("❌ Error predicting churn:");
    if (error.response) {
      console.error("Response:", error.response.data);
    } else {
      console.error(error.message);
    }
    res.status(500).json({ error: "Churn prediction failed" });
  }
};
