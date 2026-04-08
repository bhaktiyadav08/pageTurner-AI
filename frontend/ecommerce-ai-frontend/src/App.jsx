import './App.css';

import { Heart, Menu, X } from 'lucide-react';
import { getBooks, searchGoogleBooks } from './services/bookService';
import {
  getPriceAlerts,
  getWishlistBooks,
  setStoredTheme,
  toggleWishlistBook,
  removeWishlistBook,
} from './utils/userLibrary';
import { useCallback, useEffect, useMemo, useState } from 'react';

import BehaviorHeatmap from './components/BehaviorHeatmap';
import BookCard from './components/bookCard';
import BookDetailsModal from './components/BookDetailsModal';
import CartDrawer from './components/CartDrawer';
import CartToast from './components/CartToast';
import ControlPanel from './components/ControlPanel';
import DataExportPanel from './components/DataExportPanel';
import DebugPanel from './components/DebugPanel';
import DiscoveryToolbar from './components/DiscoveryToolbar';
import FeaturesPanel from './components/FeaturesPanel';
import PersonalityProfile from './components/PersonalityProfile';
import PredictionPanel from './components/PredictionPanel';
import PriceAlertsBanner from './components/PriceAlertsBanner';
import ReadingListWidget from './components/ReadingListWidget';
import RecommendationsSection from './components/RecommendationsSection';
import SmartIntervention from './components/SmartIntervention';
import ThemeToggle from './components/ThemeToggle';
import TrendingSection from './components/TrendingSection';
import WishlistDrawer from './components/WishlistDrawer';
import { filterSortBooks } from './utils/bookDisplay';
import tracker from './utils/tracker';
import predictor from './utils/predictor';

function App() {
  const [cart, setCart] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortKey, setSortKey] = useState('relevance');
  const [apiSearchBooks, setApiSearchBooks] = useState([]);
  const [searching, setSearching] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('pageturner_theme') || 'dark'
  );
  const [wishlistBooks, setWishlistBooks] = useState(() => getWishlistBooks());
  const wishlistIds = wishlistBooks.map(b => b.id);
  const [readingVersion, setReadingVersion] = useState(0);
  const [libraryTick, setLibraryTick] = useState(0);

  const [sessionTick, setSessionTick] = useState(0);
  const [cartToast, setCartToast] = useState(null);

  const dismissCartToast = useCallback(() => setCartToast(null), []);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      try {
        const fetchedBooks = await getBooks();
        setBooks(fetchedBooks);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    const id = setInterval(() => setSessionTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage =
        (scrollTop / (documentHeight - windowHeight)) * 100;
      if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage;
        tracker.trackScrollDepth(scrollPercentage);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      tracker.trackPageVisibility(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const catalog = useMemo(() => {
    const map = new Map();
    [...books, ...apiSearchBooks].forEach((b) => map.set(b.id, b));
    return Array.from(map.values());
  }, [books, apiSearchBooks]);

  /** True when the initial catalog already has a title/author match for the query */
  const booksMatchSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return true;
    return books.some(
      (b) =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }, [books, searchQuery]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setApiSearchBooks([]);
      setSearching(false);
      return;
    }
    if (booksMatchSearch) {
      setApiSearchBooks([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchGoogleBooks(q, 24);
        if (!cancelled) setApiSearchBooks(found);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 480);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, booksMatchSearch]);

  const displayedBooks = useMemo(
    () =>
      filterSortBooks(catalog, {
        query: searchQuery,
        genre: genreFilter,
        sort: sortKey,
      }),
    [catalog, searchQuery, genreFilter, sortKey]
  );

  const viewCounts = useMemo(() => {
    void sessionTick;
    return tracker.getViewCountsByBookId();
  }, [catalog, sessionTick]);

  const hourlyBuckets = useMemo(() => {
    void sessionTick;
    return tracker.getHourlyEventCounts().buckets;
  }, [sessionTick]);

  const genreIntensity = useMemo(() => {
    void sessionTick;
    return tracker.getGenreIntensityMap();
  }, [sessionTick]);

  const priceAlertHits = useMemo(() => {
    void libraryTick;
    const alerts = getPriceAlerts();
    const hits = [];
    for (const [bookId, cfg] of Object.entries(alerts)) {
      const book = catalog.find((b) => b.id === bookId);
      if (book && Number(book.price) <= Number(cfg.targetPrice)) {
        hits.push({
          bookId,
          title: book.title,
          currentPrice: book.price,
          targetPrice: cfg.targetPrice,
        });
      }
    }
    return hits;
  }, [catalog, libraryTick]);

  const handleAddToCart = (book) => {
    setCart((c) => [...c, book]);
    tracker.trackAddToCart(book);
    setCartToast(`Added to cart: ${book.title}`);
  };

  const handleBuyNow = (book) => {
    setCart((c) => [...c, book]);
    tracker.trackAddToCart(book);
    openCart();
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
  };

  const handleSearchSubmit = useCallback(async () => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      if (booksMatchSearch) {
        setApiSearchBooks([]);
      } else {
        const found = await searchGoogleBooks(q, 24);
        setApiSearchBooks(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, booksMatchSearch]);

  const handleRemoveCartLine = (idx) => {
    setCart((c) => c.filter((_, i) => i !== idx));
  };

  const openCart = () => {
    setWishlistOpen(false);
    setCartOpen(true);
    tracker.trackEvent('cart_panel_open', { items: cart.length });
  };

  const openWishlist = () => {
    setCartOpen(false);
    setWishlistOpen(true);
    tracker.trackEvent('wishlist_panel_open', { items: wishlistBooks.length });
  };

  const toggleWishlist = (book) => {
    toggleWishlistBook(book);
    setWishlistBooks(getWishlistBooks());
  };

  const removeWishlist = (bookId) => {
    removeWishlistBook(bookId);
    setWishlistBooks(getWishlistBooks());
  };

  const bumpLibrary = () => {
    setReadingVersion((v) => v + 1);
    setLibraryTick((t) => t + 1);
  };

  const handleShowFeatures = () => {
    document.querySelector('.features-toggle')?.click();
  };
  const handleShowAnalytics = () => {
    document.querySelector('.debug-toggle')?.click();
  };
  const handleShowPredictions = () => {
    document.querySelector('.prediction-toggle')?.click();
  };
  const handleShowExport = () => {
    document.querySelector('.export-toggle')?.click();
  };

  const cartTotal = cart.reduce((s, b) => s + Number(b.price || 0), 0);

  return (
    <div className="App">
      <header className="header header-hero">
        <div className="header-top">
          <button
            type="button"
            className="header-menu-btn"
            onClick={openWishlist}
            title="Wishlist"
            aria-label="Open wishlist"
          >
            <Heart size={22} />
            {wishlistBooks.length > 0 && (
              <span className="header-menu-badge">{wishlistBooks.length}</span>
            )}
          </button>
          <div className="header-top-actions">
            <button
              type="button"
              className="hamburger-toggle-btn"
              onClick={() => setHamburgerOpen(true)}
            >
              <Menu size={26} />
            </button>
          </div>
        </div>

        <div className="header-brand">
          <p className="header-kicker">Discover your next read</p>
          <h1 className="header-title">
            <span className="header-title-page">Page</span>
            <span className="header-title-turner"> Turner</span>
          </h1>
          <div className="header-title-underline" aria-hidden />
          <p className="tagline">AI-powered book discovery &amp; behavior insights</p>
        </div>
      </header>

      {hamburgerOpen && (
        <div className="hamburger-overlay" onClick={() => setHamburgerOpen(false)}>
          <div className="hamburger-menu" onClick={(e) => e.stopPropagation()}>
            <div className="hamburger-header">
              <h3>Menu</h3>
              <button onClick={() => setHamburgerOpen(false)}><X size={24} /></button>
            </div>
            
            <div className="hamburger-theme">
              <span>Theme</span>
              <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
            </div>

            <button
              className="hamburger-cart-btn"
              onClick={() => {
                setHamburgerOpen(false);
                openCart();
              }}
            >
              🛒 Cart: {cart.length}
              {cart.length > 0 && <span> ${cartTotal.toFixed(2)}</span>}
            </button>

            <button
              className="hamburger-option-btn"
              onClick={() => {
                setHamburgerOpen(false);
                setPersonalityOpen(true); 
              }}
            >
             📚 Reading Personality Profiling
            </button>
          </div>
        </div>
      )}

      <PriceAlertsBanner hits={priceAlertHits} />

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading books from Google Books...</p>
        </div>
      ) : (
        <>
          {!(searchQuery.trim().length > 0) && (
            <TrendingSection
              books={catalog}
              viewCountsByBookId={viewCounts}
              onBookClick={handleBookClick}
              onAddToCart={handleAddToCart}
            />
          )}

          <DiscoveryToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            genre={genreFilter}
            onGenreChange={setGenreFilter}
            sort={sortKey}
            onSortChange={setSortKey}
            genresSourceBooks={catalog}
            searching={searching}
          />

          <div className="browse-block">
            <h2 className="browse-heading">
              {searchQuery.trim().length > 0 ? 'Search Results' : 'Browse the collection'}
            </h2>
            <p className="browse-sub">
              {searching && !booksMatchSearch && searchQuery.trim().length >= 2
                ? 'Searching Google Books for titles not in your local set…'
                : 'Filter, sort, and open any book for details'}
            </p>
          </div>

          <div className="books-grid">
            {displayedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onBookClick={handleBookClick}
                wishlisted={wishlistIds.includes(book.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>

          {displayedBooks.length === 0 && (
            <p className="empty-catalog-msg">
              No books match your filters. Try clearing search or choose “All genres”.
            </p>
          )}

          {!(searchQuery.trim().length > 0) && (
            <>
              <BehaviorHeatmap
                hourlyBuckets={hourlyBuckets}
                genreIntensity={genreIntensity}
                books={catalog}
                viewCountsByBookId={viewCounts}
              />

              <ReadingListWidget
                books={catalog}
                onBookClick={handleBookClick}
                readingVersion={readingVersion}
              />

              <RecommendationsSection books={catalog} onAddToCart={handleAddToCart} />
            </>
          )}
        </>
      )}

      <DebugPanel />
      <FeaturesPanel />
      <PredictionPanel />
      <DataExportPanel />
      <ControlPanel
        onShowFeatures={handleShowFeatures}
        onShowAnalytics={handleShowAnalytics}
        onShowPredictions={handleShowPredictions}
        onShowExport={handleShowExport}
      />
      <SmartIntervention books={catalog} onAddToCart={handleAddToCart} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onRemove={handleRemoveCartLine}
        onCheckout={() => {
          tracker.trackEvent('checkout_demo', { items: cart.length });
          predictor.trackConversion(tracker.sessionId);
          setCart([]);
          alert('Checkout is a demo — your ML session data was successfully logged as a conversion!');
          setCartOpen(false);
        }}
      />

      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistBooks={wishlistBooks}
        onBookClick={handleBookClick}
        onRemove={removeWishlist}
      />

      <CartToast message={cartToast} onClose={dismissCartToast} />

      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          allBooks={catalog}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onSelectBook={(b) => setSelectedBook(b)}
          wishlistIds={wishlistIds}
          onToggleWishlist={toggleWishlist}
          onLibraryChange={bumpLibrary}
        />
      )}
       {/* ADD THIS: */}
      <PersonalityProfile 
        isOpen={personalityOpen}
        onClose={() => setPersonalityOpen(false)}
      />
    </div>
  );
}

export default App;
