import { useEffect } from 'react';

function CartToast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="cart-toast" role="status">
      <span className="cart-toast-icon">✓</span>
      <span className="cart-toast-text">{message}</span>
    </div>
  );
}

export default CartToast;
