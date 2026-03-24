import { useState } from 'react';

function NeuralNetworkButton({ onClick, isActive }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`neural-network-button ${isActive ? 'active panel-open' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        className="neural-svg"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="30" cy="50" r="8" className="node node-input node-1" />
        <circle cx="30" cy="100" r="8" className="node node-input node-2" />
        <circle cx="30" cy="150" r="8" className="node node-input node-3" />
        <circle cx="100" cy="40" r="8" className="node node-hidden node-4" />
        <circle cx="100" cy="80" r="8" className="node node-hidden node-5" />
        <circle cx="100" cy="120" r="8" className="node node-hidden node-6" />
        <circle cx="100" cy="160" r="8" className="node node-hidden node-7" />
        <circle cx="170" cy="100" r="10" className="node node-output node-8" />
        <line x1="38" y1="50" x2="92" y2="40" className="connection conn-1" />
        <line x1="38" y1="50" x2="92" y2="80" className="connection conn-2" />
        <line x1="38" y1="50" x2="92" y2="120" className="connection conn-3" />
        <line x1="38" y1="100" x2="92" y2="40" className="connection conn-4" />
        <line x1="38" y1="100" x2="92" y2="80" className="connection conn-5" />
        <line x1="38" y1="100" x2="92" y2="120" className="connection conn-6" />
        <line x1="38" y1="100" x2="92" y2="160" className="connection conn-7" />
        <line x1="38" y1="150" x2="92" y2="120" className="connection conn-8" />
        <line x1="38" y1="150" x2="92" y2="160" className="connection conn-9" />
        <line x1="108" y1="40" x2="162" y2="100" className="connection conn-10" />
        <line x1="108" y1="80" x2="162" y2="100" className="connection conn-11" />
        <line x1="108" y1="120" x2="162" y2="100" className="connection conn-12" />
        <line x1="108" y1="160" x2="162" y2="100" className="connection conn-13" />
        {isHovered && (
          <>
            <circle r="3" className="particle particle-1">
              <animateMotion dur="2s" repeatCount="indefinite">
                <mpath href="#path1" />
              </animateMotion>
            </circle>
            <circle r="3" className="particle particle-2">
              <animateMotion dur="1.8s" repeatCount="indefinite">
                <mpath href="#path2" />
              </animateMotion>
            </circle>
          </>
        )}
        <path id="path1" d="M30,50 L100,80 L170,100" fill="none" />
        <path id="path2" d="M30,100 L100,120 L170,100" fill="none" />
      </svg>

      <div className="neural-main-col">
        <div className="neural-label">
          <span className="neural-title">ML CONTROLS</span>
          <span className="neural-subtitle">Neural Dashboard</span>
        </div>
        <div className="neural-status">
          <div className="status-dot" />
          <span className="status-text">Active</span>
        </div>
      </div>
    </div>
  );
}

export default NeuralNetworkButton;
