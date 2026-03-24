import { useEffect, useState } from 'react';

import { X } from 'lucide-react';
import predictor from '../utils/predictor';

function SmartIntervention({ books, onAddToCart }) {
  const [intervention, setIntervention] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
  const interval = setInterval(async () => {  // ← Add async
    try {
      const predictionData = await predictor.getPredictionSummary();  // ← Add await
      
      // Check if prediction exists
      if (!predictionData || !predictionData.prediction) {
        return;
      }
       const prediction = predictionData.prediction;
      const action = prediction.suggestedAction;
      
      // Only show if we haven't dismissed this type recently
      if (action.action !== 'none' && !dismissed.has(action.action)) {
        setIntervention({
          type: action.action,
          message: action.message,
          urgency: action.urgency,
          discount: action.discount,
          persona: prediction.prediction.userPersona,
          conversionProb: prediction.prediction.conversionProbability
        });
      }
    }
    catch (error) {
      console.warn('Intervention error:', error);
    }},
     10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [dismissed]);

  const handleDismiss = () => {
    if (intervention) {
      setDismissed(new Set([...dismissed, intervention.type]));
    }
    setIntervention(null);
  };

  const handleAccept = () => {
    // User accepted the intervention
    console.log('User accepted intervention:', intervention.type);
    setIntervention(null);
  };

  if (!intervention) return null;

  // Different intervention types
  return (
    <>
      {intervention.type === 'show_exit_intent' && (
        <ExitIntentPopup 
          intervention={intervention}
          onDismiss={handleDismiss}
          onAccept={handleAccept}
        />
      )}

      {intervention.type === 'cart_reminder' && (
        <CartReminderPopup 
          intervention={intervention}
          onDismiss={handleDismiss}
          onAccept={handleAccept}
        />
      )}

      {intervention.type === 'personalized_recommendation' && (
        <RecommendationPopup 
          intervention={intervention}
          books={books}
          onDismiss={handleDismiss}
          onAddToCart={onAddToCart}
        />
      )}

      {intervention.type === 'browse_suggestion' && (
        <BrowseSuggestionBanner 
          intervention={intervention}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}

// Exit Intent Popup (high urgency)
function ExitIntentPopup({ intervention, onDismiss, onAccept }) {
  return (
    <div className="intervention-overlay">
      <div className="intervention-modal exit-intent">
        <button className="intervention-close" onClick={onDismiss}>
          <X size={20} />
        </button>

        <div className="intervention-content">
          <div className="intervention-icon">🎁</div>
          <h2>Wait! Don't Leave Yet</h2>
          <p className="intervention-subtitle">
            Our AI noticed you're interested in great books
          </p>

          <div className="discount-box">
            <div className="discount-value">{intervention.discount}% OFF</div>
            <p>Your first purchase</p>
            <div className="discount-code">
              Code: <span>WELCOME{intervention.discount}</span>
            </div>
          </div>

          <div className="intervention-actions">
            <button className="btn-primary" onClick={onAccept}>
              Claim Offer
            </button>
            <button className="btn-secondary" onClick={onDismiss}>
              No Thanks
            </button>
          </div>

          <div className="intervention-timer">
            ⏰ Offer expires in 5 minutes
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Reminder Popup (medium urgency)
function CartReminderPopup({ intervention, onDismiss, onAccept }) {
  return (
    <div className="intervention-overlay">
      <div className="intervention-modal cart-reminder">
        <button className="intervention-close" onClick={onDismiss}>
          <X size={20} />
        </button>

        <div className="intervention-content">
          <div className="intervention-icon">🛒</div>
          <h2>Don't Forget Your Books!</h2>
          <p className="intervention-subtitle">
            {intervention.message}
          </p>

          <div className="cart-preview">
            <p>📚 Items waiting in your cart</p>
            <p className="free-shipping-notice">
              ✨ Free shipping on orders over $25
            </p>
          </div>

          <div className="intervention-actions">
            <button className="btn-primary" onClick={onAccept}>
              Complete Purchase
            </button>
            <button className="btn-secondary" onClick={onDismiss}>
              Keep Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Personalized Recommendations (low urgency)
function RecommendationPopup({ intervention, books, onDismiss, onAddToCart }) {
  // Get 3 random books as recommendations (in real app, use ML to pick)
  const recommendations = books.slice(0, 3);

  return (
    <div className="intervention-overlay">
      <div className="intervention-modal recommendations">
        <button className="intervention-close" onClick={onDismiss}>
          <X size={20} />
        </button>

        <div className="intervention-content">
          <div className="intervention-icon">✨</div>
          <h2>Picked Just For You</h2>
          <p className="intervention-subtitle">
            Based on your {intervention.persona.label} browsing style
          </p>

          <div className="recommendation-grid">
            {recommendations.map((book) => (
              <div key={book.id} className="recommendation-item">
                <img src={book.cover} alt={book.title} />
                <div className="recommendation-info">
                  <h4>{book.title}</h4>
                  <p className="recommendation-author">{book.author}</p>
                  <p className="recommendation-price">${book.price}</p>
                  <button 
                    className="btn-small"
                    onClick={() => {
                      onAddToCart(book);
                      onDismiss();
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-text" onClick={onDismiss}>
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}

// Browse Suggestion Banner (non-intrusive)
function BrowseSuggestionBanner({ intervention, onDismiss }) {
  return (
    <div className="intervention-banner">
      <div className="banner-content">
        <span className="banner-icon">💡</span>
        <span className="banner-message">{intervention.message}</span>
        <button className="banner-close" onClick={onDismiss}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default SmartIntervention;