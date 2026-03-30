from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import re
import os

print("RUNNING FILE:", os.path.abspath(__file__))

app = Flask(__name__)

# -----------------------------
# Load trained ML model
# -----------------------------
model = joblib.load("aiops_root_cause_model.pkl")

print("MODEL STEPS:", model.named_steps)

# ✅ Extract TF-IDF from ColumnTransformer
vectorizer = model.named_steps["features"].named_transformers_["text"]

# -----------------------------
# Load Dataset
# -----------------------------
BASE_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(BASE_DIR, "aiops_large_dataset_50000.csv")

df = pd.read_csv(DATASET_PATH)

# -----------------------------
# Log Cleaning Function
# -----------------------------
def clean_log(log):
    log = str(log).lower()
    log = re.sub(r"\d+", "", log)
    log = re.sub(r"[^\w\s]", "", log)
    log = re.sub(r"\s+", " ", log).strip()
    return log

# Clean dataset logs
df["log_message"] = df["log_message"].astype(str).apply(clean_log)

# Precompute dataset vectors
dataset_vectors = vectorizer.transform(df["log_message"])

# -----------------------------
# Scale Probability
# -----------------------------
def scale_probability(prob):
    scaled = 65 + (prob * 30)
    return min(round(scaled), 95)

# -----------------------------
# Prediction API
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data or "log" not in data:
        return jsonify({"error": "Provide 'log' field"}), 400

    log_text = data["log"]

    # Clean input log
    cleaned_log = clean_log(log_text)

    # Convert to vector
    input_vector = vectorizer.transform([cleaned_log])

    # Compute similarity
    similarity = (dataset_vectors * input_vector.T).toarray().flatten()

    # 🔥 NEW: remove duplicate predictions
    seen = set()
    top_predictions = []

    for i in similarity.argsort()[::-1]:  # highest similarity first

        message = str(df.iloc[i]["log_message"])

        # skip duplicate messages
        if message in seen:
            continue

        seen.add(message)

        prob = scale_probability(similarity[i])

        top_predictions.append({
            "root_cause": message,                         # ✅ real error message
            "label": str(df.iloc[i]["root_cause"]),       # optional
            "probability": f"{prob}%"
        })

        # stop at 3 unique predictions
        if len(top_predictions) == 3:
            break

    return jsonify({
        "predicted_root_cause": top_predictions[0]["root_cause"],
        "probability_percentage": top_predictions[0]["probability"],
        "top_predictions": top_predictions
    })

# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    app.run(port=5050)