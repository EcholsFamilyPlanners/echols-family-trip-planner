import { useState, useMemo } from 'react';
import { mergeTrips } from '../services/travelOsService';

export default function MergeTripsModal({ trip, allDestinations, customTrips, onClose, onMerged }) {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null);
  const [direction, setDirection] = useState(null); // 'into-target' or 'target-into-this'
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allDestinations
      .filter(d => d.id !== trip.id)
      .filter(d => d.title.toLowerCase().includes(q) || d.region.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, allDestinations, trip.id]);

  const isCustomTripId = (id) => customTrips.some(t => t.id === id);

  const canConfirm = confirmText.trim().toUpperCase() === 'YES' && target && direction;

  const handleMerge = async () => {
    if (!canConfirm) return;
    setLoading(true);
    try {
      if (direction === 'into-target') {
        // current trip merges INTO target — current trip disappears
        await mergeTrips(trip.id, target.id, isCustomTripId(trip.id));
      } else {
        // target merges INTO current trip — target disappears
        await mergeTrips(target.id, trip.id, isCustomTripId(target.id));
      }
      if (onMerged) await onMerged();
      onClose();
    } catch (e) {
      alert('Error merging trips: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const survivingTrip = direction === 'into-target' ? target : trip;
  const disappearingTrip = direction === 'into-target' ? trip : target;

  return (
    <div className="pdfImportOverlay" onClick={() => !loading && onClose()}>
      <div className="pdfImportModal" onClick={e => e.stopPropagation()}>
        <div className="pdfImportHeader">
          <h2>🔗 Merge Trips</h2>
          <button className="btn secondary small" onClick={onClose} disabled={loading}>✕</button>
        </div>

        <p className="muted">Combine "<b>{trip.title}</b>" with another trip — useful when you had a quick idea and later researched it as a separate entry.</p>

        {!target && (
          <>
            <input
              className="mergeSearchInput"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for the other trip..."
              autoFocus
            />
            {results.length > 0 && (
              <div className="mergeResults">
                {results.map(d => (
                  <button key={d.id} className="mergeResultRow" onClick={() => setTarget(d)}>
                    <b>{d.title}</b>
                    <span className="muted"> · {d.region}</span>
                  </button>
                ))}
              </div>
            )}
            {query.trim() && results.length === 0 && (
              <p className="muted" style={{marginTop:'.75rem'}}>No matching trips found.</p>
            )}
          </>
        )}

        {target && !direction && (
          <>
            <div className="mergeSelectedTrip">
              Merging with: <b>{target.title}</b>
              <button className="btn secondary small" onClick={()=>setTarget(null)} style={{marginLeft:'.5rem'}}>Change</button>
            </div>
            <p className="muted" style={{marginTop:'1rem'}}>Which trip should remain after merging? The other will be removed and all its data — hotels, restaurants, budget, photos, journal — will move into the one you keep.</p>
            <div className="mergeDirectionOptions">
              <button className="mergeDirectionBtn" onClick={()=>setDirection('into-target')}>
                <b>Keep "{target.title}"</b>
                <span className="muted">"{trip.title}" data moves in, then is removed</span>
              </button>
              <button className="mergeDirectionBtn" onClick={()=>setDirection('target-into-this')}>
                <b>Keep "{trip.title}"</b>
                <span className="muted">"{target.title}" data moves in, then is removed</span>
              </button>
            </div>
          </>
        )}

        {target && direction && (
          <>
            <div className="mergeSummary">
              <p>✅ <b>{survivingTrip.title}</b> will remain, with all data combined.</p>
              <p>🗑️ <b>{disappearingTrip.title}</b> will be {isCustomTripId(disappearingTrip.id) ? 'permanently deleted' : 'archived'} after its data is moved.</p>
            </div>
            <p style={{marginTop:'1rem'}}>Type <b>YES</b> to confirm this merge.</p>
            <input
              className="deleteConfirmInput"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Type YES to confirm"
              autoFocus
            />
            <div className="formActions" style={{marginTop:'1.25rem'}}>
              <button className="btn secondary" onClick={()=>setDirection(null)} disabled={loading}>Back</button>
              <button className="btn gold" onClick={handleMerge} disabled={!canConfirm || loading}>
                {loading ? 'Merging...' : 'Merge Trips'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
