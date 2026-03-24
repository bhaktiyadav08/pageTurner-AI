import { useMemo } from 'react';

/**
 * Session-level visualization aligned with ML feature engineering (time + genre signals).
 */
function BehaviorHeatmap({ hourlyBuckets, genreIntensity, books, viewCountsByBookId }) {
  const maxHour = useMemo(
    () => Math.max(1, ...hourlyBuckets),
    [hourlyBuckets]
  );
  
  const genreEntries = useMemo(() => {
    const entries = Object.entries(genreIntensity || {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 8);
  }, [genreIntensity]);
  
  const maxG = useMemo(
    () => Math.max(1, ...genreEntries.map(([, v]) => v)),
    [genreEntries]
  );

  const topBooks = useMemo(() => {
    if (!books || !viewCountsByBookId) return [];
    const counts = Object.entries(viewCountsByBookId).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return counts.map(([id, views]) => ({
      book: books.find(b => b.id === id) || { title: 'Unknown' },
      views
    }));
  }, [books, viewCountsByBookId]);

  return (
    <section className="heatmap-section" aria-labelledby="heatmap-heading">
      <h2 id="heatmap-heading" style={{ color: 'var(--text-color)' }}>User behaviour heatmap</h2>
      <p className="heatmap-note" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
        Visualising your tracking data and ML feature signals.
      </p>

      {topBooks.length > 0 && (
        <div className="heatmap-genres" style={{ marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '15px' }}>Shows: Which books get most attention</h3>
          <div className="heatmap-genre-rows">
            {topBooks.map(({ book, views }) => (
              <div key={book.id || book.title} className="heatmap-genre-row">
                <span className="heatmap-genre-name" style={{ color: 'var(--text-color)' }}>{book.title}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-color)', opacity: 0.7, paddingLeft: '8px' }}>
                  ({Math.round(views)} attention score)
                </span>
                <div className="heatmap-genre-bar-wrap">
                  <div
                    className="heatmap-genre-bar"
                    style={{ width: `${Math.min(100, (views / topBooks[0]?.views) * 100)}%`, background: 'var(--accent-color, #4facfe)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="heatmap-section-wrapper" style={{ marginBottom: '30px' }}>
        <h3 style={{ color: 'var(--text-color)', marginBottom: '15px' }}>Shows: Where users spend time</h3>
        <p style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-color)', opacity: 0.8 }}>Hourly event density (local time).</p>
        <div className="heatmap-hours">
          <span className="heatmap-axis-label" style={{ color: 'var(--text-color)' }}>0h</span>
          <div className="heatmap-hour-cells">
            {hourlyBuckets.map((n, h) => (
              <div
                key={h}
                className="heatmap-cell"
                style={{
                  opacity: 0.25 + (0.75 * n) / maxHour,
                }}
                title={`${h}:00 — ${n} events`}
              />
            ))}
          </div>
          <span className="heatmap-axis-label" style={{ color: 'var(--text-color)' }}>23h</span>
        </div>
      </div>

      {genreEntries.length > 0 && (
        <div className="heatmap-genres">
          <h3 style={{ color: 'var(--text-color)', marginBottom: '15px' }}>Shows: Click patterns</h3>
          <p style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-color)', opacity: 0.8 }}>Genre engagement based on your click tracking and views.</p>
          <div className="heatmap-genre-rows">
            {genreEntries.map(([genre, val]) => (
              <div key={genre} className="heatmap-genre-row">
                <span className="heatmap-genre-name" style={{ color: 'var(--text-color)' }}>{genre}</span>
                <div className="heatmap-genre-bar-wrap">
                  <div
                    className="heatmap-genre-bar"
                    style={{ width: `${(100 * val) / maxG}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default BehaviorHeatmap;
