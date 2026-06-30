import { useState } from 'react';
import { deleteCustomTrip, archiveTrip } from '../services/travelOsService';

export default function DeleteTripModal({ trip, isCustom, onClose, onDeleted }) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const canConfirm = confirmText.trim().toUpperCase() === 'YES';

  const handleDelete = async () => {
    if (!canConfirm) return;
    setLoading(true);
    try {
      if (isCustom) {
        await deleteCustomTrip(trip.id);
      } else {
        await archiveTrip(trip.id);
      }
      if (onDeleted) await onDeleted();
      onClose();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdfImportOverlay" onClick={() => !loading && onClose()}>
      <div className="deleteModal" onClick={e => e.stopPropagation()}>
        {step === 1 && (
          <>
            <h2>⚠️ {isCustom ? 'Delete' : 'Remove'} "{trip.title}"?</h2>
            {isCustom ? (
              <>
                <p>This will <b>permanently delete</b> this trip and everything attached to it:</p>
                <ul className="deleteWarningList">
                  <li>All hotels and restaurants</li>
                  <li>Budget items and spending history</li>
                  <li>Reservations</li>
                  <li>Photos and journal entries</li>
                  <li>Votes and wish list status</li>
                </ul>
                <p className="deleteWarning">This cannot be undone.</p>
              </>
            ) : (
              <>
                <p>This is one of the built-in destinations. We'll <b>remove it from your library</b> so it no longer clutters your view.</p>
                <p className="muted">Your notes, votes, photos, and other data for this trip will stay safely stored — you can restore it later from Settings if you change your mind.</p>
              </>
            )}
            <div className="formActions" style={{marginTop:'1.25rem'}}>
              <button className="btn secondary" onClick={onClose}>Cancel</button>
              <button className="btn danger-solid" onClick={() => isCustom ? setStep(2) : handleDelete()}>
                {isCustom ? "I understand, let's delete it" : 'Remove from library'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>⚠️ Final confirmation</h2>
            <p>To permanently delete <b>"{trip.title}"</b> and all its data, type <b>YES</b> in the box below.</p>
            <input
              className="deleteConfirmInput"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Type YES to confirm"
              autoFocus
            />
            <div className="formActions" style={{marginTop:'1.25rem'}}>
              <button className="btn secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button className="btn danger-solid" onClick={handleDelete} disabled={!canConfirm || loading}>
                {loading ? 'Deleting...' : 'Permanently Delete Trip'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
