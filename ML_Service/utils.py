import joblib
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH = os.getenv("MODEL_PATH", "models/churn_model.pkl")
model = joblib.load(MODEL_PATH)

def predict_churn(customer_data: dict) -> dict:
    """
    Input: dictionary of customer features
    Output: dictionary with predicted class and churn probability
    """
    df = pd.DataFrame([customer_data])
    pred_class = model.predict(df)[0]
    pred_prob = model.predict_proba(df)[:, 1][0]
    return {"predicted_class": int(pred_class), "churn_probability": float(pred_prob)}
