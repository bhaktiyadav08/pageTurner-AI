import { useEffect, useState } from 'react';

import recommendationEngine from '../utils/recommendationEngine';

function RecommendationsSection({ books, onAddToCart }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Update recommendations every 5 seconds
    const interval = setInterval(() => {
      const recs = recommendationEngine.getRecommendations(books, 4);
      setRecommendations(recs);
    }, 5000);

    // Initial load
    const initialRecs = recommendationEngine.getRecommendations(books, 4);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecommendations(initialRecs);

    return () => clearInterval(interval);
  }, [books]);

  if (recommendations.length === 0) return null;

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h2>✨ AI Recommendations For You</h2>
        <p className="recommendations-subtitle">
          Based on your browsing behavior and preferences
        </p>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((book) => (
          <RecommendationCard 
            key={book.id}
            book={book}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ book, onAddToCart }) {
  return (
    <div className="recommendation-card">
      {/* Match Score Badge */}
      <div className="match-badge">
        <div className="match-score">{book.matchScore}%</div>
        <div className="match-label">Match</div>
      </div>

      {/* Book Cover */}
      <div className="rec-book-cover">
        <img src={book.cover} alt={book.title} />
      </div>

      {/* Book Info */}
      <div className="rec-book-info">
        <div className="rec-genre-tag">{book.genre}</div>
        <h3 className="rec-book-title">{book.title}</h3>
        <p className="rec-book-author">by {book.author}</p>
        
        {/* Match Reason */}
        <div className="match-reason">
          <span className="match-icon">💡</span>
          <span className="match-text">{book.matchReason}</span>
        </div>

        {/* Rating */}
        <div className="rec-rating">
          ⭐ {book.rating} • {book.pages} pages
        </div>

        {/* Price & Action */}
        <div className="rec-footer">
          <div className="rec-price">${book.price}</div>
          <button 
            className="rec-add-btn"
            onClick={() => onAddToCart(book)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecommendationsSection;