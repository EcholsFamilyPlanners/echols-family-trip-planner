import { useState, useEffect, useRef } from 'react';
import { loadTripPhotos, uploadTripPhoto, deleteTripPhoto, setPhotoAsCover, updatePhotoCaption } from '../services/travelOsService';
import { getSession } from '../services/travelOsService';

export default function TripPhotos({ tripId, onCoverChange }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null); // lightbox
  const [editCaption, setEditCaption] = useState('');
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    const data = await loadTripPhotos(tripId);
    setPhotos(data);
    setLoading(false);
    // Notify parent of cover photo
    const cover = data.find(p => p.is_cover);
    if (onCoverChange) onCoverChange(cover?.url || null);
  };

  useEffect(() => { load(); }, [tripId]);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const session = await getSession();
      const isFirst = photos.length === 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) { alert(`${file.name} is over 10MB — please resize it first.`); continue; }
        await uploadTripPhoto({
          tripId, file,
          caption: '',
          isCover: isFirst && i === 0,
          userId: session?.user?.id
        });
      }
      await load();
    } catch(e) {
      alert('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
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
        <div className="lightboxOverlay" onClick={() => setSelected(null)}>
          <div className="lightbox" onClick={e => e.stopPropagation()}>
            <img src={selected.url} alt={selected.caption || 'Trip photo'} />
            <div className="lightboxFooter">
              <input
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                placeholder="Add a caption..."
              />
              <button className="btn gold" onClick={() => saveCaption(selected)}>Save Caption</button>
              <button className="btn secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
