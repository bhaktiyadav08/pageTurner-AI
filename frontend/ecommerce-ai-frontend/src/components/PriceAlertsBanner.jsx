import { useEffect, useState } from 'react';

/**
 * Surfaces price-drop style alerts when catalog price is at or below user target.
 */
function PriceAlertsBanner({ hits }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [hits]);

  if (!hits?.length || dismissed) return null;

  return (
    <div className="price-alerts-banner" role="status">
      <div className="price-alerts-inner">
        <strong>Price alerts</strong>
        <ul>
          {hits.map((h) => (
            <li key={h.bookId}>
              <span>{h.title}</span> is now{' '}
              <strong>${Number(h.currentPrice).toFixed(2)}</strong> (your target $
              {Number(h.targetPrice).toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="price-alerts-dismiss"
        onClick={() => setDismissed(true)}
      >
        Dismiss
      </button>
    </div>
  );
}

export default PriceAlertsBanner;
