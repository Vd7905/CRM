from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from schemas import CustomerData, ChurnPrediction
from utils import predict_churn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CRM ML Service - Churn Prediction")

# Allow Express backend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],  # or your Express backend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict-churn", response_model=List[ChurnPrediction])
def batch_churn_endpoint(customers: List[CustomerData] = Body(...)):
    results = [predict_churn(customer.dict()) for customer in customers]
    return results

if __name__ == "__main__":
    import uvicorn
    PORT = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=True)
