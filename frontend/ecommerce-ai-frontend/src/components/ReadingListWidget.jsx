import { useMemo } from 'react';

import { getReadingProgress } from '../utils/userLibrary';

function ReadingListWidget({ books, onBookClick, readingVersion }) {
  const items = useMemo(() => {
    void readingVersion;
    const progress = getReadingProgress();
    const out = [];
    for (const b of books) {
      const p = progress[b.id];
      if (!p) continue;
      const total = p.totalPages || b.pages || 300;
      const cur = Math.min(p.currentPage || 0, total);
      const pct = total ? Math.round((cur / total) * 100) : 0;
      if (pct <= 0 && cur <= 0) continue;
      out.push({ book: b, cur, total, pct });
    }
    return out.slice(0, 6);
  }, [books, readingVersion]);

  if (!items.length) return null;

  return (
    <section className="reading-widget" aria-labelledby="reading-heading">
      <h2 id="reading-heading">Reading list progress</h2>
      <ul className="reading-list">
        {items.map(({ book, cur, total, pct }) => (
          <li key={book.id}>
            <button type="button" className="reading-row" onClick={() => onBookClick(book)}>
              <img src={book.cover} alt="" />
              <div>
                <div className="reading-title">{book.title}</div>
                <div className="reading-meta">
                  p.{cur} / {total} · {pct}%
                </div>
                <div className="reading-bar">
                  <div className="reading-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ReadingListWidget;
