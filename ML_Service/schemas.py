from pydantic import BaseModel
from typing import Optional, List

class CustomerData(BaseModel):
    customer_id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    total_spent: float
    order_count: int
    average_order_value: Optional[float] = None
    recency: int
    tenure: int
    last_purchase_days: Optional[int] = None
    tags: Optional[str] = None
    churn_probability: Optional[float] = None

class ChurnPrediction(BaseModel):
    customer_id: Optional[str]
    predicted_class: int
    churn_probability: float

class RecommendationResponse(BaseModel):
    customer_id: Optional[str]
    cluster_id: int
    recommendations: List[str]