import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import featureEngineer from '../utils/featureEngineer';

function FeaturesPanel() {
  const [featureData, setFeatureData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Update features every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const data = featureEngineer.getFeatureSummary();
      setFeatureData(data);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!featureData) return null;

  const { features, labels } = featureData;

  return (
    <div className="features-panel">
      <button 
        className="features-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '🧪 Hide Features' : '🧪 Show ML Features'}
      </button>

      {isOpen && (
        <div className="features-content">
          <div className="ml-floating-panel-header">
            <h3>🧠 Engineered Features (Real-time)</h3>
            <button
              type="button"
              className="ml-floating-panel-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Key Metrics */}
          <div className="features-grid">
            <FeatureCard 
              label="Exploration Score"
              value={features.exploration_score}
              max={100}
              color="purple"
            />
            <FeatureCard 
              label="Genre Diversity"
              value={features.genre_entropy.toFixed(2)}
              max={3}
              color="blue"
            />
            <FeatureCard 
              label="Abandonment Risk"
              value={`${features.cart_abandonment_risk}%`}
              isRisk={true}
            />
          </div>

          {/* All Features List */}
          <div className="features-list">
            <h4>📊 All Features</h4>
            {Object.entries(features).map(([key, value]) => (
              <div key={key} className="feature-row">
                <span className="feature-label">{labels[key]}</span>
                <span className="feature-value">
                  {typeof value === 'number' ? 
                    (Number.isInteger(value) ? value : value.toFixed(2)) 
                    : (value || 'N/A')}
                </span>
              </div>
            ))}
          </div>

          <div className="features-note">
            💡 These features will be used for ML predictions
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for feature cards
function FeatureCard({ label, value, max, color, isRisk }) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const percentage = max ? (numValue / max) * 100 : null;
  
  let cardColor = color || 'gold';
  if (isRisk) {
    cardColor = numValue > 50 ? 'red' : 'green';
  }

  return (
    <div className={`feature-card feature-${cardColor}`}>
      <div className="feature-card-value">{value}</div>
      <div className="feature-card-label">{label}</div>
      {percentage !== null && (
        <div className="feature-card-bar">
          <div 
            className="feature-card-fill"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default FeaturesPanel;