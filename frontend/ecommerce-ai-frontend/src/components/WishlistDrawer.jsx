import { Heart, X } from 'lucide-react';

function WishlistDrawer({ open, onClose, books, wishlistIds, onBookClick, onRemove }) {
  if (!open) return null;

  const items = wishlistIds
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <>
      <div className="wishlist-drawer-backdrop" onClick={onClose} aria-hidden />
      <aside className="wishlist-drawer" role="dialog" aria-label="Wishlist">
        <div className="wishlist-drawer-header">
          <div className="wishlist-drawer-title">
            <Heart size={22} className="wishlist-drawer-heart" />
            <h2>Your wishlist</h2>
          </div>
          <button type="button" className="wishlist-drawer-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        <div className="wishlist-drawer-body">
          {items.length === 0 ? (
            <p className="wishlist-drawer-empty">
              Tap the heart on any book to save it here. Open this menu anytime from the
              ☰ button.
            </p>
          ) : (
            <ul className="wishlist-drawer-list">
              {items.map((book) => (
                <li key={book.id} className="wishlist-drawer-line">
                  <button
                    type="button"
                    className="wishlist-drawer-line-main"
                    onClick={() => {
                      onBookClick(book);
                      onClose();
                    }}
                  >
                    <img src={book.cover} alt="" />
                    <div>
                      <div className="wishlist-drawer-line-title">{book.title}</div>
                      <div className="wishlist-drawer-line-meta">
                        {book.author} · ${book.price}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="wishlist-drawer-line-remove"
                    onClick={() => onRemove(book.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

export default WishlistDrawer;
