/* eslint-disable react-hooks/set-state-in-effect */

import { BookOpen, Heart, ShoppingCart, Star, User, X } from 'lucide-react';
import {
  addReview,
  getPriceAlerts,
  getReadingProgress,
  getReviewsForBook,
  removePriceAlert,
  setPriceAlert,
  setReadingProgress,
} from '../utils/userLibrary';
import { useEffect, useState } from 'react';

import recommendationEngine from '../utils/recommendationEngine';

function BookDetailsModal({
  book,
  allBooks,
  onClose,
  onAddToCart,
  onSelectBook,
  wishlistIds,
  onToggleWishlist,
  onLibraryChange,
}) {
  const [similarBooks, setSimilarBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [alertPrice, setAlertPrice] = useState('');

  const wishlisted = book && wishlistIds?.includes(book.id);

  useEffect(() => {
    if (book && allBooks) {
      const similar = recommendationEngine.getSimilarBooks(allBooks, book, 3);
      setSimilarBooks(similar);
    }
  }, [book, allBooks]);

  useEffect(() => {
    if (!book) return;
    setReviews(getReviewsForBook(book.id));
    const rp = getReadingProgress()[book.id];
    setCurrentPage(rp?.currentPage ?? 0);
    const pa = getPriceAlerts()[book.id];
    setAlertPrice(pa ? String(pa.targetPrice) : '');
  }, [book]);

  if (!book) return null;

  const hasPriceAlert = Boolean(getPriceAlerts()[book.id]);

  const totalPages = book.pages || 300;
  const progressPct = totalPages
    ? Math.min(100, Math.round((currentPage / totalPages) * 100))
    : 0;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    addReview(book.id, { rating, text: reviewText });
    setReviews(getReviewsForBook(book.id));
    setReviewText('');
    onLibraryChange?.();
  };

  const handleSaveProgress = () => {
    setReadingProgress(book.id, currentPage, totalPages);
    onLibraryChange?.();
  };

  const handleSetAlert = () => {
    const n = parseFloat(alertPrice);
    if (!Number.isFinite(n) || n <= 0) return;
    setPriceAlert(book.id, n);
    onLibraryChange?.();
  };

  const handleRemoveAlert = () => {
    removePriceAlert(book.id);
    setAlertPrice('');
    onLibraryChange?.();
  };

  const avgReview =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-body">
          <div className="modal-left">
            <div className="modal-cover-container">
              <img src={book.cover} alt={book.title} className="modal-cover" />

              {book.popularity === 'bestseller' && (
                <div className="modal-badge bestseller">⭐ Bestseller</div>
              )}
            </div>

            <div className="modal-stats">
              <div className="stat-item">
                <Star size={18} />
                <span>{book.rating} Rating</span>
              </div>
              <div className="stat-item">
                <BookOpen size={18} />
                <span>{book.pages} Pages</span>
              </div>
            </div>

            <button
              type="button"
              className={`modal-wishlist-btn ${wishlisted ? 'active' : ''}`}
              onClick={() => onToggleWishlist?.(book.id)}
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              {wishlisted ? 'Saved to wishlist' : 'Add to wishlist'}
            </button>
          </div>

          <div className="modal-right">
            <div className="modal-genre">{book.genre}</div>

            <h1 className="modal-title">{book.title}</h1>
            <div className="modal-author">
              <User size={16} />
              <span>by {book.author}</span>
            </div>

            <div className="modal-price-section">
              <div className="modal-price">${book.price}</div>
              <button
                className="modal-add-to-cart"
                onClick={() => {
                  onAddToCart(book);
                  onClose();
                }}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">About This Book</h3>
              <p className="modal-description">
                {book.description || 'No description available for this book.'}
              </p>
            </div>

            {book.themes && book.themes.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">Themes</h3>
                <div className="modal-themes">
                  {book.themes.slice(0, 5).map((theme, index) => (
                    <span key={index} className="theme-tag">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-section">
              <h3 className="modal-section-title">Ratings & reviews</h3>
              {avgReview != null && (
                <p className="modal-avg-review">
                  Community avg: ⭐ {avgReview.toFixed(1)} ({reviews.length} review
                  {reviews.length === 1 ? '' : 's'})
                </p>
              )}
              <ul className="modal-review-list">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <strong>⭐ {r.rating}</strong> — {r.text || '(no comment)'}
                  </li>
                ))}
              </ul>
              <form className="modal-review-form" onSubmit={handleSubmitReview}>
                <label>
                  Your rating
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  placeholder="Share what you think…"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                />
                <button type="submit">Post review</button>
              </form>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">Reading progress</h3>
              <p className="modal-hint">
                Tracks your position for abandonment / engagement features in the ML pipeline.
              </p>
              <div className="modal-progress-row">
                <label>
                  Current page
                  <input
                    type="number"
                    min={0}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                  />
                </label>
                <span> / {totalPages} pages ({progressPct}%)</span>
              </div>
              <div className="reading-bar modal-reading-bar">
                <div
                  className="reading-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <button type="button" className="modal-save-progress" onClick={handleSaveProgress}>
                Save progress
              </button>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">Price drop alert</h3>
              <p className="modal-hint">
                We notify when the catalog price reaches your target (client-side demo).
              </p>
              <div className="modal-alert-row">
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="Target $"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                />
                <button type="button" onClick={handleSetAlert}>
                  Set alert
                </button>
                {hasPriceAlert && (
                  <button type="button" className="ghost-btn" onClick={handleRemoveAlert}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            {similarBooks.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">You Might Also Like</h3>
                <div className="similar-books-grid">
                  {similarBooks.map((similarBook) => (
                    <div
                      key={similarBook.id}
                      className="similar-book-card"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBook?.(similarBook);
                      }}
                    >
                      <img
                        src={similarBook.cover}
                        alt={similarBook.title}
                        className="similar-book-cover"
                      />
                      <div className="similar-book-info">
                        <h4>{similarBook.title}</h4>
                        <p>{similarBook.author}</p>
                        <div className="similar-book-price">${similarBook.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsModal;
