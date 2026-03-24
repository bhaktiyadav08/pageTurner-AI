import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import predictor from '../utils/predictor';

function PredictionPanel() {
  const [prediction, setPrediction] = useState(null);
  const [isOpen, setIsOpen] = useState(false);  // ← ADD THIS (starts closed)

  // Update prediction every 3 seconds
  useEffect(() => {
  // Initial fetch
  const fetchPrediction = async () => {
    try {
      const predictionData = await predictor.getPredictionSummary();  // ← Add await
      if (predictionData && predictionData.prediction) {
        setPrediction(predictionData.prediction);
      }
    } catch (error) {
      console.error('Prediction fetch error:', error);
    }
  };

  // Fetch immediately
  fetchPrediction();

  // Then fetch every 3 seconds
  const interval = setInterval(fetchPrediction, 3000);

  return () => clearInterval(interval);
}, []);
  if (!prediction) return null;

  return (
    <div className="prediction-panel-wrapper">  {/* ← Changed wrapper */}
      {/* Toggle Button - ADD THIS */}
      <button 
        className="prediction-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '🤖 Hide Predictions' : '🤖 AI Predictions'}
      </button>

      {/* Panel content - only show if open */}
      {isOpen && (
        <div className="prediction-panel">
          <div className="prediction-header prediction-header-row">
            <h3>🤖 AI Predictions</h3>
            <button
              type="button"
              className="ml-floating-panel-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
          <div className="prediction-badges-row">
  {prediction.source && (
    <div className={`model-badge ${prediction.source === 'ML_MODEL' ? 'ml' : 'rules'}`}>
      {prediction.source === 'ML_MODEL' ? '🔬 ML Model' : '📋 Rule-Based'}
    </div>
  )}
  {prediction.modelVersion && (
    <div className="model-version">
      {prediction.modelVersion}
    </div>
  )}
</div>

          <div className="prediction-content">
            {/* Conversion Prediction */}
            <div className="prediction-card">
              <div className="prediction-label">Conversion Probability</div>
              <div className="prediction-value-large">
                {Math.round(prediction.conversionProbability * 100)}%
              </div>
              <div className="prediction-bar">
                <div 
                  className="prediction-fill conversion"
                  style={{ width: `${prediction.conversionProbability * 100}%` }}
                />
              </div>
              <div className="prediction-status">
                {prediction.willConvert ? 
                  '✅ Likely to convert' : 
                  '⚠️ Low conversion signal'}
              </div>
            </div>

            {/* Bounce Risk */}
            <div className="prediction-card">
              <div className="prediction-label">Bounce Risk</div>
              <div className="prediction-value-large">
                {Math.round(prediction.bounceRisk)}%
              </div>
              <div className="prediction-bar">
                <div 
                  className="prediction-fill risk"
                  style={{ width: `${prediction.bounceRisk}%` }}
                />
              </div>
              <div className="prediction-status">
                {prediction.bounceRisk > 70 ? 
                  '🚨 High risk' : 
                  prediction.bounceRisk > 40 ? 
                    '⚠️ Medium risk' : 
                    '✅ Low risk'}
              </div>
            </div>

            {/* User Persona */}
            <div className="persona-card">
              <div className="persona-icon">{prediction.userPersona.label}</div>
              <div className="persona-description">
                {prediction.userPersona.description}
              </div>
              <div className="persona-strategy">
                💡 {prediction.userPersona.strategy}
              </div>
            </div>

            {/* Suggested Action */}
            {prediction.suggestedAction.action !== 'none' && (
              <div className="action-card">
                <div className="action-header">
                  🎯 Suggested Intervention
                </div>
                <div className="action-message">
                  {prediction.suggestedAction.message}
                </div>
                <div className="action-urgency">
                  Urgency: <span className={`urgency-${prediction.suggestedAction.urgency}`}>
                    {prediction.suggestedAction.urgency.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Recommendation Confidence */}
            <div className="confidence-card">
              <div className="confidence-label">
                Recommendation Confidence
              </div>
              <div className="confidence-value">
                {Math.round(prediction.recommendationConfidence)}%
              </div>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${prediction.recommendationConfidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionPanel;