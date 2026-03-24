class BehaviorTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.sessionStart = Date.now();
    this.bookViewTimes = {};  // Track time spent viewing each book
    this.genreInterests = {};  // Track genre preferences
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track any event
  trackEvent(eventType, data) {
    const event = {
      sessionId: this.sessionId,
      eventType: eventType,
      timestamp: Date.now(),
      timeFromStart: Date.now() - this.sessionStart,
      data: data
    };

    this.events.push(event);
    console.log('📊 Event tracked:', event);
    
    // Update genre interests
    if (data.genre) {
      this.genreInterests[data.genre] = (this.genreInterests[data.genre] || 0) + 1;
    }
    
    return event;
  }

  // Track book view
  trackBookView(book) {
    this.trackEvent('book_view', {
      bookId: book.id,
      title: book.title,
      genre: book.genre,
      price: book.price,
      pages: book.pages
    });
  }

  // Track add to cart
  trackAddToCart(book) {
    this.trackEvent('add_to_cart', {
      bookId: book.id,
      title: book.title,
      genre: book.genre,
      price: book.price
    });
  }

  // Track book hover (engagement)
  trackBookHover(book, duration) {
    // Only track significant hovers (> 500ms)
    if (duration > 500) {
      this.trackEvent('book_hover', {
        bookId: book.id,
        title: book.title,
        genre: book.genre,
        hoverDuration: duration
      });

      // Update total view time for this book
      this.bookViewTimes[book.id] = (this.bookViewTimes[book.id] || 0) + duration;
    }
  }

  // Track scroll depth
  trackScrollDepth(depth) {
    this.trackEvent('scroll', {
      depth: depth,
      percentage: Math.round(depth)
    });
  }

  // Track page visibility (user switched tabs?)
  trackPageVisibility(visible) {
    this.trackEvent('page_visibility', {
      visible: visible
    });
  }

  // Calculate session duration
  getSessionDuration() {
    return Math.floor((Date.now() - this.sessionStart) / 1000); // in seconds
  }

  // Get top genres by interest
  getTopGenres() {
    return Object.entries(this.genreInterests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre, count]) => ({ genre, count }));
  }

  // Get most viewed books
  getMostViewedBooks() {
    return Object.entries(this.bookViewTimes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([bookId, duration]) => ({ bookId, duration }));
  }

  // Calculate engagement score (0-100)
  getEngagementScore() {
    const eventCount = this.events.length;
    const sessionDuration = this.getSessionDuration();
    const hoverEvents = this.events.filter(e => e.eventType === 'book_hover').length;
    const cartEvents = this.events.filter(e => e.eventType === 'add_to_cart').length;

    // Simple scoring formula
    const score = Math.min(100, 
      (eventCount * 2) + 
      (hoverEvents * 5) + 
      (cartEvents * 15) + 
      (sessionDuration * 0.5)
    );

    return Math.round(score);
  }

  // Get all events
  getAllEvents() {
    return this.events;
  }

  /** Book ID → view count (book_view events) — for trending / heatmap */
  getViewCountsByBookId() {
    const counts = {};
    for (const e of this.events) {
      if (e.eventType === 'book_view' && e.data?.bookId) {
        counts[e.data.bookId] = (counts[e.data.bookId] || 0) + 1;
      }
    }
    return counts;
  }

  /** Last book viewed (from events), for “Because you viewed…” */
  getLastViewedBookMeta() {
    for (let i = this.events.length - 1; i >= 0; i--) {
      const e = this.events[i];
      if (e.eventType === 'book_view' && e.data?.bookId) {
        return {
          bookId: e.data.bookId,
          title: e.data.title,
          genre: e.data.genre,
        };
      }
    }
    return null;
  }

  /** 24 hourly buckets (local time) for session — heatmap X axis */
  getHourlyEventCounts() {
    const buckets = Array(24).fill(0);
    const start = new Date(this.sessionStart);
    const startHour = start.getHours();
    for (const e of this.events) {
      const d = new Date(e.timestamp);
      const h = d.getHours();
      buckets[h] += 1;
    }
    return { buckets, sessionStartHour: startHour };
  }

  /** Genre → weighted interest (views + hovers + cart) for heatmap rows */
  getGenreIntensityMap() {
    const m = {};
    for (const e of this.events) {
      const g = e.data?.genre;
      if (!g) continue;
      let w = 1;
      if (e.eventType === 'book_hover') w = 0.5 + Math.min((e.data.hoverDuration || 0) / 2000, 3);
      if (e.eventType === 'add_to_cart') w = 5;
      m[g] = (m[g] || 0) + w;
    }
    return m;
  }

  // Get summary for debugging
  getSummary() {
    return {
      sessionId: this.sessionId,
      totalEvents: this.events.length,
      sessionDuration: this.getSessionDuration(),
      engagementScore: this.getEngagementScore(),
      topGenres: this.getTopGenres(),
      mostViewedBooks: this.getMostViewedBooks(),
      events: this.events
    };
  }
}

// Create a single instance (singleton pattern)
const tracker = new BehaviorTracker();

export default tracker;