import fallbackBooks from '../data/books';

// src/services/bookService.js

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// Define which genres to fetch
const GENRE_QUERIES = {
  fiction: 'subject:fiction',
  thriller: 'subject:thriller',
  selfhelp: 'subject:self-help',
  scifi: 'subject:science+fiction',
  romance: 'subject:romance',
  business: 'subject:business'
};

// Helper: Generate random price (Google doesn't always have prices)
function generatePrice() {
  return (Math.random() * 15 + 10).toFixed(2); // Between $10-$25
}

function mapVolumeToBook(item, genreName, index) {
  const volumeInfo = item.volumeInfo || {};
  const stableId =
    item.id || `${genreName}_${index}_${volumeInfo.title || 'book'}_${Date.now()}`;

  const displayGenre =
    volumeInfo.categories?.[0] ||
    (genreName === 'search'
      ? 'General'
      : genreName.charAt(0).toUpperCase() + genreName.slice(1));

  return {
    id: stableId,
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors?.[0] || 'Unknown Author',
    description: volumeInfo.description
      ? volumeInfo.description.substring(0, 200) + '...'
      : 'No description available',
    price: parseFloat(generatePrice()),
    genre: displayGenre,
    pages: volumeInfo.pageCount || Math.floor(Math.random() * 200 + 200),
    rating: volumeInfo.averageRating || (Math.random() * 1 + 4).toFixed(1),
    popularity: volumeInfo.averageRating > 4.5 ? 'bestseller' : 'popular',
    cover:
      volumeInfo.imageLinks?.large ||
      volumeInfo.imageLinks?.medium ||
      volumeInfo.imageLinks?.thumbnail ||
      volumeInfo.imageLinks?.smallThumbnail ||
      '/placeholder.jpg',
    themes: volumeInfo.categories || [genreName],
  };
}

// Fetch books from Google for a specific genre or query string
async function fetchBooksFromGoogle(query, genreName, maxResults = 10) {
  try {
    const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      console.warn(`No books found for query: ${query}`);
      return [];
    }

    return data.items.map((item, index) => mapVolumeToBook(item, genreName, index));
  } catch (error) {
    console.error(`Error fetching books for ${genreName}:`, error);
    return [];
  }
}

// Main function: Fetch initial 40 books (mix of genres)
export async function fetchInitialBooks() {
  console.log('📚 Fetching books from Google Books API...');
  
  // Fetch all genres at the same time (parallel)
  const promises = Object.entries(GENRE_QUERIES).map(([genreName, query]) => {
    console.log(`   Fetching ${genreName}...`);
    return fetchBooksFromGoogle(query, genreName, 7);
  });
  
  // Wait for all to complete
  const results = await Promise.all(promises);
  
  // Flatten the array
  const allBooks = results.flat();
  
  console.log(`✅ Fetched ${allBooks.length} books total!`);
  return allBooks;
}
/**
 * Search Google Books by free-text query (title, author, keywords).
 * Uses stable volume IDs when the API returns them.
 */
export async function searchGoogleBooks(searchQuery, maxResults = 20) {
  const q = searchQuery.trim();
  console.log(`🔍 Searching Google Books API for: "${q}"`);

  if (!q) return [];

  const books = await fetchBooksFromGoogle(q, 'search', maxResults);

  console.log(`✅ Found ${books.length} results`);
  return books;
}

// Get books from cache or fetch new ones
export async function getBooks() {
  try{
  // Check localStorage cache
  const cachedBooks = localStorage.getItem('google_books');
  const cacheTimestamp = localStorage.getItem('google_books_timestamp');
  
  // If cache exists and is less than 24 hours old, use it
  if (cachedBooks && cacheTimestamp) {
    const hoursSinceCached = (Date.now() - parseInt(cacheTimestamp)) / (1000 * 60 * 60);
    
    if (hoursSinceCached < 24) {
      console.log('✅ Using cached books (fresh)');
      return JSON.parse(cachedBooks);
    }
  }
  
  // Otherwise, fetch fresh books from Google
  console.log('🔄 Cache expired or missing, fetching fresh books...');
  const books = await fetchInitialBooks();
  
  // Save to cache
  localStorage.setItem('google_books', JSON.stringify(books));
  localStorage.setItem('google_books_timestamp', Date.now().toString());
   if (books.length === 0) {
      console.warn('⚠️ No books from Google, using fallback');
      return fallbackBooks;
    } return books;
}
      catch (error) {
    console.error('❌ Google Books API error, using fallback:', error);
    return fallbackBooks;  // Use old 6 books if API fails
  }
  
}