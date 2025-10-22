import joblib
import pandas as pd
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Load churn model
CHURN_MODEL_PATH = os.getenv("CHURN_MODEL_PATH", "models/churn_model.pkl")
churn_model = joblib.load(CHURN_MODEL_PATH)

# Load recommender model + cluster-to-recommendation map
RECOMMENDER_MODEL_PATH = os.getenv("RECOMMENDER_MODEL_PATH", "models/recommender_pipeline.pkl")
RECOMMENDATION_MAP_PATH = os.getenv("RECOMMENDATION_MAP_PATH", "models/recommendation_map.json")

pipeline = joblib.load(RECOMMENDER_MODEL_PATH)
with open(RECOMMENDATION_MAP_PATH, "r") as f:
    recommendation_map = json.load(f)


CHURN_FEATURES = [
    "total_spent",
    "order_count",
    "average_order_value",
    "recency",
    "tenure"
]

def predict_churn(customer_dict):
    # Only select the features your churn model expects
    features = {feat: customer_dict.get(feat, 0) for feat in CHURN_FEATURES}
    df = pd.DataFrame([features])
    pred_class = churn_model.predict(df)[0]
    pred_prob = churn_model.predict_proba(df)[0][1]
    return {
        "customer_id": customer_dict.get("customer_id"),
        "predicted_class": int(pred_class),
        "churn_probability": float(pred_prob)
    }

EXPECTED_FEATURES = [
    "age",
    "gender",
    "occupation",
    "total_spent",
    "order_count",
    "last_purchase_days",
    "tags",
    "churn_probability"
]

def get_recommendation(customer_dict):
    # Ensure the input matches the expected features and order
    features = [customer_dict.get(feat, None) for feat in EXPECTED_FEATURES]
    sample_df = pd.DataFrame([dict(zip(EXPECTED_FEATURES, features))])
    cluster_id = pipeline.predict(sample_df)[0]
    return cluster_id, recommendation_map[str(cluster_id)]

