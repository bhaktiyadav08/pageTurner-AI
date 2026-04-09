# 📚 PageTurner - AI-Powered Book Discovery Platform

An intelligent e-commerce platform that tracks user behavior in real-time, engineers ML features, and provides personalized book recommendations using machine learning.

## 🎯 Project Overview

**PageTurner** is a feature engineering and machine learning project that demonstrates:
- Real-time user behavior tracking
- Feature engineering (18+ behavioral features)
- ML-powered predictions (Random Forest)
- Personalized recommendations
- Reading personality profiling

**Built for:** Feature Engineering Course Certificate Project  
**Tech Stack:** React, FastAPI, scikit-learn, Google Books API

---

## ✨ Key Features

### 🧠 Machine Learning
- **Real-time Feature Engineering** - 18 behavioral features calculated live
- **Conversion Prediction** - Random Forest model (95% accuracy)
- **Personality Profiling** - 7 reading personality types
- **Smart Recommendations** - ML-powered book suggestions

### 📊 Analytics Dashboard
- **Behavior Tracking** - Scroll depth, hover duration, click patterns
- **Feature Visualization** - Live ML features display
- **Session Analytics** - Engagement metrics and insights
- **Data Export** - CSV export for model training

### 🎨 User Experience
- **40+ Books** - Fetched from Google Books API
- **Smart Search** - Real-time search with API integration
- **Genre Filtering** - 6+ genres (Fiction, Thriller, Sci-Fi, etc.)
- **Reading Personality** - Personalized profile based on behavior
- **Wishlist & Cart** - Full e-commerce functionality

---

## 🏗️ Architecture
```
 FRONTEND (React)                  
 • Behavior Tracking                            
 • Feature Engineering (JavaScript)             
 • Real-time UI Updates      
           |
           |  HTTP (Features JSON)
           ↓
  BACKEND (FastAPI)                  
  • ML Model Serving                            
  • Prediction API                               
  • Random Forest Classifier
            │
            │ Google Books API
            ↓
  EXTERNAL SERVICES                      
  • Google Books (Book Data)                    
  • Real-time Book Search    
  ```
  ## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16+)
- **Python** (3.8+)
- **npm** or **yarn**

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/pageturner-ai.git
cd pageturner-ai
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

#### 3. Setup Backend
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train ML model
python train_model.py

# Start backend
python main.py
```
Backend runs at: `http://localhost:8000`

---

## 📁 Project Structure
```
pageturner-ai/
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # UI Components
│   │   │   ├── BookCard.jsx
│   │   │   ├── PersonalityProfile.jsx
│   │   │   ├── PredictionPanel.jsx
│   │   │   └── ...
│   │   ├── utils/             # Feature Engineering
│   │   │   ├── tracker.js     # Behavior tracking
│   │   │   ├── featureEngineer.js  # 18 features
│   │   │   ├── predictor.js   # ML predictions
│   │   │   └── personalityAnalyzer.js
│   │   ├── services/
│   │   │   └── bookService.js # Google Books API
│   │   └── App.jsx
│   └── package.json
│
├── backend/                    # Python Backend
│   ├── main.py                # FastAPI server
│   ├── train_model.py         # ML training
│   ├── model.pkl              # Trained model
│   ├── feature_names.json     # Feature list
│   └── requirements.txt
│
├── README.md
├── FEATURES.md                # Feature engineering docs
└── .gitignore
```

---

## 🧪 Feature Engineering

### 18 Behavioral Features

| Category | Features |
|----------|----------|
| **Engagement** | total_events, session_duration, events_per_minute |
| **Exploration** | unique_books_viewed, unique_genres_explored, genre_switches |
| **Intent** | books_added_to_cart, view_to_cart_ratio, cart_abandonment_risk |
| **Behavior** | avg_hover_duration, total_hover_time, high_engagement_books |
| **Timing** | time_to_first_hover, time_to_first_cart |
| **Diversity** | genre_entropy, exploration_score, genre_focus_score |
| **Preference** | price_sensitivity, max_scroll_depth |
