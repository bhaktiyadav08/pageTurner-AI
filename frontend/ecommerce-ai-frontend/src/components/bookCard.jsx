import { Heart } from 'lucide-react';
import { useState } from 'react';

import tracker from '../utils/tracker';

function BookCard({ book, onAddToCart, onBuyNow, onBookClick, wishlisted, onToggleWishlist }) {
  const [hoverStart, setHoverStart] = useState(null);

  const handleClick = () => {
    onAddToCart(book);
  };

  const handleMouseEnter = () => {
    setHoverStart(Date.now());
    tracker.trackBookView(book);
  };

  const handleMouseLeave = () => {
    if (hoverStart) {
      const hoverDuration = Date.now() - hoverStart;
      tracker.trackBookHover(book, hoverDuration);
      setHoverStart(null);
    }
  };
// NEW: Handle card click (open details)
  const handleCardClick = () => {
    if (onBookClick) {
      onBookClick(book);
    }};
  return (
    <div 
      className="book-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}  // ← ADD THIS
      style={{ cursor: 'pointer' }}
    >
      <div className="book-cover">
        <img src={book.cover} alt={book.title} />

        {onToggleWishlist && (
          <button
            type="button"
            className={`book-wishlist-btn ${wishlisted ? 'active' : ''}`}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(book);
            }}
          >
            <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
        
        {book.popularity === "bestseller" && (
          <div className="badge bestseller">📚 Bestseller</div>
        )}
        
        <div className="rating">
          ⭐ {book.rating}
        </div>
      </div>
      
      <div className="book-info">
        <div className="genre-tag">{book.genre}</div>
        
        <h3 className="book-title">{book.title}</h3>
        <p className="author">by {book.author}</p>
        
        <p className="description">{book.description}</p>
        
        <div className="book-meta">
          <span className="pages">📖 {book.pages} pages</span>
        </div>
        
        <div className="book-footer">
          <p className="price">${book.price}</p>
          <div className="book-actions" style={{display: 'flex', gap: '8px'}}>
            <button 
              className="add-to-cart-btn"
              style={{flex: 1, padding: '8px 12px', fontSize: '0.85rem'}}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Add to Cart
            </button>
            <button 
              className="buy-now-btn"
              style={{flex: 1, padding: '8px 12px', fontSize: '0.85rem'}}
              onClick={(e) => {
                e.stopPropagation();
                if (onBuyNow) {
                  onBuyNow(book);
                } else {
                  handleClick();
                }
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookCard;