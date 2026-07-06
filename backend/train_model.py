import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib

# Load data
print("Loading data...")
df = pd.read_csv('this_one_balanced.csv')

# Drop redundant features as requested
redundant_features = ['domain', 'domain_id', 'ip_address', 'threat_type', 
                      'blacklist_source', 'severity', 'status', 
                      'recommended_action', 'detection_timestamp']
df = df.drop(columns=redundant_features, errors='ignore')

# Separate X and y
X = df.drop(columns=['risk_score'])
y = df['risk_score']

# Identify categorical features
categorical_features = X.select_dtypes(include=['object']).columns.tolist()
print(f"Categorical features identified: {categorical_features}")

# The ColumnTransformer will output the categorical columns first, then the numeric ones.
# So the categorical indices for HistGradientBoosting in the transformed dataset will be 0 to len(categorical_features) - 1.
cat_indices = list(range(len(categorical_features)))

# Preprocessing: ordinal encode categorical features
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), categorical_features)
    ],
    remainder='passthrough'
)

# Define the HistGradientBoosting model
model = HistGradientBoostingRegressor(
    categorical_features=cat_indices,
    random_state=42,
    max_iter=200,
    learning_rate=0.1
)

# Create the full pipeline
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', model)
])

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the pipeline
print("Training the HistGradientBoosting pipeline...")
pipeline.fit(X_train, y_train)

# Evaluate
print("Evaluating the model...")
y_pred = pipeline.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print("-" * 30)
print("Model Evaluation:")
print(f"RMSE:     {rmse:.4f}")
print(f"MAE:      {mae:.4f}")
print(f"R2 Score: {r2:.4f}")
print("-" * 30)

# Save the pipeline
model_filename = 'hist_gradient_boosting_pipeline.pkl'
joblib.dump(pipeline, model_filename)
print(f"Pipeline successfully saved to {model_filename}")
