import tracker from './tracker';

class FeatureEngineer {
  constructor() {
    this.trackerInstance = tracker;
  }

  // Calculate all features from current session
  calculateFeatures() {
    const events = this.trackerInstance.getAllEvents();
    const summary = this.trackerInstance.getSummary();

    return {
      // Basic aggregation features
      total_events: events.length,
      session_duration_seconds: summary.sessionDuration,
      events_per_minute: this.calculateEventsPerMinute(events, summary.sessionDuration),
      
      // Behavioral features
      unique_books_viewed: this.countUniqueBooks(events, 'book_view'),
      unique_genres_explored: this.countUniqueGenres(events),
      books_added_to_cart: this.countByEventType(events, 'add_to_cart'),
      
      // Engagement features
      avg_hover_duration: this.calculateAvgHoverDuration(events),
      total_hover_time: this.calculateTotalHoverTime(events),
      max_scroll_depth: this.getMaxScrollDepth(events),
      
      // Sequential pattern features
      genre_switches: this.countGenreSwitches(events),
      view_to_cart_ratio: this.calculateViewToCartRatio(events),
      
      // Time-based features
      time_to_first_hover: this.getTimeToFirstEvent(events, 'book_hover'),
      time_to_first_cart: this.getTimeToFirstEvent(events, 'add_to_cart'),
      
      // Diversity features
      genre_entropy: this.calculateGenreEntropy(events),
      exploration_score: this.calculateExplorationScore(events),
      
      // Intent signals
      high_engagement_books: this.countHighEngagementBooks(events),
      cart_abandonment_risk: this.calculateCartAbandonmentRisk(events, summary.sessionDuration),
      
      // Advanced features
      genre_focus_score: this.calculateGenreFocusScore(events),
      price_sensitivity: this.calculatePriceSensitivity(events),
    };
  }

  // Helper: Events per minute
  calculateEventsPerMinute(events, duration) {
    if (duration === 0) return 0;
    return Math.round((events.length / duration) * 60 * 100) / 100;
  }

  // Helper: Count unique books viewed
  countUniqueBooks(events, eventType) {
    const bookIds = events
      .filter(e => e.eventType === eventType)
      .map(e => e.data.bookId);
    return new Set(bookIds).size;
  }

  // Helper: Count unique genres
  countUniqueGenres(events) {
    const genres = events
      .filter(e => e.data && e.data.genre)
      .map(e => e.data.genre);
    return new Set(genres).size;
  }

  // Helper: Count events by type
  countByEventType(events, eventType) {
    return events.filter(e => e.eventType === eventType).length;
  }

  // Helper: Average hover duration
  calculateAvgHoverDuration(events) {
    const hoverEvents = events.filter(e => e.eventType === 'book_hover');
    if (hoverEvents.length === 0) return 0;
    
    const totalDuration = hoverEvents.reduce((sum, e) => sum + (e.data.hoverDuration || 0), 0);
    return Math.round(totalDuration / hoverEvents.length);
  }

  // Helper: Total hover time
  calculateTotalHoverTime(events) {
    const hoverEvents = events.filter(e => e.eventType === 'book_hover');
    return hoverEvents.reduce((sum, e) => sum + (e.data.hoverDuration || 0), 0);
  }

  // Helper: Max scroll depth
  getMaxScrollDepth(events) {
    const scrollEvents = events.filter(e => e.eventType === 'scroll');
    if (scrollEvents.length === 0) return 0;
    
    return Math.max(...scrollEvents.map(e => e.data.percentage || 0));
  }

  // Helper: Count genre switches
  countGenreSwitches(events) {
    const viewEvents = events.filter(e => e.eventType === 'book_view');
    if (viewEvents.length < 2) return 0;
    
    let switches = 0;
    for (let i = 1; i < viewEvents.length; i++) {
      if (viewEvents[i].data.genre !== viewEvents[i-1].data.genre) {
        switches++;
      }
    }
    return switches;
  }

  // Helper: View to cart ratio
  calculateViewToCartRatio(events) {
    const views = this.countByEventType(events, 'book_view');
    const carts = this.countByEventType(events, 'add_to_cart');
    
    if (views === 0) return 0;
    return Math.round((carts / views) * 100) / 100;
  }

  // Helper: Time to first event of type
  getTimeToFirstEvent(events, eventType) {
    const firstEvent = events.find(e => e.eventType === eventType);
    return firstEvent ? Math.round(firstEvent.timeFromStart / 1000) : null;
  }

  // Helper: Genre entropy (diversity measure)
  calculateGenreEntropy(events) {
    const genres = events
      .filter(e => e.data && e.data.genre)
      .map(e => e.data.genre);
    
    if (genres.length === 0) return 0;
    
    // Count genre frequencies
    const genreCounts = {};
    genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    
    // Calculate entropy
    const total = genres.length;
    let entropy = 0;
    
    Object.values(genreCounts).forEach(count => {
      const p = count / total;
      entropy -= p * Math.log2(p);
    });
    
    return Math.round(entropy * 100) / 100;
  }

  // Helper: Exploration score (how much user explores vs focuses)
  calculateExplorationScore(events) {
    const uniqueGenres = this.countUniqueGenres(events);
    const genreSwitches = this.countGenreSwitches(events);
    const uniqueBooks = this.countUniqueBooks(events, 'book_view');
    
    // Higher score = more exploration
    return Math.min(100, uniqueGenres * 15 + genreSwitches * 5 + uniqueBooks * 3);
  }

  // Helper: High engagement books (hover > 3 seconds)
  countHighEngagementBooks(events) {
    const hoverEvents = events.filter(e => 
      e.eventType === 'book_hover' && e.data.hoverDuration > 3000
    );
    
    const bookIds = hoverEvents.map(e => e.data.bookId);
    return new Set(bookIds).size;
  }

  // Helper: Cart abandonment risk (0-100)
  calculateCartAbandonmentRisk(events, sessionDuration) {
    const cartEvents = this.countByEventType(events, 'add_to_cart');
    
    if (cartEvents === 0) return 0; // No cart = no risk
    
    // Last cart event time
    const lastCartEvent = events
      .filter(e => e.eventType === 'add_to_cart')
      .slice(-1)[0];
    
    if (!lastCartEvent) return 0;
    
    const timeSinceLastCart = sessionDuration - (lastCartEvent.timeFromStart / 1000);
    
    // Risk increases with time since last cart action
    // 0-30s = 0%, 30-60s = 50%, 60s+ = 100%
    if (timeSinceLastCart < 30) return 0;
    if (timeSinceLastCart < 60) return 50;
    return 100;
  }

  // Helper: Genre focus score (opposite of exploration)
  calculateGenreFocusScore(events) {
    const uniqueGenres = this.countUniqueGenres(events);
    const totalViews = this.countByEventType(events, 'book_view');
    
    if (totalViews === 0) return 0;
    
    // More views on fewer genres = higher focus
    return Math.round((totalViews / Math.max(uniqueGenres, 1)) * 10);
  }

  // Helper: Price sensitivity (prefer cheaper books?)
  calculatePriceSensitivity(events) {
    const viewEvents = events.filter(e => e.eventType === 'book_view');
    const cartEvents = events.filter(e => e.eventType === 'add_to_cart');
    
    if (viewEvents.length === 0) return 0;
    
    const avgViewPrice = viewEvents.reduce((sum, e) => sum + (e.data.price || 0), 0) / viewEvents.length;
    
    if (cartEvents.length === 0) return 50; // Neutral
    
    const avgCartPrice = cartEvents.reduce((sum, e) => sum + (e.data.price || 0), 0) / cartEvents.length;
    
    // If cart price < view price, user is price sensitive
    if (avgCartPrice < avgViewPrice) return 80; // High sensitivity
    if (avgCartPrice > avgViewPrice * 1.2) return 20; // Low sensitivity (buying premium)
    return 50; // Neutral
  }

  // Get feature summary with labels
  getFeatureSummary() {
    const features = this.calculateFeatures();
    
    return {
      features: features,
      labels: {
        total_events: "Total Events",
        session_duration_seconds: "Session Duration (s)",
        events_per_minute: "Events/Minute",
        unique_books_viewed: "Unique Books Viewed",
        unique_genres_explored: "Genres Explored",
        books_added_to_cart: "Books in Cart",
        avg_hover_duration: "Avg Hover (ms)",
        total_hover_time: "Total Hover (ms)",
        max_scroll_depth: "Max Scroll (%)",
        genre_switches: "Genre Switches",
        view_to_cart_ratio: "View→Cart Ratio",
        time_to_first_hover: "Time to 1st Hover (s)",
        time_to_first_cart: "Time to 1st Cart (s)",
        genre_entropy: "Genre Diversity",
        exploration_score: "Exploration Score",
        high_engagement_books: "High Engagement Books",
        cart_abandonment_risk: "Abandonment Risk (%)",
        genre_focus_score: "Genre Focus",
        price_sensitivity: "Price Sensitivity"
      }
    };
  }
}

// Create singleton instance
const featureEngineer = new FeatureEngineer();

export default featureEngineer;