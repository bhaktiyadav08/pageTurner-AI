/* eslint-disable react-hooks/immutability */

import { Sparkles, Target, TrendingUp, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import featureEngineer from '../utils/featureEngineer';
import personalityAnalyzer from '../utils/personalityAnalyzer';
import tracker from '../utils/tracker';

function PersonalityProfile({ isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Update profile every 5 seconds
    const interval = setInterval(() => {
      updateProfile();
    }, 5000);

    // Initial update
    updateProfile();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
    }
  }, [isOpen]);

  const updateProfile = () => {
    const features = featureEngineer.calculateFeatures();
    const events = tracker.getAllEvents();
    
    if (features.total_events >= 3) {
      const newProfile = personalityAnalyzer.analyzePersonality(features, events);
      setProfile(newProfile);
    }
  };

  if (!profile || !isOpen) return null;

  return (
    <div className="personality-modal-overlay" onClick={onClose}>
      <div 
        className={`personality-modal ${showAnimation ? 'animating' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{ '--profile-color': profile.primary.color }}
      >
        {/* Close Button */}
        <button className="personality-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className="personality-header">
          <div className="profile-emoji">{profile.primary.emoji}</div>
          <h2 className="profile-title">{profile.primary.name}</h2>
          <p className="profile-description">{profile.primary.description}</p>
          
          <div className="confidence-bar">
            <div className="confidence-label">
              <span>Profile Confidence</span>
              <span className="confidence-value">{profile.primary.confidence}%</span>
            </div>
            <div className="confidence-track">
              <div 
                className="confidence-fill"
                style={{ width: `${profile.primary.confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Traits */}
        <div className="personality-section">
          <h3 className="section-title">
            <Target size={18} />
            <span>Your Reading Traits</span>
          </h3>
          <div className="traits-grid">
            {profile.primary.traits.map((trait, index) => (
              <div key={index} className="trait-badge">
                <Sparkles size={14} />
                <span>{trait}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="personality-section">
          <h3 className="section-title">
            <TrendingUp size={18} />
            <span>Behavioral Insights</span>
          </h3>
          <div className="insights-list">
            {profile.insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-icon">{insight.icon}</span>
                <span className="insight-text">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="personality-section">
          <h3 className="section-title">
            <Sparkles size={18} />
            <span>Personalized Recommendations</span>
          </h3>
          <div className="recommendation-box">
            <p>{profile.primary.recommendations}</p>
          </div>
        </div>

        {/* Secondary Profile (if exists) */}
        {profile.secondary && (
          <div className="secondary-profile">
            <div className="secondary-header">
              <span className="secondary-emoji">{profile.secondary.emoji}</span>
              <div>
                <div className="secondary-title">Secondary Profile</div>
                <div className="secondary-name">{profile.secondary.name}</div>
              </div>
            </div>
            <p className="secondary-description">{profile.secondary.description}</p>
          </div>
        )}

        {/* Profile Scores Breakdown */}
        <div className="personality-section">
          <h3 className="section-title">
            <TrendingUp size={18} />
            <span>All Personality Scores</span>
          </h3>
          <div className="scores-breakdown">
            {Object.entries(profile.allScores)
              .sort((a, b) => b[1] - a[1])
              .map(([type, score]) => {
                const profileData = personalityAnalyzer.profiles[type];
                const percentage = Math.max(0, Math.min(100, score));
                
                return (
                  <div key={type} className="score-item">
                    <div className="score-header">
                      <span className="score-emoji">{profileData.emoji}</span>
                      <span className="score-name">{profileData.name}</span>
                      <span className="score-value">{percentage}%</span>
                    </div>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${percentage}%`,
                          background: profileData.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div className="personality-footer">
          <div className="footer-note">
            <Sparkles size={14} />
            <span>Profile updates as you browse • Based on ML analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalityProfile;