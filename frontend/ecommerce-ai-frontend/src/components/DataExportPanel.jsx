import { X } from 'lucide-react';
import { useState } from 'react';

import featureEngineer from '../utils/featureEngineer';
import tracker from '../utils/tracker';

function DataExportPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const exportSessionData = () => {
    const summary = tracker.getSummary();
    const features = featureEngineer.calculateFeatures();
    const events = tracker.getAllEvents();

    // Create CSV content
    const csvData = convertToCSV(features, events, summary);
    
    // Download CSV
    downloadCSV(csvData, `session_${summary.sessionId}.csv`);
  };

  const exportEventsLog = () => {
    const events = tracker.getAllEvents();
    
    // Create events CSV
    const eventsCSV = convertEventsToCSV(events);
    
    // Download
    // eslint-disable-next-line react-hooks/purity
    downloadCSV(eventsCSV, `events_${Date.now()}.csv`);
  };

  const convertToCSV = (features, events, summary) => {
    // Header row (feature names)
    const headers = Object.keys(features).join(',') + ',session_id,converted\n';
    
    // Data row (feature values)
    const values = Object.values(features).join(',') + 
                   `,${summary.sessionId},0\n`; // 0 = not converted (you'd set this to 1 if user actually purchased)
    
    return headers + values;
  };

  const convertEventsToCSV = (events) => {
    const headers = 'timestamp,event_type,session_id,book_id,genre,price,duration\n';
    
    const rows = events.map(event => {
      return [
        event.timestamp,
        event.eventType,
        event.sessionId,
        event.data?.bookId || '',
        event.data?.genre || '',
        event.data?.price || '',
        event.data?.hoverDuration || ''
      ].join(',');
    }).join('\n');
    
    return headers + rows;
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const clearSession = () => {
    if (window.confirm('Clear all tracking data? This will refresh the page.')) {
      window.location.reload();
    }
  };

  return (
    <div className="export-panel-wrapper">
      <button 
        className="export-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '💾 Hide Export' : '💾 Export Data'}
      </button>

      {isOpen && (
        <div className="export-panel">
          <div className="ml-floating-panel-header">
            <h3>📊 Data Export</h3>
            <button
              type="button"
              className="ml-floating-panel-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
          <p className="export-description">
            Download session data for ML model training
          </p>

          <div className="export-actions">
            <button 
              className="export-btn features"
              onClick={exportSessionData}
            >
              <span className="btn-icon">📈</span>
              <div className="btn-content">
                <div className="btn-title">Export Features</div>
                <div className="btn-subtitle">CSV with engineered features</div>
              </div>
            </button>

            <button 
              className="export-btn events"
              onClick={exportEventsLog}
            >
              <span className="btn-icon">📝</span>
              <div className="btn-content">
                <div className="btn-title">Export Events</div>
                <div className="btn-subtitle">Raw event log</div>
              </div>
            </button>

            <button 
              className="export-btn clear"
              onClick={clearSession}
            >
              <span className="btn-icon">🗑️</span>
              <div className="btn-content">
                <div className="btn-title">Clear Session</div>
                <div className="btn-subtitle">Reset all tracking</div>
              </div>
            </button>
          </div>

          <div className="export-info">
            <h4>📌 What you can do with this data:</h4>
            <ul>
              <li>Train ML models in Python (scikit-learn, TensorFlow)</li>
              <li>Analyze user behavior patterns</li>
              <li>Build prediction models</li>
              <li>Create visualizations in Jupyter</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataExportPanel;