/**
 * Client-side search, genre filter, sort — works with catalog + optional API search results.
 */

export function getUniqueGenres(books) {
  const s = new Set();
  for (const b of books) {
    if (b.genre) s.add(b.genre);
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}

export function trendingScore(book, viewCount = 0) {
  const r = parseFloat(book.rating) || 4;
  const pop = book.popularity === 'bestseller' ? 1.2 : 1;
  return r * Math.log1p(viewCount + 1) * pop;
}

/**
 * @param {object[]} books
 * @param {{ query: string, genre: string, sort: string }} opts
 */
export function filterSortBooks(books, { query, genre, sort }) {
  let list = [...books];

  const q = (query || '').trim().toLowerCase();
  if (q) {
    list = list.filter(
      (b) =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }

  if (genre && genre !== 'all') {
    list = list.filter(
      (b) => b.genre && b.genre.toLowerCase() === genre.toLowerCase()
    );
  }

  switch (sort) {
    case 'price-asc':
      list.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case 'price-desc':
      list.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case 'rating-desc':
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      break;
    case 'pages-asc':
      list.sort((a, b) => (a.pages || 0) - (b.pages || 0));
      break;
    case 'title-asc':
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'relevance':
    default:
      break;
  }

  return list;
}
