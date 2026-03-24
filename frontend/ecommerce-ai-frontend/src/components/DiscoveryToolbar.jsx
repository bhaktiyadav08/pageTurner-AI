import { useMemo } from 'react';

import { getUniqueGenres } from '../utils/bookDisplay';

function DiscoveryToolbar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  genre,
  onGenreChange,
  sort,
  onSortChange,
  genresSourceBooks,
  searching,
}) {
  const genres = useMemo(
    () => ['all', ...getUniqueGenres(genresSourceBooks || [])],
    [genresSourceBooks]
  );

  return (
    <div className="discovery-toolbar" role="search">
      <div className="discovery-field discovery-search">
        <label htmlFor="book-search" className="sr-only">
          Search books
        </label>
        <input
          id="book-search"
          type="search"
          placeholder="Search title or author — not in catalog? We query Google Books…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearchSubmit();
          }}
        />
        <button
          type="button"
          className="discovery-search-btn"
          onClick={onSearchSubmit}
          disabled={searching}
        >
          {searching ? '…' : 'Search'}
        </button>
      </div>

      <div className="discovery-field">
        <label htmlFor="genre-filter">Genre</label>
        <select
          id="genre-filter"
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
        >
          {genres.map((g) => (
            <option key={g} value={g}>
              {g === 'all' ? 'All genres' : g}
            </option>
          ))}
        </select>
      </div>

      <div className="discovery-field">
        <label htmlFor="sort-books">Sort</label>
        <select
          id="sort-books"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="rating-desc">Rating (high)</option>
          <option value="price-asc">Price (low)</option>
          <option value="price-desc">Price (high)</option>
          <option value="pages-asc">Length (pages)</option>
          <option value="title-asc">Title (A–Z)</option>
        </select>
      </div>
    </div>
  );
}

export default DiscoveryToolbar;
