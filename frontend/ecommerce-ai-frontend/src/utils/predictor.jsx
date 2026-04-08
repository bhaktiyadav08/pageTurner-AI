import featureEngineer from './featureEngineer';
import tracker from './tracker';

const API_URL = 'http://localhost:8000';  // Backend URL

class Predictor {
  constructor() {
    this.featureEngineerInstance = featureEngineer;
    this.trackerInstance = tracker;
    this.useBackend = true;  // Toggle to use ML backend
  }

  // Main prediction function
  async predictUserIntent() {
    const features = this.featureEngineerInstance.calculateFeatures();
    
    if (this.useBackend) {
      // Use real ML model from backend
      return await this.getMLPrediction(features);
    } else {
      // Fallback to rule-based (old code)
      return this.getRuleBasedPrediction(features);
    }
  }

  // NEW: Get prediction from ML backend
  async getMLPrediction(features) {
    try {
      const sessionId = this.trackerInstance.sessionId;
      
      // Prepare request
      const requestBody = {
        session_id: sessionId,
        features: features,
        timestamp: Date.now()
      };

      // Call backend API
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const prediction = await response.json();

      // Transform backend response to match our format
      return {
        willConvert: prediction.will_convert,
        conversionProbability: prediction.conversion_probability,
        bounceRisk: this.calculateBounceRisk(features),  // Still use local calculation
        recommendationConfidence: prediction.confidence * 100,
        userPersona: this.identifyUserPersona(features),
        suggestedAction: this.decideBestAction(features, prediction.conversion_probability, this.calculateBounceRisk(features)),
        modelVersion: prediction.model_version,
        predictionTime: prediction.prediction_time,
        topFeatures: prediction.feature_importance,
        source: 'ML_MODEL'  // Indicates real ML
      };

    } catch (error) {
      console.warn('ML prediction failed, using rule-based fallback:', error);
      // Fallback to rule-based if backend is down
      return this.getRuleBasedPrediction(features);
    }
  }

  // OLD: Rule-based prediction (fallback)
  getRuleBasedPrediction(features) {
    const conversionProbability = this.calculateConversionProbability(features);
    const bounceRisk = this.calculateBounceRisk(features);
    
    return {
      willConvert: conversionProbability > 0.6,
      conversionProbability: conversionProbability,
      bounceRisk: bounceRisk,
      recommendationConfidence: this.calculateRecommendationConfidence(features),
      userPersona: this.identifyUserPersona(features),
      suggestedAction: this.decideBestAction(features, conversionProbability, bounceRisk),
      source: 'RULE_BASED'  // Indicates fallback
    };
  }

  // Calculate conversion probability (rule-based - FALLBACK ONLY)
  calculateConversionProbability(features) {
    let score = 0;
    
    if (features.books_added_to_cart > 0) score += 0.4;
    if (features.high_engagement_books > 0) score += 0.2;
    if (features.avg_hover_duration > 2000) score += 0.15;
    if (features.session_duration_seconds > 60) score += 0.1;
    if (features.view_to_cart_ratio > 0.3) score += 0.1;
    if (features.unique_books_viewed > 3) score += 0.05;
    
    if (features.cart_abandonment_risk > 50) score -= 0.2;
    if (features.exploration_score > 80) score -= 0.1;
    if (features.session_duration_seconds < 20) score -= 0.15;
    if (features.price_sensitivity > 70) score -= 0.05;
    
    return Math.max(0, Math.min(1, score));
  }

  // Calculate bounce risk (still used even with ML)
  calculateBounceRisk(features) {
    let risk = 50;
    
    if (features.session_duration_seconds < 30) risk += 30;
    if (features.unique_books_viewed < 2) risk += 20;
    if (features.avg_hover_duration < 1000) risk += 15;
    if (features.max_scroll_depth < 25) risk += 10;
    
    if (features.books_added_to_cart > 0) risk -= 40;
    if (features.high_engagement_books > 2) risk -= 20;
    if (features.session_duration_seconds > 120) risk -= 15;
    
    return Math.max(0, Math.min(100, risk));
  }

  // Calculate recommendation confidence
  calculateRecommendationConfidence(features) {
    let confidence = 50;
    
    if (features.unique_books_viewed > 5) confidence += 20;
    if (features.unique_genres_explored > 2) confidence += 15;
    if (features.session_duration_seconds > 90) confidence += 10;
    if (features.genre_focus_score > 30) confidence += 15;
    if (features.high_engagement_books > 1) confidence += 10;
    
    if (features.exploration_score > 85) confidence -= 20;
    if (features.genre_entropy > 2.5) confidence -= 10;
    
    return Math.max(0, Math.min(100, confidence));
  }

  // Identify user persona
  identifyUserPersona(features) {
    if (features.exploration_score > 70 && features.books_added_to_cart === 0) {
      return {
        type: 'browser',
        label: '🔍 The Browser',
        description: 'Exploring widely, needs guidance',
        strategy: 'Show curated recommendations and social proof'
      };
    }
    
    if (features.view_to_cart_ratio > 0.4 && features.session_duration_seconds < 120) {
      return {
        type: 'decisive',
        label: '🎯 Decisive Buyer',
        description: 'Quick decision maker',
        strategy: 'Streamline checkout, show urgency'
      };
    }
    
    if (features.avg_hover_duration > 3000 && features.unique_books_viewed > 4) {
      return {
        type: 'researcher',
        label: '📚 The Researcher',
        description: 'Thorough, values details',
        strategy: 'Provide detailed info, comparisons'
      };
    }
    
    if (features.genre_focus_score > 40 && features.unique_genres_explored <= 2) {
      return {
        type: 'loyalist',
        label: '❤️ Genre Loyalist',
        description: 'Strong preferences, genre-focused',
        strategy: 'Double down on favorite genre'
      };
    }
    
    if (features.price_sensitivity > 70) {
      return {
        type: 'bargain_hunter',
        label: '💰 Bargain Hunter',
        description: 'Price conscious shopper',
        strategy: 'Show deals, bundles, discounts'
      };
    }
    
    return {
      type: 'new_visitor',
      label: '👋 New Visitor',
      description: 'Just getting started',
      strategy: 'Guide with bestsellers and popular picks'
    };
  }

  // Decide best action
  decideBestAction(features, conversionProb, bounceRisk) {
    if (bounceRisk > 70) {
      return {
        action: 'show_exit_intent',
        message: 'Wait! Get 15% off your first purchase',
        discount: 15,
        urgency: 'high'
      };
    }
    
    if (features.books_added_to_cart > 0 && features.cart_abandonment_risk > 50) {
      return {
        action: 'cart_reminder',
        message: 'Complete your purchase - Free shipping on orders over $25!',
        incentive: 'free_shipping',
        urgency: 'medium'
      };
    }
    
    if (features.high_engagement_books > 2 && features.books_added_to_cart === 0) {
      return {
        action: 'personalized_recommendation',
        message: 'Based on your interests, you might love these!',
        urgency: 'low'
      };
    }
    
    if (conversionProb > 0.75) {
      return {
        action: 'none',
        message: 'User is on track to convert - don\'t interrupt',
        urgency: 'none'
      };
    }
    
    return {
      action: 'browse_suggestion',
      message: 'Popular in your favorite genres',
      urgency: 'low'
    };
  }

  // Get prediction summary
  async getPredictionSummary() {
    const prediction = await this.predictUserIntent();
    
    return {
      prediction: prediction,
      timestamp: Date.now(),
      confidence: prediction.recommendationConfidence
    };
  }

  // Check if backend is available
  async checkBackendHealth() {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Track real conversion
  async trackConversion(sessionId) {
    if (!this.useBackend) return;
    try {
      await fetch(`${API_URL}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId })
      });
      console.log('✅ Conversion tracked in backend');
    } catch (e) {
      console.warn('Failed to track conversion:', e);
    }
  }
}


// Create singleton
const predictor = new Predictor();

export default predictor;