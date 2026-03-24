/**
 * Client-side persistence for wishlist, price alerts, reading progress, reviews.
 * ML/behavior features still use tracker (session); this complements “user library” UX.
 */

const WISHLIST = 'pageturner_wishlist_ids';
const PRICE_ALERTS = 'pageturner_price_alerts';
const READING = 'pageturner_reading_progress';
const REVIEWS = 'pageturner_book_reviews';
const THEME = 'pageturner_theme';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getWishlistIds() {
  return readJson(WISHLIST, []);
}

export function setWishlistIds(ids) {
  writeJson(WISHLIST, ids);
}

export function toggleWishlistId(bookId) {
  const ids = getWishlistIds();
  const has = ids.includes(bookId);
  const next = has ? ids.filter((id) => id !== bookId) : [...ids, bookId];
  setWishlistIds(next);
  return !has;
}

export function getPriceAlerts() {
  return readJson(PRICE_ALERTS, {});
}

/** @param {string} bookId @param {number} targetPrice alert when live price <= target */
export function setPriceAlert(bookId, targetPrice) {
  const all = getPriceAlerts();
  all[bookId] = {
    targetPrice: Number(targetPrice),
    setAt: Date.now(),
  };
  writeJson(PRICE_ALERTS, all);
}

export function removePriceAlert(bookId) {
  const all = getPriceAlerts();
  delete all[bookId];
  writeJson(PRICE_ALERTS, all);
}

export function getReadingProgress() {
  return readJson(READING, {});
}

/** @param {string} bookId @param {number} currentPage */
export function setReadingProgress(bookId, currentPage, totalPages) {
  const all = getReadingProgress();
  const p = Math.max(0, Math.min(Number(currentPage) || 0, totalPages || 1));
  all[bookId] = {
    currentPage: p,
    totalPages: totalPages || 300,
    updatedAt: Date.now(),
  };
  writeJson(READING, all);
}

export function getReviewsForBook(bookId) {
  const all = readJson(REVIEWS, {});
  return all[bookId] || [];
}

export function addReview(bookId, { rating, text }) {
  const all = readJson(REVIEWS, {});
  const list = all[bookId] || [];
  const entry = {
    id: `r_${Date.now()}`,
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    text: String(text || '').trim(),
    createdAt: Date.now(),
  };
  all[bookId] = [entry, ...list];
  writeJson(REVIEWS, all);
  return entry;
}

export function getStoredTheme() {
  return localStorage.getItem(THEME) || 'dark';
}

export function setStoredTheme(mode) {
  localStorage.setItem(THEME, mode);
}
