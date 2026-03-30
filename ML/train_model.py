import pandas as pd
import joblib
import re

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

print("Training model...\n")


# ----------------------------
# Log cleaning
# ----------------------------
def clean_log(log):

    log = log.lower()

    log = re.sub(r"\d+", "", log)

    log = re.sub(r"[^\w\s]", "", log)

    log = re.sub(r"\s+", " ", log).strip()

    return log


# ----------------------------
# Load dataset
# ----------------------------
df = pd.read_csv("aiops_large_dataset_50000.csv")

df = df.drop_duplicates()

print("Dataset size:", len(df))


# Clean logs
df["log_message"] = df["log_message"].apply(clean_log)


# ----------------------------
# Add simulated metrics if not present
# ----------------------------
if "cpu" not in df.columns:

    import numpy as np

    df["cpu"] = np.random.uniform(10, 95, len(df))
    df["memory"] = np.random.uniform(20, 95, len(df))
    df["disk"] = np.random.uniform(10, 90, len(df))


# ----------------------------
# Features
# ----------------------------
X = df[["log_message", "cpu", "memory", "disk"]]
y = df["root_cause"]


# ----------------------------
# Train/Test split
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y

)


# ----------------------------
# Feature processing
# ----------------------------
preprocessor = ColumnTransformer(

    transformers=[

        (
            "text",
            TfidfVectorizer(
                max_features=60000,
                ngram_range=(1,3),
                stop_words="english"
            ),
            "log_message"
        ),

        (
            "metrics",
            StandardScaler(),
            ["cpu", "memory", "disk"]
        )

    ]

)


# ----------------------------
# ML pipeline
# ----------------------------
model = Pipeline([

    ("features", preprocessor),

    (
        "classifier",
        LogisticRegression(
            max_iter=2000,
            solver="lbfgs",
            n_jobs=-1
        )
    )

])


# ----------------------------
# Train
# ----------------------------
model.fit(X_train, y_train)


# ----------------------------
# Evaluate
# ----------------------------
y_pred = model.predict(X_test)

print("\nModel Evaluation:\n")

print(classification_report(y_test, y_pred))


# ----------------------------
# Save model
# ----------------------------
joblib.dump(model, "aiops_root_cause_model.pkl")

print("\nModel saved successfully ✅")