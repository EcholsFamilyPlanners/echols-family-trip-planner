import { useState, useRef } from 'react';
import { saveHotel, saveRestaurant, saveBudgetItem, saveSharedTripPatch, pollPdfImportJob } from '../services/travelOsService';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function PdfImport({ tripId, sharedNotes, onImported }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState('');
  const [selections, setSelections] = useState({});
  const fileRef = useRef();

  const [progress, setProgress] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('PDF is too large — please use a file under 20MB.'); return; }

    setLoading(true);
    setError('');
    setExtracted(null);
    setProgress('Uploading document...');

    try {
      const base64 = await fileToBase64(file);

      setProgress('Starting analysis...');
      const startRes = await fetch('/.netlify/functions/start-pdf-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, pdfBase64: base64, fileName: file.name }),
      });
      const startData = await startRes.json();

      if (startData.error) {
        setError(startData.error);
        setLoading(false);
        return;
      }

      const jobId = startData.jobId;
      setProgress('Reading your document with AI...');

      // Poll for completion — up to ~2 minutes
      let attempts = 0;
      let result = null;
      while (attempts < 40) {
        await sleep(3000);
        const job = await pollPdfImportJob(jobId);
        if (job?.status === 'complete') { result = job.result; break; }
        if (job?.status === 'error') { setError(job.error_message || 'Something went wrong processing the PDF.'); break; }
        attempts++;
      }

      if (result) {
        setExtracted(result);
        const sel = {
          hotels: (result.hotels || []).map(() => true),
          restaurants: (result.restaurants || []).map(() => true),
          budget_items: (result.budget_items || []).map(() => true),
          notes: true,
        };
        setSelections(sel);
      } else if (!error) {
        setError('This is taking longer than expected. Please try again with a smaller PDF.');
      }
    } catch (e) {
      setError('Something went wrong reading the PDF: ' + e.message);
    } finally {
      setLoading(false);
      setProgress('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const toggleSel = (group, idx) => {
    setSelections(prev => {
      const next = { ...prev };
      next[group] = [...(next[group] || [])];
      next[group][idx] = !next[group][idx];
      return next;
    });
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      // Hotels
      for (let i = 0; i < (extracted.hotels || []).length; i++) {
        if (!selections.hotels?.[i]) continue;
        const h = extracted.hotels[i];
        await saveHotel({
          trip_id: tripId,
          name: h.name || 'Untitled Hotel',
          neighborhood: h.neighborhood || '',
          price_per_night: h.price_per_night || null,
          stars: null,
          status: 'Considering',
          url: '',
          notes: h.notes || '',
        });
      }
      // Restaurants
      for (let i = 0; i < (extracted.restaurants || []).length; i++) {
        if (!selections.restaurants?.[i]) continue;
        const r = extracted.restaurants[i];
        await saveRestaurant({
          trip_id: tripId,
          name: r.name || 'Untitled Restaurant',
          cuisine: r.cuisine || '',
          price_range: '$$',
          must_try: false,
          health_rating: '',
          url: '',
          notes: r.notes || '',
        });
      }
      // Budget items
      for (let i = 0; i < (extracted.budget_items || []).length; i++) {
        if (!selections.budget_items?.[i]) continue;
        const b = extracted.budget_items[i];
        await saveBudgetItem({
          trip_id: tripId,
          category: b.category || 'Other',
          label: b.label || 'Imported item',
          estimated: Number(b.estimated) || 0,
          actual: null,
          notes: 'Imported from PDF',
          sort_order: 999,
        });
      }
      // General notes + itinerary
      if (selections.notes && (extracted.general_notes || (extracted.itinerary_days || []).length)) {
        const itineraryText = (extracted.itinerary_days || [])
          .map(d => `Day ${d.day}: ${d.summary}`).join('\n');
        const combinedNotes = [sharedNotes?.itinerary_notes, itineraryText].filter(Boolean).join('\n\n');
        const combinedShared = [sharedNotes?.shared_notes, extracted.general_notes].filter(Boolean).join('\n\n');

        await saveSharedTripPatch(tripId, {
          itinerary_notes: combinedNotes,
          shared_notes: combinedShared,
        }, sharedNotes || {});
      }

      setOpen(false);
      setExtracted(null);
      if (onImported) await onImported();
      alert('Import complete! Check the relevant tabs to see what was added.');
    } catch (e) {
      alert('Error saving imported data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button className="btn gold" onClick={() => setOpen(true)}>
        📄 Import from PDF
      </button>
    );
  }

  return (
    <div className="pdfImportOverlay" onClick={() => !loading && setOpen(false)}>
      <div className="pdfImportModal" onClick={e => e.stopPropagation()}>
        <div className="pdfImportHeader">
          <h2>📄 Import Trip Info from PDF</h2>
          <button className="btn secondary small" onClick={() => setOpen(false)} disabled={loading}>✕</button>
        </div>

        {!extracted && !loading && (
          <>
            <p className="muted">Upload a travel article, itinerary, brochure, or blog post saved as a PDF. We'll read it and pull out hotels, restaurants, budget estimates, and itinerary notes for you to review.</p>
            <input ref={fileRef} type="file" accept="application/pdf" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])} />
            <div className="photoDropZone" onClick={() => fileRef.current?.click()}
              onDragOver={e=>e.preventDefault()}
              onDrop={e=>{e.preventDefault(); handleFile(e.dataTransfer.files[0]);}}>
              <span>📄</span>
              <p>Click or drag a PDF here</p>
              <small>Max 20MB</small>
            </div>
            {error && <p className="pdfImportError">{error}</p>}
          </>
        )}

        {loading && (
          <div className="pdfImportLoading">
            <p>{progress || 'Reading your document...'}</p>
            <small className="muted">This can take up to a minute for longer documents.</small>
          </div>
        )}

        {extracted && !loading && (
          <div className="pdfImportResults">
            {extracted.destination_guess && (
              <p className="pdfImportGuess">📍 Looks like: <b>{extracted.destination_guess}</b></p>
            )}

            {(extracted.hotels || []).length > 0 && (
              <div className="pdfImportSection">
                <h3>🏨 Hotels Found ({extracted.hotels.length})</h3>
                {extracted.hotels.map((h, i) => (
                  <label key={i} className="pdfImportItem">
                    <input type="checkbox" checked={!!selections.hotels?.[i]} onChange={()=>toggleSel('hotels',i)} />
                    <div>
                      <b>{h.name}</b>
                      {h.neighborhood && <span> · {h.neighborhood}</span>}
                      {h.price_per_night && <span> · ${h.price_per_night}/night</span>}
                      {h.notes && <p className="muted">{h.notes}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {(extracted.restaurants || []).length > 0 && (
              <div className="pdfImportSection">
                <h3>🍽️ Restaurants Found ({extracted.restaurants.length})</h3>
                {extracted.restaurants.map((r, i) => (
                  <label key={i} className="pdfImportItem">
                    <input type="checkbox" checked={!!selections.restaurants?.[i]} onChange={()=>toggleSel('restaurants',i)} />
                    <div>
                      <b>{r.name}</b>
                      {r.cuisine && <span> · {r.cuisine}</span>}
                      {r.notes && <p className="muted">{r.notes}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {(extracted.budget_items || []).length > 0 && (
              <div className="pdfImportSection">
                <h3>💰 Budget Items Found ({extracted.budget_items.length})</h3>
                {extracted.budget_items.map((b, i) => (
                  <label key={i} className="pdfImportItem">
                    <input type="checkbox" checked={!!selections.budget_items?.[i]} onChange={()=>toggleSel('budget_items',i)} />
                    <div>
                      <b>{b.label}</b>
                      <span> · {b.category}</span>
                      {b.estimated && <span> · ${b.estimated}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {(extracted.general_notes || (extracted.itinerary_days||[]).length > 0) && (
              <div className="pdfImportSection">
                <label className="pdfImportItem">
                  <input type="checkbox" checked={!!selections.notes} onChange={()=>setSelections(p=>({...p,notes:!p.notes}))} />
                  <div>
                    <b>📝 General Notes & Itinerary</b>
                    {extracted.general_notes && <p className="muted">{extracted.general_notes}</p>}
                    {(extracted.itinerary_days||[]).length > 0 && (
                      <p className="muted">{extracted.itinerary_days.length} day(s) of itinerary text found</p>
                    )}
                  </div>
                </label>
              </div>
            )}

            {!extracted.hotels?.length && !extracted.restaurants?.length && !extracted.budget_items?.length && !extracted.general_notes && (
              <p className="muted">We couldn't find any structured travel info in this document. Try a different PDF, or add details manually.</p>
            )}

            <div className="formActions" style={{marginTop:'1.5rem'}}>
              <button className="btn gold" onClick={saveAll} disabled={loading}>Save Selected Items</button>
              <button className="btn secondary" onClick={()=>{setExtracted(null);setError('');}}>Try Another PDF</button>
              <button className="btn secondary" onClick={()=>setOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
