import { useState, useRef } from 'react';
import { saveBudgetItem, pollReceiptScanJob } from '../services/travelOsService';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Compress and resize an image client-side before upload so the request
// body stays well under Netlify's 6MB limit, even for full-res phone photos.
function compressImage(file, maxDimension = 1600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDimension) {
        height = Math.round(height * (maxDimension / width));
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round(width * (maxDimension / height));
        height = maxDimension;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          const compressedReader = new FileReader();
          compressedReader.onload = () => resolve(compressedReader.result.split(',')[1]);
          compressedReader.onerror = reject;
          compressedReader.readAsDataURL(blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const CATEGORIES = ['Flights','Hotel','Food & Dining','Activities','Car & Transport','Shopping','Other'];

export default function ReceiptScanner({ tripId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload a photo of a receipt.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image is too large — please use a file under 10MB.'); return; }

    setLoading(true);
    setError('');
    setExtracted(null);
    setProgress('Uploading receipt...');

    try {
      const base64 = await compressImage(file);
      setProgress('Reading receipt with AI...');

      const startRes = await fetch('/.netlify/functions/start-receipt-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, imageBase64: base64, mediaType: 'image/jpeg' }),
      });
      const startData = await startRes.json();
      if (startData.error) { setError(startData.error); setLoading(false); return; }

      const jobId = startData.jobId;
      let attempts = 0;
      let result = null;
      while (attempts < 30) {
        await sleep(2000);
        const job = await pollReceiptScanJob(jobId);
        if (job?.status === 'complete') { result = job.result; break; }
        if (job?.status === 'error') { setError(job.error_message || 'Something went wrong scanning the receipt.'); break; }
        attempts++;
      }

      if (result) {
        setExtracted(result);
      } else if (!error) {
        setError('This is taking longer than expected. Please try again.');
      }
    } catch (e) {
      setError('Something went wrong: ' + e.message);
    } finally {
      setLoading(false);
      setProgress('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async () => {
    if (!extracted) return;
    setLoading(true);
    try {
      await saveBudgetItem({
        trip_id: tripId,
        category: CATEGORIES.includes(extracted.category) ? extracted.category : 'Other',
        label: extracted.merchant || 'Receipt',
        estimated: 0,
        actual: Number(extracted.total) || 0,
        notes: [
          extracted.date ? `Date: ${extracted.date}` : '',
          extracted.notes || '',
          (extracted.items||[]).length ? `Items: ${extracted.items.map(i=>i.name).join(', ')}` : ''
        ].filter(Boolean).join(' · '),
        sort_order: 999,
      });
      setOpen(false);
      setExtracted(null);
      if (onSaved) await onSaved();
    } catch (e) {
      alert('Error saving: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button className="btn secondary" onClick={() => setOpen(true)}>
        📷 Scan Receipt
      </button>
    );
  }

  return (
    <div className="pdfImportOverlay" onClick={() => !loading && setOpen(false)}>
      <div className="pdfImportModal" onClick={e => e.stopPropagation()}>
        <div className="pdfImportHeader">
          <h2>📷 Scan Receipt</h2>
          <button className="btn secondary small" onClick={() => setOpen(false)} disabled={loading}>✕</button>
        </div>

        {!extracted && !loading && (
          <>
            <p className="muted">Take a photo of a receipt or upload one from your gallery. We'll read the merchant, total, and category for you to confirm.</p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])} />
            <div className="photoDropZone" onClick={() => fileRef.current?.click()}>
              <span>📷</span>
              <p>Tap to take a photo or choose one</p>
              <small>Max 10MB</small>
            </div>
            {error && <p className="pdfImportError">{error}</p>}
          </>
        )}

        {loading && (
          <div className="pdfImportLoading">
            <p>{progress || 'Processing...'}</p>
            <small className="muted">This usually takes 15-30 seconds.</small>
          </div>
        )}

        {extracted && !loading && (
          <div className="pdfImportResults">
            <div className="receiptPreview">
              <div className="receiptRow"><span>Merchant</span><b>{extracted.merchant || 'Unknown'}</b></div>
              <div className="receiptRow"><span>Date</span><b>{extracted.date || '—'}</b></div>
              <div className="receiptRow"><span>Total</span><b>${Number(extracted.total||0).toFixed(2)}</b></div>
              <div className="receiptRow"><span>Category</span><b>{extracted.category || 'Other'}</b></div>
              {extracted.notes && <p className="muted" style={{marginTop:'.5rem'}}>{extracted.notes}</p>}
            </div>
            <div className="formActions" style={{marginTop:'1rem'}}>
              <button className="btn gold" onClick={save}>Save to Budget</button>
              <button className="btn secondary" onClick={()=>{setExtracted(null);setError('');}}>Try Another</button>
              <button className="btn secondary" onClick={()=>setOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
