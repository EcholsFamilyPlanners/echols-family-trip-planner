import { useState, useEffect } from 'react';
import {
  loadItinerary, setItineraryDayCount, updateItineraryDay,
  saveItineraryStop, deleteItineraryStop, syncItineraryToBudget
} from '../services/travelOsService';
import { mapUrl } from '../utils/helpers';

const CATEGORIES = ['Sightseeing','Food','Activity','Transport','Rest'];
const CATEGORY_ICON = { Sightseeing:'🏛️', Food:'🍽️', Activity:'🎯', Transport:'🚗', Rest:'😌' };
const STATUS_OPTIONS = ['Idea','Booked','Confirmed'];
const BLANK_STOP = { destination:'', category:'Sightseeing', time_slot:'', duration_minutes:'', cost:'', reservation_link:'', website:'', notes:'', status:'Idea' };

function money(n) {
  return Number(n||0).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
}

export default function ItineraryBuilder({ tripId }) {
  const [days, setDays] = useState([]);
  const [stopsByDay, setStopsByDay] = useState({});
  const [loading, setLoading] = useState(true);
  const [stopForm, setStopForm] = useState(null); // { dayId, ...stop }
  const [editingDayTitle, setEditingDayTitle] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await loadItinerary(tripId);
    setDays(data.days);
    setStopsByDay(data.stopsByDay);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tripId]);

  const handleDayCountChange = async (count) => {
    await setItineraryDayCount(tripId, count);
    await load();
  };

  const saveStop = async () => {
    if (!stopForm?.destination?.trim()) return alert('Destination is required.');
    const dayStops = stopsByDay[stopForm.dayId] || [];
    const { dayId, ...stopData } = stopForm; // pull dayId out separately
    await saveItineraryStop({
      ...stopData,
      day_id: dayId,              // map camelCase to snake_case for DB
      trip_id: tripId,
      cost: stopForm.cost ? Number(stopForm.cost) : null,
      duration_minutes: stopForm.duration_minutes ? Number(stopForm.duration_minutes) : null,
      sort_order: stopForm.id ? stopForm.sort_order : dayStops.length,
    });
    setStopForm(null);
    await load();
    await syncBudget();
  };

  const removeStop = async (id) => {
    if (!confirm('Remove this stop?')) return;
    await deleteItineraryStop(id);
    await load();
    await syncBudget();
  };

  const syncBudget = async () => {
    setSyncing(true);
    const fresh = await loadItinerary(tripId);
    await syncItineraryToBudget(tripId, fresh.days, fresh.stopsByDay);
    setSyncing(false);
  };

  const saveDayTitle = async (dayId, title) => {
    await updateItineraryDay(dayId, { title });
    setEditingDayTitle(null);
    await load();
  };

  const tripTotalCost = Object.values(stopsByDay).flat().reduce((s, stop) => s + (Number(stop.cost) || 0), 0);

  if (loading) return <p className="muted">Loading itinerary...</p>;

  return (
    <section className="panel itineraryBuilder">
      <div className="itineraryHeader">
        <div>
          <h2>🗺️ Day-by-Day Itinerary</h2>
          <p className="muted">Build your trip day by day. Stop costs automatically roll into your Budget tab.</p>
        </div>
        <div className="itineraryDayPicker">
          <label>Number of Days
            <select value={days.length} onChange={e=>handleDayCountChange(Number(e.target.value))}>
              <option value={0}>—</option>
              {Array.from({length:21},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} day{n!==1?'s':''}</option>)}
            </select>
          </label>
        </div>
      </div>

      {tripTotalCost > 0 && (
        <div className="itineraryTotalBar">
          <span>Total Itinerary Cost</span>
          <b>{money(tripTotalCost)}</b>
          {syncing && <span className="muted" style={{fontSize:'.78rem'}}> · syncing to budget...</span>}
        </div>
      )}

      {days.length === 0 && (
        <p className="muted" style={{marginTop:'1rem'}}>Pick a number of days above to start building your itinerary.</p>
      )}

      <div className="itineraryDays">
        {days.map(day => {
          const stops = (stopsByDay[day.id] || []).sort((a,b)=>a.sort_order-b.sort_order);
          const dayCost = stops.reduce((s,stop)=>s+(Number(stop.cost)||0),0);

          return (
            <div className="itineraryDayCard" key={day.id}>
              <div className="itineraryDayHeader">
                {editingDayTitle === day.id ? (
                  <input
                    className="dayTitleInput"
                    defaultValue={day.title || `Day ${day.day_number}`}
                    autoFocus
                    onBlur={e => saveDayTitle(day.id, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                  />
                ) : (
                  <h3 onClick={()=>setEditingDayTitle(day.id)}>
                    {day.title || `Day ${day.day_number}`} <span className="editPencil">✎</span>
                  </h3>
                )}
                {dayCost > 0 && <span className="dayCostBadge">{money(dayCost)}</span>}
              </div>

              <div className="itineraryStops">
                {stops.map(stop => (
                  <div className={`itineraryStop status-${stop.status.toLowerCase()}`} key={stop.id}>
                    <span className="stopIcon">{CATEGORY_ICON[stop.category]||'📍'}</span>
                    <div className="stopInfo">
                      <b>{stop.destination}</b>
                      <div className="stopMeta">
                        {stop.time_slot && <span>🕐 {stop.time_slot}</span>}
                        {stop.duration_minutes && <span>⏱️ {stop.duration_minutes}m</span>}
                        {stop.cost && <span>💰 {money(stop.cost)}</span>}
                        <span className={`stopStatusPill ${stop.status.toLowerCase()}`}>{stop.status}</span>
                      </div>
                      {stop.notes && <p className="stopNotes">{stop.notes}</p>}
                    </div>
                    <div className="stopActions">
                      <a className="btn secondary small" href={mapUrl(stop.destination)} target="_blank">Map</a>
                      {stop.website && <a className="btn secondary small" href={stop.website} target="_blank">Site</a>}
                      {stop.reservation_link && <a className="btn secondary small" href={stop.reservation_link} target="_blank">Reservation</a>}
                      <button className="btn secondary small" onClick={()=>setStopForm({...stop, dayId: stop.day_id || day.id})}>Edit</button>
                      <button className="btn secondary small danger" onClick={()=>removeStop(stop.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn secondary" style={{marginTop:'.6rem'}} onClick={()=>setStopForm({...BLANK_STOP, dayId: day.id})}>
                + Add Stop
              </button>
            </div>
          );
        })}
      </div>

      {stopForm && (
        <div className="pdfImportOverlay" onClick={()=>setStopForm(null)}>
          <div className="pdfImportModal" onClick={e=>e.stopPropagation()}>
            <div className="pdfImportHeader">
              <h2>{stopForm.id ? 'Edit Stop' : 'New Stop'}</h2>
              <button className="btn secondary small" onClick={()=>setStopForm(null)}>✕</button>
            </div>
            <div className="shortlistFormGrid">
              <label>Destination *<input value={stopForm.destination} onChange={e=>setStopForm({...stopForm,destination:e.target.value})} placeholder="e.g. Eiffel Tower"/></label>
              <label>Category
                <select value={stopForm.category} onChange={e=>setStopForm({...stopForm,category:e.target.value})}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Time<input value={stopForm.time_slot} onChange={e=>setStopForm({...stopForm,time_slot:e.target.value})} placeholder="e.g. 9:00 AM or Morning"/></label>
              <label>Duration (minutes)<input type="number" value={stopForm.duration_minutes} onChange={e=>setStopForm({...stopForm,duration_minutes:e.target.value})} placeholder="90"/></label>
              <label>Cost ($)<input type="number" value={stopForm.cost} onChange={e=>setStopForm({...stopForm,cost:e.target.value})} placeholder="0"/></label>
              <label>Status
                <select value={stopForm.status} onChange={e=>setStopForm({...stopForm,status:e.target.value})}>
                  {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Website<input value={stopForm.website} onChange={e=>setStopForm({...stopForm,website:e.target.value})} placeholder="https://..."/></label>
              <label>Reservation Link<input value={stopForm.reservation_link} onChange={e=>setStopForm({...stopForm,reservation_link:e.target.value})} placeholder="Optional booking link"/></label>
            </div>
            <label style={{display:'flex',flexDirection:'column',gap:'.3rem',marginTop:'.5rem'}}>
              Notes — why this stop?
              <textarea value={stopForm.notes} onChange={e=>setStopForm({...stopForm,notes:e.target.value})} placeholder="Why you want to go here, tips, what to expect..."/>
            </label>
            <div className="formActions" style={{marginTop:'1rem'}}>
              <button className="btn gold" onClick={saveStop}>Save Stop</button>
              <button className="btn secondary" onClick={()=>setStopForm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
