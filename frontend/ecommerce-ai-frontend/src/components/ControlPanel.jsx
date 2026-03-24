import { Brain, X } from 'lucide-react';

import NeuralNetworkButton from './NeuralNetworkButton';
import { useState } from 'react';

function ControlPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePanel = (buttonClass) => {
    const button = document.querySelector(`.${buttonClass}`);
    if (button) {
      button.click();
    }
  };

  const panels = [
    {
      id: 'features',
      icon: '🧬',
      label: 'Feature Engineering',
      description: '18 Real-time Features',
      color: 'purple',
      buttonClass: 'features-toggle'
    },
    {
      id: 'analytics',
      icon: '📊',
      label: 'Behavior Analytics',
      description: 'User Engagement Metrics',
      color: 'gold',
      buttonClass: 'debug-toggle'
    },
    {
      id: 'predictions',
      icon: '🎯',
      label: 'ML Predictions',
      description: 'Random Forest Model',
      color: 'green',
      buttonClass: 'prediction-toggle'
    },
    {
      id: 'export',
      icon: '💾',
      label: 'Export Dataset',
      description: 'Training Data CSV',
      color: 'orange',
      buttonClass: 'export-toggle'
    }
  ];

  return (
    <>
      {/* Neural Network Button */}
      <NeuralNetworkButton 
        onClick={() => setIsExpanded(!isExpanded)}
        isActive={isExpanded}
      />

      {/* Sliding Panel */}
      <div className={`ml-control-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="ml-panel-content">
          {/* Header */}
          <div className="ml-panel-header">
            <div className="header-icon">
              <Brain size={24} />
            </div>
            <div className="header-text">
              <h3>Machine Learning Dashboard</h3>
              <p>Feature Engineering & Model Analytics</p>
            </div>
            <button 
              className="ml-panel-close"
              onClick={() => setIsExpanded(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* System Status */}
          <div className="ml-system-status">
            <div className="status-card">
              <div className="status-metric">
                <span className="metric-value">42</span>
                <span className="metric-label">Books Loaded</span>
              </div>
              <div className="status-indicator active"></div>
            </div>
            <div className="status-card">
              <div className="status-metric">
                <span className="metric-value">RF</span>
                <span className="metric-label">Model Type</span>
              </div>
              <div className="status-indicator active"></div>
            </div>
            <div className="status-card">
              <div className="status-metric">
                <span className="metric-value">95%</span>
                <span className="metric-label">Accuracy</span>
              </div>
              <div className="status-indicator active"></div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="ml-control-buttons">
            <div className="controls-section-title">Developer Tools</div>
            {panels.map((panel) => (
              <button
                key={panel.id}
                className={`ml-control-btn ml-btn-${panel.color}`}
                onClick={() => togglePanel(panel.buttonClass)}
              >
                <div className="btn-icon-wrapper">
                  <span className="btn-icon">{panel.icon}</span>
                  <div className="icon-glow"></div>
                </div>
                <div className="btn-content">
                  <span className="btn-label">{panel.label}</span>
                  <span className="btn-description">{panel.description}</span>
                </div>
                <div className="btn-arrow">→</div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="ml-panel-footer">
            <div className="footer-info">
              <div className="info-badge">
                <span className="badge-dot"></span>
                <span>Real-time ML Processing</span>
              </div>
              <div className="info-text">
                PageTurner AI v1.0 
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="ml-panel-backdrop"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}

export default ControlPanel;