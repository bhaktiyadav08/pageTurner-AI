from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import pickle
import numpy as np
import json
from datetime import datetime
import pandas as pd 
# Initialize FastAPI app
app = FastAPI(
    title="PageTurner ML API",
    description="Real-time user behavior prediction API",
    version="1.0.0"
)

# Enable CORS (so frontend can talk to backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully!")
except FileNotFoundError:
    print("⚠️ Model not found! Run train_model.py first.")
    model = None

# Load feature names
try:
    with open('feature_names.json', 'r') as f:
        FEATURE_NAMES = json.load(f)
    print(f"✅ Feature names loaded: {len(FEATURE_NAMES)} features")
except FileNotFoundError:
    print("⚠️ Feature names not found!")
    FEATURE_NAMES = []

# Pydantic models for request/response
class Features(BaseModel):
    total_events: int
    session_duration_seconds: int
    events_per_minute: float
    unique_books_viewed: int
    unique_genres_explored: int
    books_added_to_cart: int
    avg_hover_duration: float
    total_hover_time: float
    max_scroll_depth: float
    genre_switches: int
    view_to_cart_ratio: float
    time_to_first_hover: Optional[float]
    time_to_first_cart: Optional[float]
    genre_entropy: float
    exploration_score: float
    high_engagement_books: int
    cart_abandonment_risk: float
    genre_focus_score: float
    price_sensitivity: float

class PredictionRequest(BaseModel):
    session_id: str
    features: Features
    timestamp: Optional[int] = None

class PredictionResponse(BaseModel):
    session_id: str
    will_convert: bool
    conversion_probability: float
    confidence: float
    model_version: str
    prediction_time: str
    feature_importance: Optional[Dict[str, float]] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    features_count: int
    version: str

# Store predictions for analytics (in-memory, use database in production)
predictions_log = []

# === API ENDPOINTS ===

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "model_loaded": model is not None,
        "features_count": len(FEATURE_NAMES),
        "version": "1.0.0"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "features_count": len(FEATURE_NAMES),
        "version": "1.0.0"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_conversion(request: PredictionRequest):
    """
    Main prediction endpoint
    Receives user features and returns ML prediction
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Extract features in correct order
        features_dict = request.features.model_dump()
        
        # Handle None values (time_to_first_cart might be None)
        feature_values = []
        for feature_name in FEATURE_NAMES:
            value = features_dict.get(feature_name)
            if value is None:
                value = -1  # Use -1 for missing values (same as training)
            feature_values.append(value)
        
        # Convert to numpy array
        X = pd.DataFrame([feature_values], columns=FEATURE_NAMES)
        
        # Make prediction
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0]
        
        # Calculate confidence (distance from decision boundary)
        confidence = abs(probability[1] - 0.5) * 2  # 0 = uncertain, 1 = very confident
        
        # Get feature importance for this prediction
        feature_importance = dict(zip(
            FEATURE_NAMES, 
            model.feature_importances_
        ))
        
        # Sort by importance
        top_features = dict(sorted(
            feature_importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5])  # Top 5 features
        
        # Create response
        response = {
            "session_id": request.session_id,
            "will_convert": bool(prediction),
            "conversion_probability": float(probability[1]),
            "confidence": float(confidence),
            "model_version": "RandomForest_v1.0",
            "prediction_time": datetime.now().isoformat(),
            "feature_importance": top_features
        }
        
        # Log prediction
        predictions_log.append({
            **response,
            "features": features_dict,
            "timestamp": datetime.now().isoformat()
        })
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/analytics/predictions")
async def get_predictions_log():
    """Get all predictions made (for debugging)"""
    return {
        "total_predictions": len(predictions_log),
        "recent_predictions": predictions_log[-10:],  # Last 10
        "conversion_rate": sum(1 for p in predictions_log if p['will_convert']) / len(predictions_log) if predictions_log else 0
    }

@app.get("/model/info")
async def model_info():
    """Get model information"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "model_type": str(type(model).__name__),
        "n_estimators": model.n_estimators if hasattr(model, 'n_estimators') else None,
        "max_depth": model.max_depth if hasattr(model, 'max_depth') else None,
        "features": FEATURE_NAMES,
        "feature_count": len(FEATURE_NAMES)
    }

@app.get("/model/feature-importance")
async def get_feature_importance():
    """Get feature importance from trained model"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    importance = dict(zip(FEATURE_NAMES, model.feature_importances_))
    sorted_importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
    
    return {
        "feature_importance": sorted_importance,
        "top_5_features": dict(list(sorted_importance.items())[:5])
    }

# === Advanced Endpoints ===

@app.post("/batch-predict")
async def batch_predict(requests: List[PredictionRequest]):
    """Predict multiple sessions at once"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    predictions = []
    for req in requests:
        try:
            pred = await predict_conversion(req)
            predictions.append(pred)
        except Exception as e:
            predictions.append({
                "session_id": req.session_id,
                "error": str(e)
            })
    
    return {
        "total_predictions": len(predictions),
        "predictions": predictions
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting PageTurner ML API...")
    print("📡 API will be available at: http://localhost:8000")
    print("📚 Docs available at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)