import { useEffect, useMemo, useRef } from 'react';

import { trendingScore } from '../utils/bookDisplay';

function TrendingSection({ books, viewCountsByBookId, onBookClick, onAddToCart }) {
  const stripRef = useRef(null);

  const trending = useMemo(() => {
    if (!books?.length) return [];
    return [...books]
      .map((b) => ({
        book: b,
        score: trendingScore(b, viewCountsByBookId[b.id] || 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 14)
      .map((x) => x.book);
  }, [books, viewCountsByBookId]);

  const loopItems = useMemo(() => [...trending, ...trending], [trending]);

  useEffect(() => {
    const el = stripRef.current;
    if (!el || trending.length < 2) return undefined;

    let raf;
    let cancelled = false;
    const speed = 0.55;

    const tick = () => {
      if (cancelled || !el) return;
      const half = el.scrollWidth / 2;
      if (half <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      el.scrollLeft += speed;
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [trending]);

  if (!trending.length) return null;

  return (
    <section className="trending-section trending-netflix" aria-labelledby="trending-heading">
      <div className="trending-header">
        <h2 id="trending-heading" className="trending-title">
          <span className="trending-title-gradient">Trending now</span>
        </h2>
        <p className="trending-sub">Top picks for you — endless row, hover for details</p>
      </div>
      <div className="trending-viewport trending-netflix-viewport">
        <div className="trending-strip trending-netflix-strip" ref={stripRef}>
          {loopItems.map((book, i) => (
            <article
              key={`${book.id}-${i}`}
              className="trending-poster-card"
              style={{ '--i': i % trending.length }}
            >
              <button
                type="button"
                className="trending-poster-btn"
                onClick={() => onBookClick(book)}
              >
                <div className="trending-poster-image-wrap">
                  <img src={book.cover} alt="" loading="lazy" />
                  <div className="trending-poster-shade" />
                  <span className="trending-poster-rank">
                    #{(i % trending.length) + 1}
                  </span>
                </div>
                <div className="trending-poster-caption">
                  <h3 className="trending-poster-title">{book.title}</h3>
                  <p className="trending-poster-meta">
                    ⭐ {book.rating} · {book.genre}
                  </p>
                </div>
              </button>
              <button
                type="button"
                className="trending-poster-add"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(book);
                }}
                title="Add to cart"
              >
                +
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingSection;
