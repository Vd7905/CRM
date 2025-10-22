from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from schemas import CustomerData, ChurnPrediction, RecommendationResponse
from utils import predict_churn, get_recommendation
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CRM ML Service - Churn + Recommendation")

# Allow Express backend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],  # your Express backend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Churn Prediction ---------------- #
@app.post("/predict-churn", response_model=List[ChurnPrediction])
def batch_churn_endpoint(customers: List[CustomerData] = Body(...)):
    results = [predict_churn(customer.dict()) for customer in customers]
    return results


# ---------------- Recommendation ---------------- #
@app.post("/recommend", response_model=List[RecommendationResponse])
def batch_recommend_endpoint(customers: List[CustomerData] = Body(...)):
    results = []
    for customer in customers:
        cluster_id, recommendation = get_recommendation(customer.dict())
        results.append(
            RecommendationResponse(
                customer_id=customer.customer_id,       # make sure CustomerData has customer_id
                cluster_id=cluster_id,
                recommendations=[recommendation]        # wrap string in list
            )
        )
    return results



if __name__ == "__main__":
    import uvicorn
    PORT = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=True)
