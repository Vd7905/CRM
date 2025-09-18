from pydantic import BaseModel
from typing import List

# Customer features
class CustomerData(BaseModel):
    total_spent: float
    order_count: int
    average_order_value: float
    recency: int
    tenure: int

# Churn prediction response
class ChurnPrediction(BaseModel):
    predicted_class: int
    churn_probability: float
