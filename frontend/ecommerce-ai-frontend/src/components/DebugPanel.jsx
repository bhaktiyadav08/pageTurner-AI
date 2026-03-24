import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import tracker from '../utils/tracker';

function DebugPanel() {
  const [summary, setSummary] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Update summary every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(tracker.getSummary());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!summary) return null;

  return (
    <div className="debug-panel">
      {/* Toggle button */}
      <button 
        className="debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '📊 Hide Analytics' : '📊 Show Analytics'}
      </button>

      {/* Panel content */}
      {isOpen && (
        <div className="debug-content">
          <div className="ml-floating-panel-header">
            <h3>🧠 Live Session Analytics</h3>
            <button
              type="button"
              className="ml-floating-panel-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="debug-stats">
            <div className="stat-card">
              <div className="stat-value">{summary.totalEvents}</div>
              <div className="stat-label">Total Events</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{summary.sessionDuration}s</div>
              <div className="stat-label">Session Duration</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{summary.engagementScore}</div>
              <div className="stat-label">Engagement Score</div>
            </div>
          </div>

          {/* Top Genres */}
          {summary.topGenres.length > 0 && (
            <div className="debug-section">
              <h4>📚 Top Genres Explored</h4>
              <div className="genre-list">
                {summary.topGenres.map((item, i) => (
                  <div key={i} className="genre-item">
                    <span className="genre-name">{item.genre}</span>
                    <span className="genre-count">{item.count} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div className="debug-section">
            <h4>🔄 Recent Events</h4>
            <div className="events-list">
              {summary.events.slice(-5).reverse().map((event, i) => (
                <div key={i} className="event-item">
                  <span className="event-type">{event.eventType}</span>
                  <span className="event-time">
                    {Math.floor(event.timeFromStart / 1000)}s ago
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Session ID */}
          <div className="session-id">
            Session: {summary.sessionId.substring(0, 20)}...
          </div>
        </div>
      )}
    </div>
  );
}

export default DebugPanel;