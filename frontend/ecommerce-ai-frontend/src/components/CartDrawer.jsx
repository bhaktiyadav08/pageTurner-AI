import { X } from 'lucide-react';

function CartDrawer({ open, onClose, cart, onRemove, onCheckout }) {
  if (!open) return null;

  const total = cart.reduce((s, b) => s + Number(b.price || 0), 0);

  return (
    <>
      <div className="cart-drawer-backdrop" onClick={onClose} aria-hidden />
      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div className="cart-drawer-header">
          <h2>Your cart</h2>
          <button type="button" className="cart-drawer-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <p className="cart-empty">No items yet. Browse books and add to cart.</p>
          ) : (
            <ul className="cart-lines">
              {cart.map((b, idx) => (
                <li key={`${b.id}_${idx}`} className="cart-line">
                  <img src={b.cover} alt="" className="cart-line-cover" />
                  <div className="cart-line-info">
                    <div className="cart-line-title">{b.title}</div>
                    <div className="cart-item-meta">
                      {b.genre} · ${Number(b.price).toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-line-remove"
                    onClick={() => onRemove(idx)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <span>Total:</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button type="button" className="cart-checkout-btn" onClick={onCheckout}>
              Checkout (demo)
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
