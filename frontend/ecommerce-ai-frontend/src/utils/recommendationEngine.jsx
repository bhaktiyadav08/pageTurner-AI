import featureEngineer from './featureEngineer';
import tracker from './tracker';

class RecommendationEngine {
  constructor() {
    this.trackerInstance = tracker;
    this.featureEngineerInstance = featureEngineer;
  }

  // Main recommendation function
  getRecommendations(allBooks, count = 4) {
    const events = this.trackerInstance.getAllEvents();
    const features = this.featureEngineerInstance.calculateFeatures();

    if (events.length < 3) {
      // Not enough data - show bestsellers
      return this.getBestsellers(allBooks, count);
    }

    // Get user's genre preferences
    const genrePreferences = this.calculateGenrePreferences(events);
    
    // Get books user has already viewed
    const viewedBookIds = this.getViewedBookIds(events);
    
    // Get books in cart
    const cartBookIds = this.getCartBookIds(events);
    
    // Score all books
    const scoredBooks = allBooks
      .filter(book => !viewedBookIds.has(book.id) && !cartBookIds.has(book.id))
      .map(book => ({
        book: book,
        score: this.calculateBookScore(book, genrePreferences, features)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    return scoredBooks.map(item => ({
      ...item.book,
      matchScore: Math.round(item.score),
      matchReason: this.getMatchReason(item.book, genrePreferences, features)
    }));
  }

  // Calculate user's genre preferences from behavior
  calculateGenrePreferences(events) {
    const genreScores = {};
    
    events.forEach(event => {
      if (!event.data || !event.data.genre) return;
      
      const genre = event.data.genre;
      
      // Different event types have different weights
      switch (event.eventType) {
        case 'book_view':
          genreScores[genre] = (genreScores[genre] || 0) + 1;
          break;
        case 'book_hover':
          // Longer hover = more interest
          // eslint-disable-next-line no-case-declarations
          const hoverWeight = Math.min(event.data.hoverDuration / 1000, 5);
          genreScores[genre] = (genreScores[genre] || 0) + hoverWeight;
          break;
        case 'add_to_cart':
          // Adding to cart is strongest signal
          genreScores[genre] = (genreScores[genre] || 0) + 10;
          break;
      }
    });

    // Normalize scores to 0-100
    const maxScore = Math.max(...Object.values(genreScores), 1);
    const normalized = {};
    
    Object.keys(genreScores).forEach(genre => {
      normalized[genre] = (genreScores[genre] / maxScore) * 100;
    });

    return normalized;
  }

  // Calculate relevance score for a book
  calculateBookScore(book, genrePreferences, features) {
    let score = 0;

    // Genre match (0-50 points)
    const genreScore = genrePreferences[book.genre] || 0;
    score += genreScore * 0.5;

    // Popularity boost based on user persona
    if (book.popularity === 'bestseller') {
      // Decisive buyers and new visitors prefer bestsellers
      if (features.view_to_cart_ratio > 0.4 || features.total_events < 10) {
        score += 15;
      }
    }

    // Price matching (0-20 points)
    if (features.price_sensitivity > 60) {
      // Price-sensitive users prefer cheaper books
      const priceScore = Math.max(0, 20 - (book.price - 10));
      score += priceScore;
    } else if (features.price_sensitivity < 40) {
      // Premium buyers don't mind higher prices
      if (book.price > 15) {
        score += 10;
      }
    }

    // Rating boost (0-15 points)
    score += (book.rating - 4) * 5; // 4.0 rating = 0 points, 5.0 = 5 points

    // Length preference (0-10 points)
    if (features.unique_books_viewed > 5) {
      // Engaged users might prefer longer books
      if (book.pages > 350) {
        score += 10;
      }
    }

    // Diversity bonus
    if (features.exploration_score > 70) {
      // Explorers get variety - boost different genres
      if (genreScore < 30) {
        score += 15; // Boost genres they haven't explored much
      }
    }

    return score;
  }

  // Get books user has viewed
  getViewedBookIds(events) {
    const viewEvents = events.filter(e => e.eventType === 'book_view');
    return new Set(viewEvents.map(e => e.data.bookId));
  }

  // Get books in cart
  getCartBookIds(events) {
    const cartEvents = events.filter(e => e.eventType === 'add_to_cart');
    return new Set(cartEvents.map(e => e.data.bookId));
  }

  // Get explanation for why book was recommended
  getMatchReason(book, genrePreferences, features) {
    const reasons = [];

    // Genre match
    const genreScore = genrePreferences[book.genre] || 0;
    if (genreScore > 50) {
      reasons.push(`You love ${book.genre}`);
    } else if (genreScore > 20) {
      reasons.push(`Based on your ${book.genre} interest`);
    }

    // Popularity
    if (book.popularity === 'bestseller') {
      reasons.push('Bestseller');
    }

    // Rating
    if (book.rating >= 4.7) {
      reasons.push('Highly rated');
    }

    // Price
    if (features.price_sensitivity > 60 && book.price < 15) {
      reasons.push('Great value');
    }

    // Pages
    if (book.pages > 400 && features.avg_hover_duration > 2500) {
      reasons.push('Deep read for engaged readers');
    }

    return reasons.length > 0 ? reasons.join(' • ') : 'Recommended for you';
  }

  // Fallback: show bestsellers
  getBestsellers(allBooks, count) {
    return allBooks
      .filter(book => book.popularity === 'bestseller')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count)
      .map(book => ({
        ...book,
        matchScore: 95,
        matchReason: 'Bestseller - Popular choice'
      }));
  }

  // Get genre-specific recommendations
  getGenreRecommendations(allBooks, genre, count = 3) {
    return allBooks
      .filter(book => book.genre === genre)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count)
      .map(book => ({
        ...book,
        matchScore: 90,
        matchReason: `Top ${genre} pick`
      }));
  }

  // Get "You might also like" for a specific book
  getSimilarBooks(allBooks, targetBook, count = 3) {
    const tt = targetBook.themes || [];
    return allBooks
      .filter(book => 
        book.id !== targetBook.id && 
        (book.genre === targetBook.genre || 
         (book.themes || []).some((theme) => tt.includes(theme)))
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count)
      .map(book => ({
        ...book,
        matchScore: 88,
        matchReason: `Similar to ${targetBook.title}`
      }));
  }
}

// Create singleton
const recommendationEngine = new RecommendationEngine();

export default recommendationEngine;