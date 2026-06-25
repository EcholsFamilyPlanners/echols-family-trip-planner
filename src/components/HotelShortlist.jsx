import { useState, useEffect } from 'react';
import { loadTripShortlists, saveHotel, deleteHotel, saveRestaurant, deleteRestaurant } from '../services/travelOsService';
import { mapUrl } from '../utils/helpers';

const BLANK_HOTEL = { name:'', neighborhood:'', price_per_night:'', stars:'', status:'Considering', url:'', notes:'' };
const BLANK_REST  = { name:'', cuisine:'', price_range:'$$', must_try:false, health_rating:'', url:'', notes:'' };
const STATUS_COLORS = { Considering:'', Shortlisted:'shortlisted', Booked:'booked' };

export default function HotelShortlist({ tripId }) {
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelForm, setHotelForm] = useState(null);   // null=hidden, {}=new, {id,...}=editing
  const [restForm, setRestForm]   = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await loadTripShortlists(tripId);
    setHotels(data.hotels);
    setRestaurants(data.restaurants);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tripId]);

  // ── Hotels ──
  const saveH = async () => {
    if (!hotelForm?.name?.trim()) return alert('Hotel name is required.');
    await saveHotel({ ...hotelForm, trip_id: tripId });
    setHotelForm(null);
    await load();
  };

  const deleteH = async (id) => {
    if (!confirm('Remove this hotel?')) return;
    await deleteHotel(id);
    await load();
  };

  // ── Restaurants ──
  const saveR = async () => {
    if (!restForm?.name?.trim()) return alert('Restaurant name is required.');
    await saveRestaurant({ ...restForm, trip_id: tripId });
    setRestForm(null);
    await load();
  };

  const deleteR = async (id) => {
    if (!confirm('Remove this restaurant?')) return;
    await deleteRestaurant(id);
    await load();
  };

  if (loading) return <p className="muted">Loading shortlists...</p>;

  return (
    <div className="shortlistsWrap">

      {/* ── Hotels ── */}
      <section className="panel shortlistPanel">
        <div className="shortlistHeader">
          <h2>🏨 Hotel Shortlist</h2>
          <button className="btn gold" onClick={() => setHotelForm({...BLANK_HOTEL})}>+ Add Hotel</button>
        </div>

        {hotelForm && (
          <div className="shortlistForm">
            <h3>{hotelForm.id ? 'Edit Hotel' : 'New Hotel'}</h3>
            <div className="shortlistFormGrid">
              <label>Name *<input value={hotelForm.name} onChange={e=>setHotelForm({...hotelForm,name:e.target.value})} placeholder="e.g. Fairmont Le Château Frontenac"/></label>
              <label>Neighborhood<input value={hotelForm.neighborhood} onChange={e=>setHotelForm({...hotelForm,neighborhood:e.target.value})} placeholder="e.g. Old City"/></label>
              <label>Price / Night ($)<input type="number" value={hotelForm.price_per_night} onChange={e=>setHotelForm({...hotelForm,price_per_night:e.target.value})} placeholder="325"/></label>
              <label>Stars
                <select value={hotelForm.stars} onChange={e=>setHotelForm({...hotelForm,stars:e.target.value})}>
                  <option value="">—</option>
                  {[3,4,5].map(s=><option key={s} value={s}>{s} ★</option>)}
                </select>
              </label>
              <label>Status
                <select value={hotelForm.status} onChange={e=>setHotelForm({...hotelForm,status:e.target.value})}>
                  {['Considering','Shortlisted','Booked'].map(s=><option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Website / Link<input value={hotelForm.url} onChange={e=>setHotelForm({...hotelForm,url:e.target.value})} placeholder="https://..."/></label>
            </div>
            <label>Notes<textarea value={hotelForm.notes} onChange={e=>setHotelForm({...hotelForm,notes:e.target.value})} placeholder="Why this hotel, pros/cons, cancellation policy..."/></label>
            <div className="formActions">
              <button className="btn gold" onClick={saveH}>Save Hotel</button>
              <button className="btn secondary" onClick={()=>setHotelForm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {hotels.length === 0 && !hotelForm && <p className="muted">No hotels added yet. Click Add Hotel to start your shortlist.</p>}

        <div className="shortlistCards">
          {hotels.map(h => (
            <div key={h.id} className={`shortlistCard ${STATUS_COLORS[h.status]||''}`}>
              <div className="shortlistCardTop">
                <div>
                  <b>{h.name}</b>
                  {h.stars && <span className="stars">{'★'.repeat(h.stars)}</span>}
                  <span className={`statusPill ${h.status.toLowerCase()}`}>{h.status}</span>
                </div>
                <div className="shortlistCardActions">
                  {h.url && <a className="btn secondary small" href={h.url} target="_blank">Website</a>}
                  <a className="btn secondary small" href={mapUrl(h.name)} target="_blank">Map</a>
                  <button className="btn secondary small" onClick={()=>setHotelForm({...h})}>Edit</button>
                  <button className="btn secondary small danger" onClick={()=>deleteH(h.id)}>✕</button>
                </div>
              </div>
              {h.neighborhood && <p className="shortlistMeta">📍 {h.neighborhood}</p>}
              {h.price_per_night && <p className="shortlistMeta">💰 ${Number(h.price_per_night).toLocaleString()} / night</p>}
              {h.notes && <p className="shortlistNotes">{h.notes}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Restaurants ── */}
      <section className="panel shortlistPanel">
        <div className="shortlistHeader">
          <h2>🍽️ Restaurant Shortlist</h2>
          <button className="btn gold" onClick={() => setRestForm({...BLANK_REST})}>+ Add Restaurant</button>
        </div>

        {restForm && (
          <div className="shortlistForm">
            <h3>{restForm.id ? 'Edit Restaurant' : 'New Restaurant'}</h3>
            <div className="shortlistFormGrid">
              <label>Name *<input value={restForm.name} onChange={e=>setRestForm({...restForm,name:e.target.value})} placeholder="e.g. Chez Muffy"/></label>
              <label>Cuisine<input value={restForm.cuisine} onChange={e=>setRestForm({...restForm,cuisine:e.target.value})} placeholder="e.g. French, Seafood"/></label>
              <label>Price Range
                <select value={restForm.price_range} onChange={e=>setRestForm({...restForm,price_range:e.target.value})}>
                  {['$','$$','$$$','$$$$'].map(p=><option key={p}>{p}</option>)}
                </select>
              </label>
              <label>Health Dept Rating
                <select value={restForm.health_rating} onChange={e=>setRestForm({...restForm,health_rating:e.target.value})}>
                  <option value="">Not checked</option>
                  <option value="A">A — Excellent</option>
                  <option value="B">B — Good</option>
                  <option value="C">C — Adequate</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </label>
              <label>Website / Link<input value={restForm.url} onChange={e=>setRestForm({...restForm,url:e.target.value})} placeholder="https://..."/></label>
            </div>
            <label className="toggle" style={{margin:'.5rem 0'}}>
              <input type="checkbox" checked={restForm.must_try} onChange={e=>setRestForm({...restForm,must_try:e.target.checked})}/> Must-Try
            </label>
            <label>Notes<textarea value={restForm.notes} onChange={e=>setRestForm({...restForm,notes:e.target.value})} placeholder="Why this restaurant, best dishes, reservation tips..."/></label>
            <div className="formActions">
              <button className="btn gold" onClick={saveR}>Save Restaurant</button>
              <button className="btn secondary" onClick={()=>setRestForm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {restaurants.length === 0 && !restForm && <p className="muted">No restaurants added yet. Click Add Restaurant to build your list.</p>}

        <div className="shortlistCards">
          {restaurants.map(r => (
            <div key={r.id} className={`shortlistCard ${r.must_try?'mustTry':''}`}>
              <div className="shortlistCardTop">
                <div>
                  <b>{r.name}</b>
                  {r.must_try && <span className="mustTryBadge">⭐ Must Try</span>}
                  <span className="priceRange">{r.price_range}</span>
                </div>
                <div className="shortlistCardActions">
                  {r.url && <a className="btn secondary small" href={r.url} target="_blank">Website</a>}
                  <a className="btn secondary small" href={mapUrl(r.name)} target="_blank">Map</a>
                  <button className="btn secondary small" onClick={()=>setRestForm({...r})}>Edit</button>
                  <button className="btn secondary small danger" onClick={()=>deleteR(r.id)}>✕</button>
                </div>
              </div>
              {r.cuisine && <p className="shortlistMeta">🍴 {r.cuisine}</p>}
              {r.health_rating && <p className="shortlistMeta"><HealthBadge rating={r.health_rating}/></p>}
              {r.notes && <p className="shortlistNotes">{r.notes}</p>}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}


function HealthBadge({ rating }) {
  const map = { A:['#166534','#dcfce7'], B:['#1d4ed8','#dbeafe'], C:['#92400e','#fef3c7'], Pass:['#166534','#dcfce7'], Fail:['#dc2626','#fef2f2'], Unknown:['#6b7280','#f9fafb'] };
  const [color, bg] = map[rating] || ['#6b7280','#f9fafb'];
  return <span style={{ display:'inline-block', padding:'.1rem .5rem', borderRadius:'.4rem', fontSize:'.78rem', fontWeight:700, color, background:bg }}>🏥 Health: {rating}</span>;
}
