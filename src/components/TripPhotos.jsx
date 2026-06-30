import { useState, useEffect, useRef } from 'react';
import { loadTripPhotos, uploadTripPhoto, deleteTripPhoto, setPhotoAsCover, updatePhotoCaption, loadSkylightFrames, sendPhotoToFrames } from '../services/travelOsService';
import { getSession } from '../services/travelOsService';

export default function TripPhotos({ tripId, onCoverChange, tripTitle }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null); // lightbox
  const [editCaption, setEditCaption] = useState('');
  const [frames, setFrames] = useState([]);
  const [sendingTo, setSendingTo] = useState(null);
  const [showSendPicker, setShowSendPicker] = useState(false);
  const [pickedFrames, setPickedFrames] = useState([]);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    const data = await loadTripPhotos(tripId);
    setPhotos(data);
    setLoading(false);
    const cover = data.find(p => p.is_cover);
    if (onCoverChange) onCoverChange(cover?.url || null);
  };

  useEffect(() => {
    load();
    loadSkylightFrames().then(setFrames);
  }, [tripId]);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const session = await getSession();
      const isFirst = photos.length === 0;
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) { alert(`${file.name} is over 10MB — please resize it first.`); continue; }
        const url = await uploadTripPhoto({
          tripId, file,
          caption: '',
          isCover: isFirst && i === 0,
          userId: session?.user?.id
        });
        if (url) uploadedUrls.push(url);
      }
      await load();

      // Auto-send to any frames marked auto_send
      const autoFrames = frames.filter(f => f.auto_send);
      if (autoFrames.length > 0 && uploadedUrls.length > 0) {
        try {
          for (const url of uploadedUrls) {
            await sendPhotoToFrames(autoFrames.map(f => f.email), url, '', tripTitle);
          }
        } catch (e) { console.error('Auto-send to frames failed:', e); }
      }
    } catch(e) {
      alert('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const sendToFrames = async () => {
    if (!selected || pickedFrames.length === 0) return;
    setSendingTo(selected.id);
    try {
      await sendPhotoToFrames(pickedFrames, selected.url, editCaption, tripTitle);
      alert('Sent! It should appear on the frame within a few minutes.');
      setShowSendPicker(false);
      setPickedFrames([]);
    } catch (e) {
      alert('Error sending to frame: ' + e.message);
    } finally {
      setSendingTo(null);
    }
  };

  const makeCover = async (photo) => {
    await setPhotoAsCover(photo.id, tripId);
    await load();
  };

  const remove = async (photo) => {
    if (!confirm('Delete this photo?')) return;
    await deleteTripPhoto(photo);
    if (selected?.id === photo.id) setSelected(null);
    await load();
  };

  const saveCaption = async (photo) => {
    await updatePhotoCaption(photo.id, editCaption);
    setSelected(null);
    await load();
  };

  const cover = photos.find(p => p.is_cover);

  return (
    <section className="panel photoPanel">
      <div className="photoHeader">
        <div>
          <h2>📸 Trip Photos</h2>
          <p className="muted">{photos.length} photo{photos.length !== 1 ? 's' : ''}
            {cover ? ' · Cover photo set' : photos.length > 0 ? ' · No cover set' : ''}
          </p>
        </div>
        <div className="photoHeaderActions">
          <input
            ref={fileRef} type="file" accept="image/*" multiple
            style={{display:'none'}}
            onChange={e => handleFiles(e.target.files)}
          />
          <button className="btn gold" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : '+ Add Photos'}
          </button>
        </div>
      </div>

      {/* Drop zone when empty */}
      {photos.length === 0 && !loading && (
        <div
          className="photoDropZone"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <span>📷</span>
          <p>Click or drag photos here to upload</p>
          <small>JPG, PNG, HEIC · Max 10MB per photo</small>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div
          className="photoUploadGrid"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          {photos.map(photo => (
            <div key={photo.id} className={`photoThumb ${photo.is_cover ? 'isCover' : ''}`}>
              <img
                src={photo.url} alt={photo.caption || 'Trip photo'}
                onClick={() => { setSelected(photo); setEditCaption(photo.caption || ''); }}
                loading="lazy"
              />
              {photo.is_cover && <span className="coverBadge">Cover</span>}
              <div className="photoThumbActions">
                {!photo.is_cover && (
                  <button className="photoBtn" onClick={() => makeCover(photo)} title="Set as cover">⭐</button>
                )}
                <button className="photoBtn danger" onClick={() => remove(photo)} title="Delete">✕</button>
              </div>
              {photo.caption && <p className="photoCaption">{photo.caption}</p>}
            </div>
          ))}
        </div>
      )}

      {loading && <p className="muted">Loading photos...</p>}

      {/* Lightbox */}
      {selected && (
        <div className="lightboxOverlay" onClick={() => { setSelected(null); setShowSendPicker(false); }}>
          <div className="lightbox" onClick={e => e.stopPropagation()}>
            <img src={selected.url} alt={selected.caption || 'Trip photo'} />
            <div className="lightboxFooter">
              <input
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                placeholder="Add a caption..."
              />
              <button className="btn gold" onClick={() => saveCaption(selected)}>Save Caption</button>
              {frames.length > 0 && (
                <button className="btn secondary" onClick={() => setShowSendPicker(s => !s)}>🖼️ Send to Frame</button>
              )}
              <button className="btn secondary" onClick={() => { setSelected(null); setShowSendPicker(false); }}>Close</button>
            </div>

            {showSendPicker && (
              <div className="framePicker">
                <p className="muted" style={{margin:'0 0 .5rem'}}>Send this photo to:</p>
                {frames.map(f => (
                  <label key={f.id} className="frameCheckRow">
                    <input
                      type="checkbox"
                      checked={pickedFrames.includes(f.email)}
                      onChange={e => setPickedFrames(prev => e.target.checked ? [...prev, f.email] : prev.filter(x => x !== f.email))}
                    />
                    {f.name}
                  </label>
                ))}
                <button className="btn gold small" style={{marginTop:'.5rem'}} onClick={sendToFrames} disabled={pickedFrames.length===0 || sendingTo===selected.id}>
                  {sendingTo===selected.id ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
