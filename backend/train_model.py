import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os
import sqlite3
import json

class ModelTrainer:
    def __init__(self):
        self.model = None
        self.feature_names = [
            'total_events',
            'session_duration_seconds',
            'events_per_minute',
            'unique_books_viewed',
            'unique_genres_explored',
            'books_added_to_cart',
            'avg_hover_duration',
            'total_hover_time',
            'max_scroll_depth',
            'genre_switches',
            'view_to_cart_ratio',
            'time_to_first_hover',
            'time_to_first_cart',
            'genre_entropy',
            'exploration_score',
            'high_engagement_books',
            'cart_abandonment_risk',
            'genre_focus_score',
            'price_sensitivity'
        ]
    
    def generate_synthetic_data(self, n_samples=1000):
        """
        Generate synthetic training data based on realistic patterns
        Later you'll replace this with real exported data!
        """
        np.random.seed(42)
        
        data = []
        
        for i in range(n_samples):
            # Simulate different user types
            user_type = np.random.choice(['converter', 'browser', 'bouncer'], 
                                        p=[0.25, 0.50, 0.25])
            
            if user_type == 'converter':
                # High intent users
                session = {
                    'total_events': np.random.randint(15, 40),
                    'session_duration_seconds': np.random.randint(90, 300),
                    'events_per_minute': np.random.uniform(8, 15),
                    'unique_books_viewed': np.random.randint(5, 12),
                    'unique_genres_explored': np.random.randint(2, 4),
                    'books_added_to_cart': np.random.randint(1, 4),
                    'avg_hover_duration': np.random.uniform(2000, 4000),
                    'total_hover_time': np.random.uniform(8000, 20000),
                    'max_scroll_depth': np.random.uniform(60, 100),
                    'genre_switches': np.random.randint(2, 6),
                    'view_to_cart_ratio': np.random.uniform(0.3, 0.8),
                    'time_to_first_hover': np.random.uniform(2, 10),
                    'time_to_first_cart': np.random.uniform(30, 120),
                    'genre_entropy': np.random.uniform(1.0, 2.0),
                    'exploration_score': np.random.uniform(40, 70),
                    'high_engagement_books': np.random.randint(2, 6),
                    'cart_abandonment_risk': np.random.uniform(0, 40),
                    'genre_focus_score': np.random.uniform(30, 60),
                    'price_sensitivity': np.random.uniform(20, 60),
                    'converted': 1
                }
            
            elif user_type == 'browser':
                # Exploring but not buying
                session = {
                    'total_events': np.random.randint(10, 25),
                    'session_duration_seconds': np.random.randint(60, 180),
                    'events_per_minute': np.random.uniform(5, 10),
                    'unique_books_viewed': np.random.randint(6, 15),
                    'unique_genres_explored': np.random.randint(3, 6),
                    'books_added_to_cart': 0,
                    'avg_hover_duration': np.random.uniform(1200, 2500),
                    'total_hover_time': np.random.uniform(5000, 12000),
                    'max_scroll_depth': np.random.uniform(40, 80),
                    'genre_switches': np.random.randint(5, 12),
                    'view_to_cart_ratio': 0,
                    'time_to_first_hover': np.random.uniform(3, 15),
                    'time_to_first_cart': None,
                    'genre_entropy': np.random.uniform(2.0, 3.0),
                    'exploration_score': np.random.uniform(70, 95),
                    'high_engagement_books': np.random.randint(0, 3),
                    'cart_abandonment_risk': 0,
                    'genre_focus_score': np.random.uniform(10, 30),
                    'price_sensitivity': np.random.uniform(40, 80),
                    'converted': 0
                }
            
            else:  # bouncer
                # Quick exit
                session = {
                    'total_events': np.random.randint(2, 8),
                    'session_duration_seconds': np.random.randint(10, 60),
                    'events_per_minute': np.random.uniform(2, 6),
                    'unique_books_viewed': np.random.randint(1, 4),
                    'unique_genres_explored': np.random.randint(1, 2),
                    'books_added_to_cart': 0,
                    'avg_hover_duration': np.random.uniform(500, 1500),
                    'total_hover_time': np.random.uniform(1000, 4000),
                    'max_scroll_depth': np.random.uniform(10, 40),
                    'genre_switches': np.random.randint(0, 3),
                    'view_to_cart_ratio': 0,
                    'time_to_first_hover': np.random.uniform(5, 20),
                    'time_to_first_cart': None,
                    'genre_entropy': np.random.uniform(0, 1.0),
                    'exploration_score': np.random.uniform(10, 40),
                    'high_engagement_books': 0,
                    'cart_abandonment_risk': 0,
                    'genre_focus_score': np.random.uniform(5, 20),
                    'price_sensitivity': np.random.uniform(50, 90),
                    'converted': 0
                }
            
            data.append(session)
        
        df = pd.DataFrame(data)
        
        # Handle None values for time_to_first_cart
        df['time_to_first_cart'] = df['time_to_first_cart'].fillna(-1)
        
        return df
    
    def train(self, df):
        """Train the model"""
        print("🎯 Starting model training...")
        
        # Separate features and target
        X = df[self.feature_names]
        y = df['converted']
        
        print(f"📊 Dataset: {len(df)} samples")
        print(f"   - Converters: {y.sum()} ({y.mean()*100:.1f}%)")
        print(f"   - Non-converters: {len(y) - y.sum()} ({(1-y.mean())*100:.1f}%)")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        print("🔨 Training Random Forest...")
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_acc = accuracy_score(y_train, self.model.predict(X_train))
        test_acc = accuracy_score(y_test, self.model.predict(X_test))
        
        print(f"\n✅ Training Accuracy: {train_acc*100:.2f}%")
        print(f"✅ Test Accuracy: {test_acc*100:.2f}%")
        
        # Feature importance
        importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\n📊 Top 10 Most Important Features:")
        print(importance.head(10).to_string(index=False))
        
        # Classification report
        y_pred = self.model.predict(X_test)
        print("\n📈 Classification Report:")
        print(classification_report(y_test, y_pred, 
                                   target_names=['Not Convert', 'Convert']))
        
        return test_acc
    
    def save_model(self, path='model.pkl'):
        """Save trained model"""
        if self.model is None:
            raise ValueError("No model to save! Train first.")
        
        with open(path, 'wb') as f:
            pickle.dump(self.model, f)
        
        print(f"\n💾 Model saved to {path}")
    
    def save_feature_names(self, path='feature_names.json'):
        """Save feature names for frontend"""
        with open(path, 'w') as f:
            json.dump(self.feature_names, f)
        
        print(f"💾 Feature names saved to {path}")

if __name__ == "__main__":
    print("🚀 PageTurner ML Model Training\n")
    
    trainer = ModelTrainer()
    
    # Load from DB if available and has enough data
    db_path = 'pageturner.db'

    df = None
    use_synthetic = True
    
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            count = pd.read_sql_query("SELECT COUNT(*) as cnt FROM sessions", conn).iloc[0]['cnt']
            if count >= 50:
                print(f"📊 Loading {count} live sessions from database...")
                df = pd.read_sql_query("SELECT * FROM sessions", conn)
                df['time_to_first_cart'] = df['time_to_first_cart'].fillna(-1)
                use_synthetic = False
            else:
                print(f"⚠️ Only found {count} sessions in DB, need at least 50. Falling back to synthetic data.")
            conn.close()
        except Exception as e:
            print(f"⚠️ Database error: {e}. Falling back to synthetic.")
            
    if use_synthetic:
        # Generate synthetic data
        print("📊 Generating synthetic training data...")
        df = trainer.generate_synthetic_data(n_samples=1000)
    
    # Train model
    trainer.train(df)
    
    # Save model
    trainer.save_model('model.pkl')
    trainer.save_feature_names('feature_names.json')
    
    print("\n✨ Training complete!")
    print("📦 Files created: model.pkl, feature_names.json")